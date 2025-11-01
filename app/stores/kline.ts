import { TooltipIconPosition } from "klinecharts";
import type { Nullable, Chart, Styles, DeepPartial, TooltipIconStyle } from "klinecharts";

type ActiveIndicator = {
    name: string,
    paneId: string
};

type Order = {
    symbol: string
    direction: "buy" | "sell",
    price: number,
    size: number,
    timestamp: number
};

export const useKlineStore = defineStore("kline", () => {
    const chart = ref<Nullable<Chart>>(null);
    const interval = ref<string>("1m");
    const symbol = ref<string>("BTCUSDT");
    const favouriteSymbols = ref<string[]>([]);
    const activeIndicators = ref<ActiveIndicator[]>([]);
    const editedIndicator = ref<Nullable<ActiveIndicator>>(null);
    const orders = ref<Order[]>([]);

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
        const primaryColor = getCssVarColor("--ui-primary");
        const primaryTransparentColor = getCssVarColor("--ui-primary", undefined, 0.15);
        const textColor = getCssVarColor("--ui-text-muted");
        const lineColor = getCssVarColor("--ui-border-muted");
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
            overlay: {
                text: {
                    backgroundColor: primaryColor
                },
                point: {
                    color: primaryColor,
                    activeColor: primaryColor,
                    borderColor: primaryTransparentColor,
                    activeBorderColor: primaryTransparentColor
                },
                line: {
                    color: primaryColor
                },
                circle: {
                    color: primaryTransparentColor,
                    borderColor: primaryColor
                },
                polygon: {
                    color: primaryTransparentColor,
                    borderColor: primaryColor
                }
            },
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

    return {
        chart, interval, symbol, favouriteSymbols, activeIndicators, editedIndicator, getThemeStyles, orders
    };
});