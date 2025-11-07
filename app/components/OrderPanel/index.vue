<template>
    <UTabs :items="tabs" variant="link" color="neutral" class="h-full" :ui="{ content: 'h-full flex' }">
        <template #positions>
            <OrderPanelPositions/>
        </template>
        <template #pending>
            <OrderPanelPending/>
        </template>
        <template #list-trailing>
            <div class="flex gap-4 items-center ml-auto px-2">
                <div>
                    <span class="text-sm text-muted">Balance: </span>
                    <span class="font-medium">{{ kline.balance.toFixed(2) }} $</span>
                </div>
                <div>
                    <span class="text-sm text-muted">Open P&L: </span>
                    <span
                        class="font-medium"
                        :class="{
                            'text-success': openPnl > 0,
                            'text-error': openPnl < 0
                        }"
                    >{{ `${openPnl >= 0 ? "+" : ""}${openPnl.toFixed(2)} $` }}</span>
                </div>
                <div>
                    <span class="text-sm text-muted">Equity: </span>
                    <span class="font-medium">{{ equity.toFixed(2) }} $</span>
                </div>
            </div>
        </template>
    </UTabs>
</template>

<script lang="ts" setup>
    import type { TabsItem } from "@nuxt/ui";

    const kline = useKlineStore();
    
    const tabs = computed<TabsItem[]>(() => [
        {
            label: `Positions (${kline.positions.length})`,
            icon: "i-lucide-dollar-sign",
            slot: "positions" as const
        },
        {
            label: `Pending (${kline.pendingOrders.length})`,
            icon: "i-lucide-hourglass",
            slot: "pending" as const
        }
    ]);

    const openPnl = computed(() => {
        let totalPnl = 0;

        for (const position of kline.positions) {
            const currentPrice = kline.prices[position.symbol] ?? position.price;
            const pnl = (currentPrice - position.price) * position.size * (position.direction === "buy" ? 1 : -1);
            totalPnl += pnl;
        }

        return totalPnl;
    });

    const equity = computed(() => kline.balance + openPnl.value);
</script>