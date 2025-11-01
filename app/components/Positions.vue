<template>
    <UTable
        :data="kline.orders"
        :columns="columns"
        class="flex-1"
        empty="You have no positions opened."
    />
</template>

<script lang="ts" setup>
    import type { TableColumn } from "@nuxt/ui";

    const kline = useKlineStore();

    const UBadge = resolveComponent("UBadge");
    
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
            header: "Entry Price"
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
            header: "Position Size"
        }
    ];
</script>