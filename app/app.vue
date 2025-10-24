<template>
    <div>
        <NuxtRouteAnnouncer/>
        <UApp>
            <UDashboardGroup>
                <UDashboardPanel :ui="{ body: 'p-0 sm:p-0' }">
                    <template #body>
                        <div class="w-full h-full flex flex-col">
                            <TopBar/>
                            <div class="w-full h-full flex">
                                <DrawingToolbar/>
                                <div ref="chartContainer" class="w-full h-full"/>
                            </div>
                        </div>
                    </template>
                </UDashboardPanel>
            </UDashboardGroup>
        </UApp>
    </div>
</template>

<script setup lang="ts">
    import { init, dispose, registerOverlay, ActionType } from "klinecharts";
    import type { KLineData } from "klinecharts";

    const kline = useKlineStore();
    const overlays = useOverlays();

    const chartContainer = ref<HTMLDivElement | null>(null);
    const resizeObserver = ref<ResizeObserver | null>(null);
    const ws = ref<WebSocket | null>(null);
    
    overlays.forEach(overlay => registerOverlay(overlay));

    watch(
        [() => kline.symbol, () => kline.interval],
        async ([_oldInterval, _oldSymbol], [_newInterval, _newSymbol]) => {
            if (!kline.chart) return;

            const data = await fetchHistoricalData();
            kline.chart.applyNewData(data);
            connectWebSocket();
        }
    );

    async function fetchHistoricalData(limit = 1000) {
        if (import.meta.server) return [];
        
        try {
            const url = `https://api.binance.com/api/v3/klines?symbol=${kline.symbol}&interval=${kline.interval}&limit=${limit}`;
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
        if (ws.value) {
            ws.value.close();
            ws.value = null;
        }

        const streamName = `${kline.symbol.toLowerCase()}@kline_${kline.interval}`;
        const socketUrl = `wss://stream.binance.com:9443/ws/${streamName}`;

        try {
            ws.value = new WebSocket(socketUrl);
        } catch (error) {
            console.error("Failed to create WebSocket: ", error);
            return;
        }

        ws.value.onmessage = (event) => {
            try {
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
            } catch (error)  {
                console.error("WebSocket error: ", error);
            }
        };
    }

    onMounted(async () => {
        if (!chartContainer.value) return;

        kline.chart = init(chartContainer.value);
        if (!kline.chart) return;

        kline.chart.subscribeAction(ActionType.OnTooltipIconClick, data => {
            if (kline.chart && data.iconId && data.indicatorName && data.paneId) {
                switch (data.iconId) {
                    case "settings":
                        break;
                    
                    case "visible":
                        kline.chart.overrideIndicator({ name: data.indicatorName, visible: true }, data.paneId);
                        break;

                    case "invisible":
                        kline.chart.overrideIndicator({ name: data.indicatorName, visible: false }, data.paneId);
                        break;
                    
                    case "remove":
                        kline.chart.removeIndicator(data.paneId, data.indicatorName);
                        break;
                }
            }
        })

        resizeObserver.value = new ResizeObserver(() => {
            if (kline.chart) kline.chart.resize();
        });
        resizeObserver.value.observe(chartContainer.value);

        if (import.meta.client) {
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