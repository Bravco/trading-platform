<template>
    <div class="grid grid-cols-[1fr_2fr_1fr] gap-2 p-2 border-t border-muted">
        <UButton @click="buy" :disabled="isLoading" label="BUY" color="success" :ui="{ base: 'justify-center' }"/>
        <UInputNumber v-model="positionSize" :min="0.01" :max="10" :step="0.01" color="neutral"/>
        <UButton @click="sell" :disabled="isLoading" label="SELL" color="error" :ui="{ base: 'justify-center' }"/>
    </div>
</template>

<script lang="ts" setup>
    const kline = useKlineStore();

    const positionSize = ref<number>(0.01);
    const isLoading = ref<boolean>(false);

    async function getBidAsk() {
        const url = `https://api.binance.com/api/v3/ticker/bookTicker?symbol=${kline.symbol}`;
        const res = await fetch(url);
        return await res.json();
    }

    async function buy() {
        if (isLoading.value) return;
        try {
            isLoading.value = true;
            const { askPrice } = await getBidAsk();
            const price = parseFloat(askPrice);

            kline.orders.push({
                symbol: kline.symbol,
                direction: "buy",
                price,
                size: positionSize.value,
                timestamp: Date.now()
            });

            if (kline.chart) {
                kline.chart.createOverlay({
                    name: "orderLine",
                    extendData: { direction: "buy", price },
                    points: [{}]
                });
            }
        } finally {
            isLoading.value = false;
        }
    }

    async function sell() {
        if (isLoading.value) return;
        try {
            isLoading.value = true;
            const { bidPrice } = await getBidAsk();
            const price = parseFloat(bidPrice);

            kline.orders.push({
                symbol: kline.symbol,
                direction: "sell",
                price,
                size: positionSize.value,
                timestamp: Date.now()
            });

            if (kline.chart) {
                kline.chart.createOverlay({
                    name: "orderLine",
                    extendData: { direction: "sell", price },
                    points: [{}]
                });
            }
        } finally {
            isLoading.value = false;
        }
    }

    onUnmounted(() => {
        kline.orders.forEach(o => kline.disconnectSymbol(o.symbol));
    });
</script>