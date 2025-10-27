import { TooltipIconPosition } from "klinecharts";
import type { Nullable, Chart, Styles, DeepPartial, TooltipIconStyle } from "klinecharts";

type ActiveIndicator = {
    name: string,
    paneId: string
};

export const useKlineStore = defineStore("kline", () => {
    const colorMode = useColorMode();

    const chart = ref<Nullable<Chart>>(null);
    const symbol = ref<string>("BTCUSDT");
    const interval = ref<string>("1m");
    const activeIndicators = ref<ActiveIndicator[]>([]);
    const editedIndicator = ref<Nullable<ActiveIndicator>>(null);

    const getIconStyle = (id: string, icon: string, color: string): DeepPartial<TooltipIconStyle> => ({
        id,
        position: TooltipIconPosition.Middle,
        marginRight: 8,
        size: 14,
        color: color,
        activeColor: color,
        backgroundColor: "transparent",
        activeBackgroundColor: "rgba(22, 119, 255, 0.15)",
        fontFamily: "icomoon",
        icon
    });

    const getThemeStyles = (): DeepPartial<Styles> => {
        const textColor = getCssVarColor("--ui-text-muted", colorMode.value === "dark" ? "#929AA5" : "#76808F");
        const lineColor = getCssVarColor("--ui-border-muted", colorMode.value === "dark" ? "#555555" : "#dddddd");
        return {
            candle: {
                priceMark: {
                    high: { color: textColor },
                    low: { color: textColor }
                },
                tooltip: { text: { color: textColor } }
            },
            grid: {
                horizontal: { color: lineColor },
                vertical: { color: lineColor }
            },
            xAxis: {
                tickText: { color: textColor },
                tickLine: { color: lineColor },
                axisLine: { color: lineColor }
            },
            yAxis: {
                tickText: { color: textColor },
                tickLine: { color: lineColor },
                axisLine: { color: lineColor }
            },
            separator: { color: lineColor },
            indicator: {
                tooltip: {
                    text: { color: textColor },
                    icons: [
                        getIconStyle("settings", "\ue994", textColor),
                        getIconStyle("invisible", "\ue9ce", textColor),
                        getIconStyle("visible", "\ue9d1", textColor),
                        getIconStyle("remove", "\ue9ac", textColor)
                    ]
                }
            }
        };
    }

    return { chart, symbol, interval, activeIndicators, editedIndicator, getThemeStyles };
});