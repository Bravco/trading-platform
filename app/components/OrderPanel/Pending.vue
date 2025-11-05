<template>
    <UTable
        :data="kline.pendingOrders"
        :columns="columns"
        sticky="header"
        class="flex-1"
        empty="You have no pending orders."
    />
</template>

<script lang="ts" setup>
    import type { TableColumn } from "@nuxt/ui";

    const kline = useKlineStore();

    const UBadge = resolveComponent("UBadge");
    const UButton = resolveComponent("UButton");

    const columns: TableColumn<any>[] = [
        {
            accessorKey: "symbol",
            header: "Symbol"
        },
        {
            accessorKey: "price",
            header: "Pending Price",
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
                            const order: PendingOrder | undefined = kline.pendingOrders[row.index];

                            if (kline.chart && order?.pendingEntryLineId) {
                                kline.chart.removeOverlay({ id: order.pendingEntryLineId });
                            }
                                
                            kline.pendingOrders.splice(row.index, 1);
                        }
                    }
                );
            }
        }
    ];
</script>