<template>
    <div>
        <NuxtRouteAnnouncer/>
        <UApp>
            <UDashboardGroup>
                <UDashboardPanel :ui="{ body: 'p-0 sm:p-0' }">
                    <template #header>
                        <UDashboardNavbar title="Trading Platform">
                            <template #right>
                                <UColorModeButton/>
                            </template>
                        </UDashboardNavbar>
                    </template>

                    <template #body>
                        <div class="w-full h-full flex">
                            <DrawingToolbar/>
                            <div ref="chartContainer" class="w-full h-full"/>
                        </div>
                    </template>
                </UDashboardPanel>
            </UDashboardGroup>
        </UApp>
    </div>
</template>

<script setup lang="ts">
    import { init, dispose, registerOverlay } from "klinecharts";
    import type { KLineData } from "klinecharts";

    const kline = useKlineStore();
    const overlays = useOverlays();

    const chartContainer = ref<HTMLDivElement | null>(null);
    const resizeObserver = ref<ResizeObserver | null>(null);
    const ws = ref<WebSocket | null>(null);
    const selectedSymbol = ref<string>("BTCUSDT");
    const interval = ref<string>("1m");

    overlays.forEach(overlay => registerOverlay(overlay));

    async function fetchHistoricalData(limit = 1000) {
        if (import.meta.server) return [];
        
        try {
            const url = `https://api.binance.com/api/v3/klines?symbol=${selectedSymbol.value}&interval=${interval.value}&limit=${limit}`;
            const res = await fetch(url);
            const raw = await res.json();

            return raw.map((d: any[]) => ({
                timestamp: d[0],
                open: parseFloat(d[1]),
                high: parseFloat(d[2]),
                low: parseFloat(d[3]),
                close: parseFloat(d[4]),
                volume: parseFloat(d[5]),
            })) as KLineData[];
        } catch (error) {
            console.error("Failed to fetch historical data: ", error);
            return [];
        }
    }

    function connectWebSocket() {
        if (ws.value) ws.value.close();

        const streamName = `${selectedSymbol.value.toLowerCase()}@kline_${interval.value}`;
        const socketUrl = `wss://stream.binance.com:9443/ws/${streamName}`;
        ws.value = new WebSocket(socketUrl);

        ws.value.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.e === "kline") {
                const k = msg.k;
                const data: KLineData = {
                    timestamp: k.t,
                    open: parseFloat(k.o),
                    high: parseFloat(k.h),
                    low: parseFloat(k.l),
                    close: parseFloat(k.c),
                    volume: parseFloat(k.v),
                };

                if (k.x) {
                    // Closed candle
                    kline.chart?.updateData(data);
                } else {
                    // Live updating candle
                    kline.chart?.updateData(data);
                }
            }
        };
    }

    onMounted(async () => {
        if (!chartContainer.value) return;

        kline.chart = init(chartContainer.value);
        if (!kline.chart) return;

        resizeObserver.value = new ResizeObserver(() => {
            if (kline.chart) kline.chart.resize();
        });
        resizeObserver.value.observe(chartContainer.value);

        if (!import.meta.server) {
            const data = await fetchHistoricalData();
            kline.chart.applyNewData(data);
            connectWebSocket();
        }
    });

    onUnmounted(() => {
        resizeObserver.value?.disconnect();
        ws.value?.close();
        if (chartContainer.value) dispose(chartContainer.value);
    });
</script>