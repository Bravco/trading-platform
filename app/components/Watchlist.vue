<template>
    <div class="flex gap-2 p-2">
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
            :variant="favourite ? 'subtle' : 'outline'"
            :color="favourite ? 'primary' : 'neutral'"
            @click="favourite = !favourite"
        />
    </div>
    <div class="flex flex-col gap-2 p-2 overflow-y-auto">
        <UButton
            v-for="symbol in searchedSymbols"
            :key="symbol"
            :label="symbol"
            :variant="kline.symbol === symbol ? 'soft' : 'ghost'"
            color="neutral"
            class="w-full"
            @click="selectSymbol(symbol)"
        />
    </div>
</template>

<script lang="ts" setup>
    const kline = useKlineStore();
    const symbols = await useSymbols();

    const search = ref<string>("");
    const favourite = ref<boolean>(false);

    const searchedSymbols = computed(() => {
        if (!symbols.value) return [];
        return symbols.value.filter((symbol: any) =>
            symbol.toLowerCase().includes(search.value.toLowerCase())
        );
    });

    function selectSymbol(symbol: string) {
        if (kline.symbol === symbol) return;
        kline.symbol = symbol;
    }
</script>