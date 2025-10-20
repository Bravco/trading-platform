import type { Nullable, Chart } from "klinecharts";

export const useKlineStore = defineStore("kline", () => {
    const chart = ref<Nullable<Chart>>(null);

    return { chart };
});