<template>
    <div class="flex border-b border-b-muted overflow-x-auto">
        <div class="grid place-items-center border-r border-r-muted font-medium">
            <UModal
                v-model:open="symbolModal"
                title="Symbols"
                :description="`Count: ${symbols?.length || 0}`"
                :ui="{ content: 'h-100', footer: 'justify-center' }"
            >
                <UButton
                    icon="i-lucide-list"
                    :label="kline.symbol"
                    color="neutral"
                    class="w-full h-full rounded-none"
                    variant="ghost"
                />
                <template #body>
                    <div class="sticky top-0">
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
                    <div class="grid grid-cols-3">
                        <UButton
                            v-for="(symbol, index) in pagedSymbols"
                            :key="index"
                            :label="symbol"
                            variant="ghost"
                            color="neutral"
                            class="w-full"
                            @click="selectSymbol(symbol)"
                        />
                    </div>
                </template>
                <template #footer>
                    <UPagination
                        v-model:page="page" 
                        :items-per-page="itemsPerPage"
                        :total="symbols?.length || 0"
                    />
                </template>
            </UModal>
        </div>
        <div class="flex items-center gap-2 p-2">
            <UButton
                v-for="(timeframe, index) in timeframes"
                :key="index"
                :label="timeframe"
                :variant="kline.interval === timeframe ? 'soft' : 'ghost'"
                color="neutral"
                square
                @click="selectTimeframe(timeframe)"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
    const kline = useKlineStore();
    const { data: symbols } = await useFetch<any[]>(
        "https://api.binance.com/api/v3/exchangeInfo",
        {
            transform: (res: any) => 
                res.symbols
                    .filter((s: any) => s.status === "TRADING")
                    .map((s: any) => s.symbol)
        }
    );
    const timeframes = ["1s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"];
    const symbolModal = ref<boolean>(false);
    const search = ref<string>("");
    const page = ref<number>(1);
    const itemsPerPage = 100;

    const filteredSymbols = computed(() => {
        if (!symbols.value) return [];
        return symbols.value.filter(symbol =>
            symbol.toLowerCase().includes(search.value.toLowerCase())
        );
    });

    const pagedSymbols = computed(() => {
        const filtered = filteredSymbols.value;
        const start = (page.value - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filtered.slice(start, end);
    });

    function selectSymbol(symbol: string) {
        symbolModal.value = false;
        search.value = "";
        if (kline.symbol === symbol) return;
        kline.symbol = symbol;
    }

    function selectTimeframe(timeframe: string) {
        if (kline.interval === timeframe) return;
        kline.interval = timeframe;
    }
</script>