<template>
    <UTable
        :data="kline.positions"
        :columns="columns"
        sticky="header"
        class="flex-1"
        empty="You have no opened positions."
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
                            const position: Position | undefined = kline.positions[row.index];

                            if (position) {
                                const currentPrice = kline.prices[position.symbol] ?? position.price;
                                const pnl = (currentPrice - position.price) * position.size * (position.direction === "buy" ? 1 : -1);
                                kline.balance += pnl;
                            }

                            if (kline.chart && position?.entryLineId) {
                                kline.chart.removeOverlay({ id: position.entryLineId });
                            }
                                
                            kline.positions.splice(row.index, 1);
                        }
                    }
                );
            }
        }
    ];
</script>