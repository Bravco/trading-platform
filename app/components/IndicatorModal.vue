<template>
    <UModal
        v-model:open="modal"
        title="Indicators"
        :description="`Count: ${indicators.length}`"
    >
        <UButton
            icon="i-lucide-square-function"
            label="Indicators"
            variant="ghost"
            color="neutral"
        />
        <template #body>
            <div class="sticky top-0 mb-4">
                <UInput
                    v-model="search"
                    icon="i-lucide-search"
                    class="w-full"
                >
                    <template v-if="search?.length" #trailing>
                        <UButton
                            icon="i-lucide-x"
                            size="sm"
                            variant="link"
                            color="neutral"
                            aria-label="Clear search input"
                            @click="search = ''"
                        />
                    </template>
                </UInput>
            </div>
            <div class="flex flex-col gap-2">
                <UButton
                    v-for="indicator in searchedIndicators"
                    :key="indicator.name"
                    :label="indicator.label"
                    :variant="isIndicatorActive(indicator.name) ? 'subtle' : 'outline'"
                    :color="isIndicatorActive(indicator.name) ? 'primary' : 'neutral'"
                    @click="toggleIndicator(indicator.name, indicator.stackable)"
                />
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
    import type { IndicatorTooltipData } from "klinecharts";

    const kline = useKlineStore();

    const modal = ref<boolean>(false);
    const search = ref<string>("");
    const indicators = ref([
        { name: "AVP", label: "Average Price", stackable: false },
        { name: "AO", label: "Awesome Oscillator", stackable: false },
        { name: "BIAS", label: "Bias Ratio", stackable: false },
        { name: "BOLL", label: "Bollinger Bands", stackable: true },
        { name: "BRAR", label: "BR and AR Indicator", stackable: false },
        { name: "BBI", label: "Bull and Bear Index", stackable: true },
        { name: "CCI", label: "Commodity Channel Index", stackable: false },
        { name: "CR", label: "CR Indicator (Price Momentum)", stackable: false },
        { name: "DMA", label: "Difference of Moving Averages", stackable: false },
        { name: "DMI", label: "Directional Movement Index", stackable: false },
        { name: "EMV", label: "Ease of Movement", stackable: false },
        { name: "EMA", label: "Exponential Moving Average", stackable: true },
        { name: "MTM", label: "Momentum Indicator", stackable: false },
        { name: "MA", label: "Moving Average", stackable: true },
        { name: "MACD", label: "Moving Average Convergence Divergence", stackable: false },
        { name: "OBV", label: "On-Balance Volume", stackable: false },
        { name: "PVT", label: "Price Volume Trend", stackable: false },
        { name: "PSY", label: "Psychological Line", stackable: false },
        { name: "ROC", label: "Rate of Change", stackable: false },
        { name: "RSI", label: "Relative Strength Index", stackable: false },
        { name: "SMA", label: "Simple Moving Average", stackable: true },
        { name: "KDJ", label: "Stochastic Indicator (KDJ)", stackable: false },
        { name: "SAR", label: "Parabolic SAR", stackable: true },
        { name: "TRIX", label: "Triple Exponential Average", stackable: false },
        { name: "VOL", label: "Volume", stackable: false },
        { name: "VR", label: "Volume Ratio", stackable: false },
        { name: "WR", label: "Williams %R", stackable: false }
    ]);

    const searchedIndicators = computed(() => indicators.value.filter(indicator => 
        indicator.name.toLowerCase().includes(search.value.toLowerCase()) ||
        indicator.label.toLowerCase().includes(search.value.toLowerCase())
    ));

    watch(modal, () => {
        search.value = "";
    });

    function toggleIndicator(name: string, stackable: boolean) {
        if (!kline.chart) return;

        const index = kline.activeIndicators.findIndex(i => i.name === name);
        const indicator = kline.activeIndicators[index];
        if (index !== -1 && indicator) {
            kline.chart.removeIndicator(indicator.paneId, name);
            kline.activeIndicators.splice(index, 1);
            return;
        }

        const paneId = kline.chart.createIndicator({
            name,
            createTooltipDataSource: ({ indicator }) => ({
                icons: [
                    getIconStyle("settings", "\ue994"),
                    indicator.visible
                        ? getIconStyle("invisible", "\ue9ce")  
                        : getIconStyle("visible", "\ue9d1"),
                    getIconStyle("remove", "\ue9ac")
                ]
            }) as IndicatorTooltipData
        }, true, { id: stackable ? "candle_pane" : undefined });
        if (paneId) kline.activeIndicators.push({ name, paneId });
    }

    const getIconStyle = (id: string, icon: string) => ({
        id,
        position: "middle",
        marginRight: 8,
        size: 14,
        color: "#76808F",
        activeColor: "#76808F",
        backgroundColor: "transparent",
        activeBackgroundColor: "rgba(22, 119, 255, 0.15)",
        fontFamily: "icomoon",
        icon
    });

    const isIndicatorActive = (name: string): boolean => {
        return kline.activeIndicators.some(i => i.name === name);
    };
</script>