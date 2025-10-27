<template>
    <div>
        <NuxtRouteAnnouncer/>
        <UApp>
            <UDashboardGroup>
                <UDashboardPanel :ui="{ body: 'gap-0 sm:gap-0 p-0 sm:p-0' }">
                    <template #header v-if="isMobile">
                        <UDashboardNavbar :toggle="false" class="flex md:hidden" :ui="{ center: 'w-full flex' }">
                            <UTabs v-model="currentTab" :items="tabs" color="neutral" size="lg" class="w-full"/>
                        </UDashboardNavbar>
                    </template>
                    <template #body>
                        <Chart/>
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

    const isMobile = useBreakpoints(breakpointsTailwind).smaller("md");
    const currentTab = ref<string>("chart");
    const tabs = ref<TabsItem[]>([
        { icon: "i-lucide-candlestick-chart", lable: "Chart", value: "chart" },
        { icon: "i-lucide-clipboard-list", lable: "Watchlist", value: "watchlist" },
        { icon: "i-lucide-dollar-sign", lable: "Positions", value: "positions" }
    ]);
    
    overlays.forEach(overlay => registerOverlay(overlay));
</script>