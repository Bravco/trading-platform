<template>
    <div class="w-full h-full flex flex-col">
        <TopBar/>
        <div class="w-full min-h-0 flex flex-1">
            <DrawingToolbar/>
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

    watch(
        () => [kline.symbol, kline.interval],
        async ([newSymbol, _newInterval], [oldSymbol, _oldInterval]) => {
            if (!kline.chart) return;
            
            if (oldSymbol !== newSymbol && kline.orders.findIndex(o => o.symbol === oldSymbol) === -1)
                kline.disconnectSymbol(oldSymbol!);

            const data = await kline.fetchHistoricalData(newSymbol!);
            kline.chart.applyNewData(data);
            kline.connectSymbol(newSymbol!);
        }
    );

    watch(() => colorMode.value, () => {
        if (kline.chart) kline.chart.setStyles(kline.getThemeStyles());
    });

    onMounted(async () => {
        if (!chartContainer.value) return;
        kline.chart = init(chartContainer.value, { styles: kline.getThemeStyles() });

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
        kline.connectSymbol(kline.symbol);
    });

    onUnmounted(() => {
        resizeObserver.value?.disconnect();
        kline.disconnectSymbol(kline.symbol);
        if (chartContainer.value) dispose(chartContainer.value);
    });
</script>