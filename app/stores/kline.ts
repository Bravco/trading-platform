import { TooltipIconPosition } from "klinecharts";
import type { Nullable, Chart, Styles, DeepPartial, TooltipIconStyle, KLineData } from "klinecharts";

export const useKlineStore = defineStore("kline", {
    state: () => ({
        chart: null as Nullable<Chart>,
        interval: "1m" as string,
        symbol: "BTCUSDT" as string,
        favouriteSymbols: [] as string[],
        activeIndicators: [] as ActiveIndicator[],
        editedIndicator: null as Nullable<ActiveIndicator>,
        orders: [] as Order[],
        websockets: {} as Record<string, WebSocket>,
        prices: {} as Record<string, number>,
        balance: 10000 as number
    }),
    actions: {
        getIconStyle(id: string, icon: string, color: string): DeepPartial<TooltipIconStyle> {
            return {
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
            };
        },
        getThemeStyles(): DeepPartial<Styles> {
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
                            this.getIconStyle("settings", "\ue994", textColor),
                            this.getIconStyle("invisible", "\ue9ce", textColor),
                            this.getIconStyle("visible", "\ue9d1", textColor),
                            this.getIconStyle("remove", "\ue9ac", textColor)
                        ]
                    }
                }
            };
        },
        async fetchHistoricalData(symbol: string, limit = 1000) {
            const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${this.interval}&limit=${limit}`;
            const res = await fetch(url);
            const raw = await res.json();

            const data = raw.map((d: any[]) => ({
                timestamp: d[0],
                open: parseFloat(d[1]),
                high: parseFloat(d[2]),
                low: parseFloat(d[3]),
                close: parseFloat(d[4]),
                volume: parseFloat(d[5])
            })) as KLineData[];

            return data;
        },
        connectSymbol(symbol: string) {
            if (this.websockets[symbol]) this.disconnectSymbol(symbol);

            const url = `wss://stream.binance.com:9443/stream?streams=${symbol.toLowerCase()}@trade/${symbol.toLowerCase()}@kline_${this.interval}`;
            const ws = new WebSocket(url);
            this.websockets[symbol] = ws;

            ws.onmessage = (event) => {
                const payload = JSON.parse(event.data);
                const stream = payload.stream;
                const data = payload.data;

                if (stream.endsWith("@trade")) {
                    const price = parseFloat(data.p);
                    this.prices[symbol] = price;
                }

                if (stream.includes("@kline_")) {
                    const k = data.k;
                    const candle: KLineData = {
                        timestamp: k.t,
                        open: parseFloat(k.o),
                        high: parseFloat(k.h),
                        low: parseFloat(k.l),
                        close: parseFloat(k.c),
                        volume: parseFloat(k.v)
                    };

                    if (symbol === this.symbol && this.chart) {
                        this.chart.updateData(candle);
                    }
                }
            };

            ws.onclose = () => {
                delete this.websockets[symbol];
            };

            ws.onerror = () => {
                ws.close();
            };
        },
        disconnectSymbol(symbol: string) {
            const ws = this.websockets[symbol];
            if (ws) {
                ws.close();
                delete this.websockets[symbol];
            }
        }
    }
});