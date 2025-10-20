import type { Nullable, Chart } from "klinecharts";

export const useKlineStore = defineStore("kline", () => {
    const chart = ref<Nullable<Chart>>(null);
    const symbol = ref<string>("BTCUSDT");
    const interval = ref<string>("1m");

    return { chart, symbol, interval };
});