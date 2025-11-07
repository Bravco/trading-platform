<template>
    <div class="border-t border-muted">
        <div class="flex items-center justify-between gap-2 p-2">
            <UButton
                :label="isMarket ? 'Market' : 'Pending'"
                icon="i-lucide-arrow-up-down"
                size="sm"
                variant="outline"
                color="neutral"
                @click="toggleIsMarket"
            />
            <UButton
                :icon="collapsed ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                size="sm"
                :variant="collapsed ? 'soft' : 'solid'"
                color="neutral"
                @click="collapsed = !collapsed;"
            />
        </div>
        <div v-if="collapsed" class="grid grid-cols-[1fr_2fr_1fr] gap-2 p-2 border-t border-muted">
            <span class="text-start mt-auto text-xs text-success font-medium">{{ kline.bookTickers[kline.symbol]?.ask.toFixed(2) }}</span>
            <span class="text-center mt-auto text-xs text-muted font-medium">Margin</span>
            <span class="text-end mt-auto text-xs text-error font-medium">{{ kline.bookTickers[kline.symbol]?.bid.toFixed(2) }}</span>
            <UButton @click="buy" label="BUY" color="success" :ui="{ base: 'justify-center' }"/>
            <UInputNumber v-model="size" :min="0.01" :max="10" :step="0.01" :format-options="{ minimumFractionDigits: 2 }" color="neutral"/>
            <UButton @click="sell" label="SELL" color="error" :ui="{ base: 'justify-center' }"/>
        </div>
        <div v-else class="flex flex-col gap-2 p-2 border-t border-muted">
            <UFormField label="Price" :ui="{ label: 'text-xs text-muted' }">
                <UInputNumber v-model="pendingPrice" :disabled="isMarket" :min="0" :format-options="{ minimumFractionDigits: 2 }" color="neutral" class="w-full"/>
            </UFormField>
            <UTabs
                v-model="direction"
                :items="directionItems"
                :color="direction === 'buy' ? 'success' : 'error'"
                :ui="{ root: 'gap-0' }"
            />
            <span class="text-center text-xs text-muted font-medium">Margin</span>
            <UInputNumber v-model="size" :min="0.01" :max="10" :step="0.01" :format-options="{ minimumFractionDigits: 2 }" color="neutral"/>
            <UButton
                :label="executeLabel"
                :color="direction === 'buy' ? 'success' : 'error'"
                class="justify-center"
                @click="execute"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
    import type { Nullable } from "klinecharts";
    import type { TabsItem } from "@nuxt/ui";
    
    const kline = useKlineStore();

    const collapsed = ref<boolean>(true);
    const isMarket = ref<boolean>(true);
    const pendingPrice = ref<number>(0);
    const pendingLineId = ref<Nullable<string>>(null);
    const size = ref<number>(0.1);
    const direction = ref<"buy" | "sell">("buy");

    const directionItems: TabsItem[] = [
        { label: "BUY", value: "buy" },
        { label: "SELL", value: "sell" }
    ];

    const executeLabel = computed(() => {
        const price = (isMarket.value
            ? direction.value === 'buy' ? kline.bookTickers[kline.symbol]?.ask : kline.bookTickers[kline.symbol]?.bid
            : pendingPrice.value)?.toFixed(2) ?? 0;

        return `Execute ${direction.value.toUpperCase()} ${size.value.toFixed(2)} @ ${price}`;
    });

    watch(() => kline.symbol, () => {
        pendingPrice.value = kline.prices[kline.symbol] ?? 0;
    });

    watch(() => kline.prices[kline.symbol], (price) => {
        if (!price || pendingPrice.value !== 0) return;
        pendingPrice.value = price;
    });

    watch(pendingPrice, (newPrice, _oldPrice) => {
        if (newPrice && kline.chart && pendingLineId.value) {
            kline.chart.overrideOverlay({
                id: pendingLineId.value,
                points: [{ value: newPrice }]
            });
        }
    });

    function toggleIsMarket() {
        isMarket.value = !isMarket.value;

        if (!kline.chart) return;

        if (isMarket.value) {
            kline.chart.removeOverlay({ name: "pendingLine" });
            pendingLineId.value = null;
        } else {
            pendingLineId.value = kline.chart.createOverlay({
                name: "pendingLine",
                points: [{ value: pendingPrice.value }],
                onPressedMoveEnd: (event) => {
                    const v = event.overlay.points[0]?.value ?? event.overlay.extendData.price;
                    if (v) pendingPrice.value = parseFloat(v.toFixed(2));
                    return true;
                }
            }) as Nullable<string>;
        }
    }

    function buy() {
        if (isMarket.value) {
            kline.marketBuy(kline.symbol, size.value);
        } else if (!isMarket.value) {
            kline.pendingOrder(kline.symbol, "buy", pendingPrice.value, size.value, pendingLineId.value);
            pendingLineId.value = null;
        }
        isMarket.value = true;
    }

    function sell() {
        if (isMarket.value) {
            kline.marketSell(kline.symbol, size.value);
        } else if (!isMarket.value) {
            kline.pendingOrder(kline.symbol, "sell", pendingPrice.value, size.value, pendingLineId.value);
            pendingLineId.value = null;
        }
        isMarket.value = true;
    }

    function execute() {
        if (isMarket.value) {
            if (direction.value === "buy") {
                kline.marketBuy(kline.symbol, size.value);
            } else if (direction.value === "sell") {
                kline.marketSell(kline.symbol, size.value);
            }
        } else {
            kline.pendingOrder(kline.symbol, direction.value, pendingPrice.value, size.value, pendingLineId.value);
            pendingLineId.value = null;
        }
        isMarket.value = true;
    }
</script>