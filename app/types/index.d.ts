import type { Nullable } from "klinecharts";

declare global {
    type ActiveIndicator = {
        name: string,
        paneId: string
    };

    type Position = {
        symbol: string,
        direction: "buy" | "sell",
        price: number,
        size: number,
        timestamp: number,
        entryLineId?: Nullable<string>
    };

    type PendingOrder = {
        symbol: string,
        direction: "buy" | "sell",
        orderType: "limit" | "stop",
        price: number,
        size: number,
        pendingEntryLineId?: Nullable<string>
    };
}