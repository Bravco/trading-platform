<template>
    <div class="flex flex-col">
        <UPopover
            v-model:open="popover"
            :ui="{ content: 'flex flex-col' }"
            arrow
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
        </UPopover>
    </div>
</template>

<script lang="ts" setup>
    import type { CandleType } from "klinecharts";

    const kline = useKlineStore();

    const popover = ref<boolean>(false);

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
            popover.value = false;
            if (!kline.chart || !type) return;
            kline.chart.setStyles({ candle: { type: type.value as CandleType } });
        }
    });
</script>