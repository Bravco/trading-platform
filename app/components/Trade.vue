<template>
    <div class="border-t border-muted">
        <div class="flex items-center justify-between gap-2 p-2">
            <UButton
                :label="isMarket ? 'Market' : 'Pending'"
                icon="i-lucide-arrow-up-down"
                size="sm"
                variant="outline"
                color="neutral"
                @click="isMarket = !isMarket"
            />
            <UButton
                :icon="collapsed ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                size="sm"
                variant="soft"
                color="neutral"
                @click="collapsed = !collapsed"
            />
        </div>
        <div v-if="collapsed" class="grid grid-cols-[1fr_2fr_1fr] gap-2 p-2 border-t border-muted">
            <span class="text-start mt-auto text-xs text-success font-medium">{{ ask?.toFixed(2) }}</span>
            <span class="text-center mt-auto text-xs text-muted font-medium">Margin</span>
            <span class="text-end mt-auto text-xs text-error font-medium">{{ bid?.toFixed(2) }}</span>
            <UButton @click="buy" :disabled="isLoading" label="BUY" color="success" :ui="{ base: 'justify-center' }"/>
            <UInputNumber v-model="size" :min="0.01" :max="10" :step="0.01" color="neutral"/>
            <UButton @click="sell" :disabled="isLoading" label="SELL" color="error" :ui="{ base: 'justify-center' }"/>
        </div>
        <div v-else class="flex flex-col gap-2 p-2 border-t border-muted">
            <UTabs
                v-model="direction"
                :items="directionItems"
                :color="direction === 'buy' ? 'success' : 'error'"
                :ui="{ root: 'gap-0' }"
            />
            <span class="text-center text-xs text-muted font-medium">Margin</span>
            <UInputNumber v-model="size" :min="0.01" :max="10" :step="0.01" color="neutral"/>
            <UButton
                :label="`Execute ${direction.toUpperCase()} ${size} @ ${(direction === 'buy' ? ask : bid)?.toFixed(2)}`"
                :color="direction === 'buy' ? 'success' : 'error'"
                class="justify-center"
                @click="execute"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
    import type { Nullable } from 'klinecharts';
    import type { TabsItem } from "@nuxt/ui";
    
    const kline = useKlineStore();

    const ws = ref<Nullable<WebSocket>>(null);
    const bid = ref<Nullable<number>>(null);
    const ask = ref<Nullable<number>>(null);
    const isLoading = ref<boolean>(false);
    const collapsed = ref<boolean>(true);
    const isMarket = ref<boolean>(true);
    const size = ref<number>(0.01);
    const direction = ref<"buy" | "sell">("buy");

    const directionItems: TabsItem[] = [
        { label: "BUY", value: "buy" },
        { label: "SELL", value: "sell" }
    ];

    watch(() => kline.symbol, (newSymbol, oldSymbol) => {
        if (!newSymbol) return;
        initBookTickerStream();
    }, { immediate: true });

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
            } catch (e) {
                console.error("Failed to parse bookTicker data:", e);
            }
        };
    }

    async function buy() {
        if (isLoading.value || !ask.value) return;
        try {
            isLoading.value = true;
            const order: Order = {
                symbol: kline.symbol,
                direction: "buy",
                price: ask.value,
                size: size.value,
                timestamp: Date.now()
            };

            if (kline.chart) {
                const id = kline.chart.createOverlay({
                    name: "orderLine",
                    extendData: { direction: "buy", price: ask.value },
                    points: [{}]
                }) as Nullable<string>;
                order.orderLineId = id;
            }

            kline.orders.push(order);
        } finally {
            isLoading.value = false;
        }
    }

    async function sell() {
        if (isLoading.value || !bid.value) return;
        try {
            isLoading.value = true;
            const order: Order = {
                symbol: kline.symbol,
                direction: "sell",
                price: bid.value,
                size: size.value,
                timestamp: Date.now()
            };

            if (kline.chart) {
                const id = kline.chart.createOverlay({
                    name: "orderLine",
                    extendData: { direction: "sell", price: bid.value },
                    points: [{}]
                }) as Nullable<string>;
                order.orderLineId = id;
            }

            kline.orders.push(order);
        } finally {
            isLoading.value = false;
        }
    }

    function execute() {
        if (direction.value === "buy") buy();
        else if (direction.value === "sell") sell();
    }

    onUnmounted(() => {
        kline.orders.forEach((o: Order) => kline.disconnectSymbol(o.symbol));
        
        if (ws.value) {
            ws.value.close();
            ws.value = null;
        }
    });
</script>