<template>
    <div class="flex p-2 border-b border-b-muted">
        <UButton
            v-for="(timeframe, index) in timeframes"
            :key="index"
            :label="timeframe"
            :variant="kline.interval === timeframe ? 'soft' : 'ghost'"
            color="neutral"
            @click="changeTimeframe(timeframe)"
        />
    </div>
</template>

<script lang="ts" setup>
    const kline = useKlineStore();

    const timeframes = ["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"];

    async function changeTimeframe(timeframe: string) {
        if (kline.interval === timeframe) return;
        kline.interval = timeframe;
    }
</script>