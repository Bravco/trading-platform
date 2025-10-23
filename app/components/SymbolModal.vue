<template>
    <div class="grid place-items-center font-medium border-r border-r-muted">
        <UModal
            v-model:open="modal"
            title="Symbols"
            :description="`Count: ${symbols?.length || 0}`"
            :ui="{ content: 'h-full', footer: 'justify-center' }"
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
                <div class="flex flex-wrap gap-1">
                    <UButton
                        v-for="(symbol, index) in pagedSymbols"
                        :key="index"
                        :label="symbol"
                        variant="ghost"
                        color="neutral"
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
</template>

<script lang="ts" setup>
    const kline = useKlineStore();
    const { data: symbols } = await useFetch<any[]>(
        "https://api.binance.com/api/v3/exchangeInfo",
        {
            transform: (res: any) => 
                res.symbols
                    .filter((s: any) => 
                        s.status === "TRADING" &&
                        s.isSpotTradingAllowed &&
                        s.quoteAsset === "USDT" &&
                        !s.symbol.includes("UP") &&
                        !s.symbol.includes("DOWN") &&
                        !s.symbol.startsWith("1000") &&
                        !s.symbol.endsWith("BULL") &&
                        !s.symbol.endsWith("BEAR")
                    )
                    .map((s: any) => s.symbol)
        }
    );
    const modal = ref<boolean>(false);
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
        modal.value = false;
        search.value = "";
        if (kline.symbol === symbol) return;
        kline.symbol = symbol;
    }
</script>