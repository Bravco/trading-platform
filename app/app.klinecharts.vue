<template>
    <div>
        <NuxtRouteAnnouncer/>
        <UApp>
            <UDashboardGroup>
                <UDashboardPanel>
                    <template #header>
                        <UDashboardNavbar title="Trading Platform">
                            <template #right>
                                <UColorModeButton/>
                            </template>
                        </UDashboardNavbar>
                    </template>

                    <template #body>
                        <div ref="chartContainer" class="w-full h-full"/>
                    </template>
                </UDashboardPanel>
            </UDashboardGroup>
        </UApp>
    </div>
</template>

<script setup lang="ts">
    import { init, dispose } from "klinecharts";

    const chartContainer = ref<HTMLDivElement | null>(null);
    
    function genData(
        timestamp = new Date().getTime(),
        length = 800,
        timeframe = 1 // in minutes
    ) {
        let basePrice = 5000;
        timestamp = Math.floor(timestamp / 1000 / 60 / timeframe) * timeframe * 60 * 1000 - length * timeframe * 60 * 1000;
        const dataList = [];
        for (let i = 0; i < length; i++) {
            const prices = [];
            for (let j = 0; j < 4; j++) {
                prices.push(basePrice + Math.random() * 60 - 30);
            }
            prices.sort();
            const open = +(prices[Math.round(Math.random() * 3)]!.toFixed(2));
            const high = +(prices[3]!.toFixed(2));
            const low = +(prices[0]!.toFixed(2));
            const close = +(prices[Math.round(Math.random() * 3)]!.toFixed(2));
            const volume = Math.round(Math.random() * 100) + 10;
            const turnover = (open + high + low + close) / 4 * volume;
            dataList.push({ timestamp, open, high,low, close, volume, turnover });
            basePrice = close;
            timestamp += timeframe * 60 * 1000;
        }
        return dataList;
    }

    onMounted(() => {
        if (!chartContainer.value) return;

        const chart = init(chartContainer.value);
        if (!chart) return;

        const resizeObserver = new ResizeObserver(() => chart.resize());
        resizeObserver.observe(chartContainer.value);
        
        chart.applyNewData(genData());

        onUnmounted(() => {
            if (chartContainer.value) {
                resizeObserver.disconnect();
                dispose(chartContainer.value);
            }
        });
    });
</script>