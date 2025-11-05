<template>
    <div class="border-t border-muted">
        <div class="flex items-center justify-between gap-2 p-2">
            <UButton
                :label="isMarket ? 'Market' : 'Pending'"
                icon="i-lucide-arrow-up-down"
                size="sm"
                variant="outline"
                color="neutral"
                @click="switchOrderType"
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
            <span class="text-start mt-auto text-xs text-success font-medium">{{ ask?.toFixed(2) }}</span>
            <span class="text-center mt-auto text-xs text-muted font-medium">Margin</span>
            <span class="text-end mt-auto text-xs text-error font-medium">{{ bid?.toFixed(2) }}</span>
            <UButton @click="buy" label="BUY" color="success" :ui="{ base: 'justify-center' }"/>
            <UInputNumber v-model="size" :min="0.01" :max="10" :step="0.01" :format-options="{ minimumFractionDigits: 2 }" color="neutral"/>
            <UButton @click="sell" label="SELL" color="error" :ui="{ base: 'justify-center' }"/>
        </div>
        <div v-else class="flex flex-col gap-2 p-2 border-t border-muted">
            <UFormField label="Price" :ui="{ label: 'text-xs text-muted' }">
                <UInputNumber v-model="pendingPrice" :disabled="isMarket" :format-options="{ minimumFractionDigits: 2 }" color="neutral" class="w-full"/>
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

    const ws = ref<Nullable<WebSocket>>(null);
    const bid = ref<Nullable<number>>(null);
    const ask = ref<Nullable<number>>(null);
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
            ? direction.value === 'buy' ? ask.value : bid.value
            : pendingPrice.value)?.toFixed(2) ?? 0;

        return `Execute ${direction.value.toUpperCase()} ${size.value.toFixed(2)} @ ${price}`;
    });

    watch(() => kline.symbol, (newSymbol, _oldSymbol) => {
        if (!newSymbol) return;
        initBookTickerStream();
    }, { immediate: true });

    watch(pendingPrice, (newPrice, _oldPrice) => {
        if (newPrice && kline.chart && pendingLineId.value) {
            kline.chart.overrideOverlay({
                id: pendingLineId.value,
                points: [{ value: newPrice }]
            });
        }
    });

    function switchOrderType() {
        isMarket.value = !isMarket.value;

        if (!kline.chart) return;

        if (isMarket.value) {
            kline.chart.removeOverlay({ name: "pendingLine" });
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

    function initBookTickerStream() {
        if (ws.value) {
            ws.value.close();
            ws.value = null;
        }

        const url = `wss://stream.binance.com:9443/ws/${kline.symbol.toLowerCase()}@bookTicker`;
        ws.value = new WebSocket(url);

        ws.value.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                bid.value = parseFloat(data.b);
                ask.value = parseFloat(data.a);
                if (pendingPrice.value === 0) {
                    pendingPrice.value = direction.value === "buy" ? ask.value : bid.value;
                }
            } catch (e) {
                console.error("Failed to parse bookTicker data:", e);
            }
        };
    }

    function buy() {
        if (!ask.value) return;

        const order: Order = {
            symbol: kline.symbol,
            direction: "buy",
            price: ask.value,
            size: size.value,
            timestamp: Date.now()
        };

        if (kline.chart) {
            order.orderLineId =  kline.chart.createOverlay({
                name: "orderLine",
                extendData: { direction: "buy", price: ask.value },
                points: [{}]
            }) as Nullable<string>;
        }

        kline.orders.push(order);
    }

    function sell() {
        if (!bid.value) return;

        const order: Order = {
            symbol: kline.symbol,
            direction: "sell",
            price: bid.value,
            size: size.value,
            timestamp: Date.now()
        };

        if (kline.chart) {
            order.orderLineId = kline.chart.createOverlay({
                name: "orderLine",
                extendData: { direction: "sell", price: bid.value },
                points: [{}]
            }) as Nullable<string>;
        }

        kline.orders.push(order);
    }

    function execute() {
        if (direction.value === "buy") buy();
        else sell();
    }

    onUnmounted(() => {
        kline.orders.forEach((o: Order) => kline.disconnectSymbol(o.symbol));
        
        if (ws.value) {
            ws.value.close();
            ws.value = null;
        }
    });
</script>