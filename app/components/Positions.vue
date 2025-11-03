<template>
    <div class="flex-1">
        <UTabs :items="tabs" variant="link" color="neutral">
            <template #positions>
                <UTable
                    :data="kline.orders"
                    :columns="columns"
                    class="flex-1"
                    empty="You have no positions opened."
                />
            </template>
            <template #list-trailing>
                <div class="flex gap-4 items-center ml-auto px-2">
                    <div>
                        <span class="text-sm text-muted">Balance: </span>
                        <span class="font-medium">{{ kline.balance.toFixed(2) }} $</span>
                    </div>
                    <div>
                        <span class="text-sm text-muted">Equity: </span>
                        <span class="font-medium">{{ kline.balance.toFixed(2) }} $</span>
                    </div>
                </div>
            </template>
        </UTabs>
    </div>
</template>

<script lang="ts" setup>
    import type { TabsItem, TableColumn } from "@nuxt/ui";

    const kline = useKlineStore();
    
    const UBadge = resolveComponent("UBadge");
    const UButton = resolveComponent("UButton");
    
    const tabs = ref<TabsItem[]>([
        {
            label: "Positions",
            icon: "i-lucide-dollar-sign",
            slot: "positions" as const
        }
    ]);

    const columns: TableColumn<any>[] = [
        {
            accessorKey: "symbol",
            header: "Symbol"
        },
        {
            accessorKey: "timestamp",
            header: "Entry Time",
            cell: ({ row }) => {
                return new Date(row.getValue("timestamp")).toLocaleString()
            }
        },
        {
            accessorKey: "price",
            header: "Entry Price",
            cell: ({ row }) => `${(row.getValue("price") as number).toFixed(2)} $`
        },
        {
            accessorKey: "direction",
            header: "Direction",
            cell: ({ row }) => {
                const color = {
                    buy: "success" as const,
                    sell: "error" as const
                }[row.getValue("direction") as string];

                return h(
                    UBadge,
                    { class: "capitalize", variant: "subtle", color },
                    () => row.getValue("direction")
                );
            }
        },
        {
            accessorKey: "size",
            header: "Position Size",
            cell: ({ row }) => (row.getValue("size") as number).toFixed(2)
        },
        {
            accessorKey: "pnl",
            header: "P&L",
            cell: ({ row }) => {
                const symbol = row.getValue("symbol") as string;
                const entryPrice = row.getValue("price") as number;
                const size = row.getValue("size") as number;
                const direction = row.getValue("direction") as string;
                const currentPrice = kline.prices[symbol] ?? entryPrice;

                const pnl = (currentPrice - entryPrice) * size * (direction === "buy" ? 1 : -1);
                const colorClass = pnl === 0 ? "" : (pnl > 0 ? "text-success" : "text-error");


                return h(
                    "span",
                    { class: `font-semibold ${colorClass}` },
                    `${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} $`
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                return h(
                    UButton,
                    {
                        icon: "i-lucide-x",
                        variant: "ghost",
                        color: "neutral",
                        onClick: () => {
                            const order: Order | undefined = kline.orders[row.index];

                            if (kline.chart && order?.orderLineId) {
                                kline.chart.removeOverlay({ id: order.orderLineId });
                            }
                                
                            kline.orders.splice(row.index, 1);
                        }
                    }
                );
            }
        }
    ];
</script>