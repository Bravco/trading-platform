import type { Nullable } from "klinecharts";

declare global {
    type ActiveIndicator = {
        name: string,
        paneId: string
    };

    type Order = {
        symbol: string
        direction: "buy" | "sell",
        price: number,
        size: number,
        timestamp: number,
        orderLineId?: Nullable<string>
    };
}