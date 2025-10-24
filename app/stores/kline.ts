import type { Nullable, Chart } from "klinecharts";

type ActiveIndicator = {
    name: string,
    paneId: string
};

export const useKlineStore = defineStore("kline", () => {
    const chart = ref<Nullable<Chart>>(null);
    const symbol = ref<string>("BTCUSDT");
    const interval = ref<string>("1m");
    const activeIndicators = ref<ActiveIndicator[]>([]);

    return { chart, symbol, interval, activeIndicators };
});