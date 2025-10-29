<template>
    <div>
        <NuxtRouteAnnouncer/>
        <UApp>
            <UDashboardGroup>
                <UDashboardPanel resizable :min-size="60" :max-size="80" :default-size="75" :ui="{ body: 'gap-0 sm:gap-0 p-0 sm:p-0' }">
                    <template #header v-if="isMounted && isMobile">
                        <UDashboardNavbar :toggle="false" :ui="{ root: 'px-0 sm:px-0', center: 'w-full flex' }">
                            <UTabs
                                v-model="currentTab"
                                :items="tabs"
                                :content="false"
                                color="neutral"
                                size="lg"
                                class="w-full"
                            />
                        </UDashboardNavbar>
                    </template>
                    <template #body>
                        <KeepAlive>
                            <Chart v-if="currentTab === 'chart'"/>
                            <Watchlist v-else-if="currentTab === 'watchlist'"/>
                        </KeepAlive>
                    </template>
                </UDashboardPanel>
                <UDashboardPanel v-if="isMounted && !isMobile" :ui="{ body: 'gap-0 sm:gap-0 p-0 sm:p-0' }">
                    <template #body>
                        <Watchlist/>
                    </template>
                </UDashboardPanel>
            </UDashboardGroup>
        </UApp>
    </div>
</template>

<script setup lang="ts">
    import { registerOverlay } from "klinecharts";
    import { breakpointsTailwind } from "@vueuse/core";
    import type { TabsItem } from "@nuxt/ui";
    
    const overlays = useOverlays();

    const isMounted = ref<boolean>(false);
    const isMobile = useBreakpoints(breakpointsTailwind).smaller("lg");
    const currentTab = ref<string>("chart");
    const tabs = ref<TabsItem[]>([
        { icon: "i-lucide-candlestick-chart", label: "Chart", value: "chart" },
        { icon: "i-lucide-clipboard-list", label: "Watchlist", value: "watchlist" },
        { icon: "i-lucide-dollar-sign", label: "Trades", value: "trades" }
    ]);
    
    overlays.forEach(overlay => registerOverlay(overlay));

    watch(isMobile, (value) => {
        if (!value) currentTab.value = "chart";
    });

    onMounted(() => isMounted.value = true);
</script>