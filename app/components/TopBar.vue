<template>
    <div class="flex border-b border-b-muted overflow-x-auto">
        <div class="grid place-items-center font-medium">
            <SymbolModal/>
        </div>
        <USeparator orientation="vertical"/>
        <div class="w-full flex items-center gap-2 p-2">
            <UButton
                v-for="(timeframe, index) in timeframes"
                :key="index"
                :label="timeframe"
                :variant="kline.interval === timeframe ? 'soft' : 'ghost'"
                color="neutral"
                square
                @click="selectTimeframe(timeframe)"
            />
            <USeparator orientation="vertical"/>
            <UTooltip
                :delay-duration="0"
                arrow
                :ui="{ content: 'h-auto flex-col' }"
            >
                <UButton
                    :icon="candleType?.icon"
                    variant="ghost"
                    color="neutral"
                    square
                />
                <template #content>
                    <UButton
                        v-for="(item, index) in candleTypes"
                        :key="index"
                        :icon="item.icon"
                        variant="ghost"
                        color="neutral"
                        :label="item.label"
                        :ui="{ base: 'w-full' }"
                        @click="candleType = item"
                    />
                </template>
            </UTooltip>
            <USeparator orientation="vertical"/>
            <TimezoneModal/>
            <UColorModeButton class="ml-auto"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import type { CandleType } from "klinecharts";

    const kline = useKlineStore();
    
    const timeframes = ["1s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"];
    const candleTypes = [
        { value: "candle_solid", label: "Candlestick", icon: "i-lucide-candlestick-chart" },
        { value: "ohlc", label: "OHLC", icon: "i-lucide-bar-chart-4" },
        { value: "area", label: "Area", icon: "i-lucide-area-chart" }
    ];

    const candleType = computed({
        get: () => {
            const current = kline.chart?.getStyles().candle.type;
            return candleTypes.find(ct => ct.value === current) ?? candleTypes[0];
        },
        set: (type) => {
            if (!kline.chart || !type) return;
            kline.chart.setStyles({ candle: { type: type.value as CandleType } });
        }
    });

    function selectTimeframe(timeframe: string) {
        if (kline.interval === timeframe) return;
        kline.interval = timeframe;
    }
</script>