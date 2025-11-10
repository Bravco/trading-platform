<template>
    <div class="w-full h-full flex flex-col">
        <ChartTopBar/>
        <div class="w-full min-h-0 flex flex-1">
            <ChartDrawingToolbar/>
            <div ref="chartContainer" class="w-full h-full"/>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { init, dispose, ActionType } from "klinecharts";

    const kline = useKlineStore();
    const colorMode = useColorMode();

    const chartContainer = ref<HTMLDivElement | null>(null);
    const resizeObserver = ref<ResizeObserver | null>(null);

    watch(() => [kline.symbol, kline.interval], async () => {
        if (!kline.chart) return;
        const data = await kline.fetchHistoricalData(kline.symbol);
        kline.chart.applyNewData(data);
    });

    watch(() => kline.symbol, () => {
        if (!kline.chart) return;
        kline.chart.scrollToRealTime();
        kline.chart.removeOverlay({ groupId: "orders" });
        kline.positions.forEach(p => {
            if (kline.symbol === p.symbol) kline.drawEntryLine(p);
        });
        kline.pendingOrders.forEach(o => {
            if (kline.symbol === o.symbol) kline.drawPendingEntryLine(o);
        });
    });

    watch(() => colorMode.value, () => {
        if (kline.chart) kline.chart.setStyles(kline.getThemeStyles());
    });

    onMounted(async () => {
        if (!chartContainer.value) return;

        // Hiding klinecharts welcome message
        const originalLog = console.log;
        console.log = (...args) => {
            if (typeof args[0] === 'string' && args[0].includes('Welcome to klinecharts')) return;
            if (typeof args[0] === 'string' && args[0].includes('Version is')) return;
            originalLog(...args);
        };

        kline.chart = init(chartContainer.value, { styles: kline.getThemeStyles() });

        // Restore console.log
        console.log = originalLog;

        if (!kline.chart) return;
        kline.chart.subscribeAction(ActionType.OnTooltipIconClick, data => {
            if (kline.chart && data.iconId && data.indicatorName && data.paneId) {
                switch (data.iconId) {
                    case "settings":
                        kline.editedIndicator = {
                            name: data.indicatorName,
                            paneId: data.paneId
                        };
                        break;
                    
                    case "visible":
                        kline.chart.overrideIndicator({ name: data.indicatorName, visible: true }, data.paneId);
                        break;

                    case "invisible":
                        kline.chart.overrideIndicator({ name: data.indicatorName, visible: false }, data.paneId);
                        break;
                    
                    case "remove":
                        kline.chart.removeIndicator(data.paneId, data.indicatorName);
                        const index = kline.activeIndicators.findIndex(i => 
                            i.name === data.indicatorName
                            && i.paneId === data.paneId
                        );
                        if (index !== -1) kline.activeIndicators.splice(index, 1);
                        break;
                }
            }
        })

        resizeObserver.value = new ResizeObserver(() => {
            if (kline.chart) kline.chart.resize();
        });
        resizeObserver.value.observe(chartContainer.value);

        const data = await kline.fetchHistoricalData(kline.symbol);
        kline.chart.applyNewData(data);
    });

    onUnmounted(() => {
        resizeObserver.value?.disconnect();
        if (chartContainer.value) dispose(chartContainer.value);
    });
</script>