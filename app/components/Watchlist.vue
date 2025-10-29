<template>
    <div class="h-full flex flex-col">
        <div class="flex gap-2 p-2 border-b border-muted">
            <UInput
                v-model="search"
                icon="i-lucide-search"
                class="w-full"
            >
                <template v-if="search.length" #trailing>
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
            <UButton
                icon="i-lucide-star"
                :variant="favourite ? 'solid' : 'outline'"
                :color="favourite ? 'primary' : 'neutral'"
                @click="favourite = !favourite"
            />
        </div>
        <div class="h-full flex flex-col gap-2 p-2 overflow-y-auto">
            <div
                v-for="symbol in pagedSymbols"
                :key="symbol"
                class="flex gap-2"
            >
                <UButton
                    icon="i-lucide-star"
                    :variant="kline.favouriteSymbols.includes(symbol) ? 'soft' : 'ghost'"
                    :color="kline.favouriteSymbols.includes(symbol) ? 'primary' : 'neutral'"
                    size="sm"
                    @click="toggleFavourite(symbol)"
                />
                <UButton
                    :label="symbol"
                    :variant="kline.symbol === symbol ? 'soft' : 'ghost'"
                    color="neutral"
                    class="w-full"
                    @click="selectSymbol(symbol)"
                />
            </div>
        </div>
        <div class="flex flex-col items-center gap-2 p-2 border-t border-muted">
            <span class="text-xs text-muted">{{ searchedSymbols.length }} symbols</span>
            <UPagination
                v-model:page="page"
                :items-per-page="itemsPerPage"
                :total="searchedSymbols.length"
                :sibling-count="1"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
    const kline = useKlineStore();
    const symbols = await useSymbols();

    const search = ref<string>("");
    const page = ref(1);
    const itemsPerPage = ref(50);
    const favourite = ref<boolean>(false);

    const searchedSymbols = computed(() => {
        if (!symbols.value) return [];

        let filtered: string[] = symbols.value.filter((symbol: any) =>
            symbol.toLowerCase().includes(search.value.toLowerCase())
        );

        if (favourite.value) {
            filtered = filtered.filter(symbol => kline.favouriteSymbols.includes(symbol));
        }

        return filtered;
    });

    const pagedSymbols = computed(() => {
        const start = (page.value - 1)* itemsPerPage.value;
        const end = start + itemsPerPage.value;
        return searchedSymbols.value.slice(start, end);
    });

    function selectSymbol(symbol: string) {
        if (kline.symbol === symbol) return;
        kline.symbol = symbol;
    }

    function toggleFavourite(symbol: string) {
        const index = kline.favouriteSymbols.indexOf(symbol);
        if (index === -1) {
            kline.favouriteSymbols.push(symbol);
        } else {
            kline.favouriteSymbols.splice(index, 1);
        }
    }
</script>