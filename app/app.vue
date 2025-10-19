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
                        <div id="tradingview-chart" class="w-full h-full"></div>
                    </template>
                </UDashboardPanel>
            </UDashboardGroup>
        </UApp>
    </div>
</template>

<script lang="ts" setup>
    const colorMode = useColorMode();

    onMounted(() => {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = () => {
            new (window as any).TradingView.widget({
                container_id: "tradingview-chart",
                autosize: true,
                symbol: "OANDA:EURUSD",
                interval: "1",
                timezone: "Etc/UTC",
                theme: colorMode.value,
                style: "1",
                locale: "en",
                enable_publishing: false,
                allow_symbol_change: false,
                withdateranges: true,
                hide_volume: true,
                hide_side_toolbar: false
            });
        };
        document.body.appendChild(script);
    });
</script>