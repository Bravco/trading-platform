<template>
    <div>
        <NuxtRouteAnnouncer/>
        <UApp>
            <UDashboardGroup>
                <UDashboardPanel :default-size="80">
                    <template #header>
                        <UDashboardNavbar :title="selectedSymbol"/>
                    </template>

                    <template #body>
                        <div ref="chartContainer" class="w-full h-full"/>
                    </template>
                </UDashboardPanel>
                <UDashboardPanel :default-size="20">
                    <template #header>
                        <UDashboardNavbar title="Watchlist">
                            <template #right>
                                <UColorModeButton/>
                            </template>
                        </UDashboardNavbar>
                    </template>

                    <template #body>
                        <ul class="flex flex-wrap gap-2">
                            <UButton
                                v-for="item in watchlist"
                                :key="item"
                                :label="item"
                                color="neutral"
                                class="cursor-pointer"
                                :active="true"
                                @click="selectSymbol(item)"
                            />
                        </ul>
                    </template>
                </UDashboardPanel>
            </UDashboardGroup>
        </UApp>
    </div>
</template>

<script setup lang="ts">
    import { CandlestickSeries, createChart } from "lightweight-charts";
    import type { IChartApi, ISeriesApi, CandlestickData, Time } from "lightweight-charts";

    const watchlist = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];

    const colorMode = useColorMode();

    const chartContainer = ref<HTMLDivElement | null>(null);
    const ws = ref<WebSocket | null>(null);
    const selectedSymbol = ref<string>(watchlist[0]!);
    const interval = ref<string>("1m");

    let chart: IChartApi;
    let candleSeries: ISeriesApi<"Candlestick">;
    let currentCandle: CandlestickData | undefined = undefined;
    let currentRequestId: number = 0;

    // ------------------
    // Fetch historical data
    // ------------------
    async function fetchHistoricalCandles(symbol: string, limit = 1000) {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval.value}&limit=${limit}`;
        const rawData = await $fetch<any[]>(url);
        return rawData.map((c: any) => ({
            time: c[0] / 1000,
            open: parseFloat(c[1]),
            high: parseFloat(c[2]),
            low: parseFloat(c[3]),
            close: parseFloat(c[4])
        })) as CandlestickData[];
    }

    // ------------------
    // Apply theme
    // ------------------
    function applyChartTheme() {
        if (!chart) return;

        const isDark = colorMode.value === "dark";

        chart.applyOptions({
            layout: {
                background: { color: isDark ? "#1e1e1e" : "#ffffff" },
                textColor: isDark ? "#ffffff" : "#000000"
            },
            grid: {
                vertLines: { color: isDark ? "#444444" : "#e0e0e0" },
                horzLines: { color: isDark ? "#444444" : "#e0e0e0" }
            },
            crosshair: {
                vertLine: { color: isDark ? "#777" : "#333" },
                horzLine: { color: isDark ? "#777" : "#333" }
            },
            rightPriceScale: {
                borderColor: isDark ? "#555" : "#ccc"
            },
            timeScale: {
                borderColor: isDark ? "#555" : "#ccc"
            }
        });
    }

    // ------------------
    // Change symbol
    // ------------------
    async function selectSymbol(symbol: string, initial: boolean = false) {
        if (!initial && selectedSymbol.value === symbol) return;
        
        selectedSymbol.value = symbol;

        if (ws.value) {
            ws.value.close();
        }

        const requestId = ++currentRequestId;

        const data = await fetchHistoricalCandles(symbol);

        if (requestId !== currentRequestId) return;

        candleSeries.setData(data);
        currentCandle = data.length ? data[data.length - 1] : undefined;
        chart.timeScale().fitContent();

        ws.value = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval.value}`);

        ws.value.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.e === "kline") {
                const k = msg.k;
                const candleTime = k.t / 1000;
                const priceData: CandlestickData = {
                    time: candleTime as Time,
                    open: parseFloat(k.o),
                    high: parseFloat(k.h),
                    low: parseFloat(k.l),
                    close: parseFloat(k.c)
                };

                if (k.x) {
                    currentCandle = priceData;
                    candleSeries.update(currentCandle);
                } else {
                    currentCandle = currentCandle || priceData;
                    currentCandle.high = Math.max(currentCandle.high, priceData.high);
                    currentCandle.low = Math.min(currentCandle.low, priceData.low);
                    currentCandle.close = priceData.close;
                    candleSeries.update(currentCandle);
                }
            }
        };
    }

    onMounted(async () => {
        if (!chartContainer.value) return;
        
        chart = createChart(chartContainer.value, {
            timeScale: { timeVisible: true, secondsVisible: true },
            autoSize: true
        });

        candleSeries = chart.addSeries(CandlestickSeries);

        await selectSymbol(selectedSymbol.value, true);

        applyChartTheme();
        watch(() => colorMode.value, () => applyChartTheme());
    });

    onBeforeUnmount(() => {
        if (ws.value) {
            ws.value.close();
        }
    });
</script>