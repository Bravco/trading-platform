<template>
    <UDashboardGroup>
        <UDashboardPanel resizable :default-size="75" :min-size="75" :max-size="80">
            <template #body>
                <Chart
                    :key="chartKey"
                    :options="{
                        width: '100%',
                        height: '500',
                        symbol: selectedSymbol,
                        theme: colorMorde.value,
                        timezone: 'Etc/UTC',
                        locale: 'en',
                        allow_symbol_change: false,
                        hide_side_toolbar: false,
                        hide_top_toolbar: true
                    }
                "/>
            </template>
        </UDashboardPanel>

        <UDashboardPanel resizable :default-size="25" :min-size="20" :max-size="25">
            <template #body>
                <ul class="flex flex-col gap-2">
                    <UButton
                        v-for="symbol in symbols"
                        :key="symbol"
                        :label="symbol"
                        variant="link"
                        color="neutral"
                        @click="selectSymbol(symbol)"
                        class="cursor-pointer"
                    />
                </ul>
            </template>
        </UDashboardPanel>
    </UDashboardGroup>
</template>

<script setup lang="ts">
    const colorMorde = useColorMode();

    const symbols: string[] = [
        "OANDA:EURUSD",
        "OANDA:GBPUSD",
        "OANDA:USDJPY"
    ];

    const selectedSymbol = useState<string>("selectedSymbol", () => symbols[0]!);

    const chartKey = computed(() => colorMorde.value + selectedSymbol.value);

    const selectSymbol = (symbol: string) => selectedSymbol.value = symbol;
</script>