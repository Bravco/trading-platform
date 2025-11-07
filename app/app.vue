<template>
    <div>
        <NuxtRouteAnnouncer/>
        <UApp>
            <div class="min-h-svh fixed inset-0 p-4 bg-muted">
                <SplitterGroup direction="vertical">
                    <SplitterPanel>
                        <SplitterGroup direction="horizontal">
                            <SplitterPanel :default-size="75" class="bg-default border border-muted rounded-lg">
                                <Chart/>
                            </SplitterPanel>
                            <SplitterResizeHandle class="grid place-items-center">
                                <UIcon name="i-lucide-grip-vertical"/>
                            </SplitterResizeHandle>
                            <SplitterPanel class="bg-default border border-muted rounded-lg">
                                <Watchlist/>
                            </SplitterPanel>
                        </SplitterGroup>
                    </SplitterPanel>
                    <SplitterResizeHandle class="grid place-items-center">
                        <UIcon name="i-lucide-grip-horizontal"/>
                    </SplitterResizeHandle>
                    <SplitterPanel :default-size="25" class="bg-default border border-muted rounded-lg">
                        <OrderPanel/>
                    </SplitterPanel>
                </SplitterGroup>
            </div>
        </UApp>
    </div>
</template>

<script setup lang="ts">
    import { registerOverlay } from "klinecharts";

    const kline = useKlineStore();

    const overlays = useOverlays();
    overlays.forEach(overlay => registerOverlay(overlay));

    watch(() => kline.symbol, (newSymbol, oldSymbol) => {
        if (oldSymbol === newSymbol) return;

        if (oldSymbol) {
            if (kline.pendingOrders.findIndex(o => o.symbol === oldSymbol) === -1) {
                kline.disconnectBookTicker(oldSymbol);
            }
            if (kline.positions.findIndex(p => p.symbol === oldSymbol) === -1) {
                kline.disconnectPrice(oldSymbol);
            }
        }

        kline.connectBookTicker(newSymbol);
        kline.connectPrice(newSymbol);
    });

    watch(() => kline.interval, () => kline.connectPrice(kline.symbol));

    onMounted(() => {
        kline.connectPrice(kline.symbol);
        kline.connectBookTicker(kline.symbol);
    });

    onUnmounted(() => {
        kline.disconnectPrice(kline.symbol);
        kline.disconnectBookTicker(kline.symbol);
        kline.positions.forEach((p: Position) => kline.disconnectPrice(p.symbol));
        kline.pendingOrders.forEach((o: PendingOrder) => kline.disconnectBookTicker(o.symbol));
    });
</script>