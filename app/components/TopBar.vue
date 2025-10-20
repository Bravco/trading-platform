<template>
    <div class="flex border-b border-b-muted overflow-x-auto">
        <div class="grid place-items-center border-r border-r-muted font-medium">
            <UButton
                icon="i-lucide-list"
                :label="kline.symbol"
                color="neutral"
                class="w-full h-full rounded-none"
                variant="ghost"
            />
        </div>
        <div class="flex items-center gap-2 p-2">
            <UButton
                v-for="(timeframe, index) in timeframes"
                :key="index"
                :label="timeframe"
                :variant="kline.interval === timeframe ? 'soft' : 'ghost'"
                color="neutral"
                square
                @click="changeTimeframe(timeframe)"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
    const kline = useKlineStore();

    const timeframes = ["1s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"];

    async function changeTimeframe(timeframe: string) {
        if (kline.interval === timeframe) return;
        kline.interval = timeframe;
    }
</script>