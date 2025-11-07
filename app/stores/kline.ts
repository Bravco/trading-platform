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
        positions: [] as Position[],
        pendingOrders: [] as PendingOrder[],
        pricesWebsockets: {} as Record<string, WebSocket>,
        prices: {} as Record<string, number>,
        bookTickerWebsockets: {} as Record<string, WebSocket>,
        bookTickers: {} as Record<string, { bid: number, ask: number }>,
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
                        low: { color: textColor },
                        last: { line: { dashedValue: [2, 2] } }
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
        connectPrice(symbol: string) {
            if (this.pricesWebsockets[symbol]) this.disconnectPrice(symbol);

            const url = `wss://stream.binance.com:9443/stream?streams=${symbol.toLowerCase()}@trade/${symbol.toLowerCase()}@kline_${this.interval}`;
            const ws = new WebSocket(url);
            this.pricesWebsockets[symbol] = ws;

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
                delete this.pricesWebsockets[symbol];
            };

            ws.onerror = () => {
                ws.close();
            };
        },
        disconnectPrice(symbol: string) {
            const ws = this.pricesWebsockets[symbol];
            if (ws) {
                ws.close();
                delete this.pricesWebsockets[symbol];
            }
        },
        connectBookTicker(symbol: string) {
            if (this.bookTickerWebsockets[symbol]) this.disconnectBookTicker(symbol);

            const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@bookTicker`;
            const ws = new WebSocket(url);
            this.bookTickerWebsockets[symbol] = ws;

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.bookTickers[symbol] = {
                        bid: parseFloat(data.b),
                        ask: parseFloat(data.a)
                    };
                    
                    this.pendingOrders.map(o => {
                        if (o.symbol !== symbol || !this.bookTickers[symbol]) return;

                        const shouldMarketBuy = o.direction === "buy" && (
                            (o.orderType === "limit" && o.price >= this.bookTickers[symbol].ask)
                            || (o.orderType === "stop" && o.price <= this.bookTickers[symbol].ask)
                        );

                        const shouldMarketSell = o.direction === "sell" && (
                            (o.orderType === "limit" && o.price <= this.bookTickers[symbol].bid)
                            || (o.orderType === "stop" && o.price >= this.bookTickers[symbol].bid)
                        );

                        if (shouldMarketBuy) {
                            this.marketBuy(symbol, o.size);

                            if (this.chart && o.pendingEntryLineId) {
                                this.chart.removeOverlay({ id: o.pendingEntryLineId });
                            }

                            const index = this.pendingOrders.indexOf(o);
                            if (index !== -1) this.pendingOrders.splice(index, 1);
                        } else if (shouldMarketSell) {
                            this.marketSell(symbol, o.size);

                            if (this.chart && o.pendingEntryLineId) {
                                this.chart.removeOverlay({ id: o.pendingEntryLineId });
                            }

                            const index = this.pendingOrders.indexOf(o);
                            if (index !== -1) this.pendingOrders.splice(index, 1);
                        }
                    });
                } catch (e) {
                    console.error("Failed to parse bookTicker data:", e);
                }
            };

            ws.onclose = () => {
                delete this.bookTickerWebsockets[symbol];
            };

            ws.onerror = () => {
                ws.close();
            };
        },
        disconnectBookTicker(symbol: string) {
            const ws = this.bookTickerWebsockets[symbol];
            if (ws) {
                ws.close();
                delete this.bookTickerWebsockets[symbol];
            }
        },
        marketBuy(symbol: string, size: number) {
            if (!this.bookTickers[symbol]) return;

            const position: Position = {
                symbol,
                direction: "buy",
                price: this.bookTickers[symbol].ask,
                size,
                timestamp: Date.now()
            };

            if (this.chart) {
                position.entryLineId = this.chart.createOverlay({
                    name: "entryLine",
                    extendData: { direction: "buy", price: this.bookTickers[symbol].ask },
                    points: [{}]
                }) as Nullable<string>;
            }

            this.positions.push(position);
        },
        marketSell(symbol: string, size: number) {
            if (!this.bookTickers[symbol]) return;

            const position: Position = {
                symbol,
                direction: "sell",
                price: this.bookTickers[symbol].bid,
                size,
                timestamp: Date.now()
            };

            if (this.chart) {
                position.entryLineId = this.chart.createOverlay({
                    name: "entryLine",
                    extendData: { direction: "sell", price: this.bookTickers[symbol].bid },
                    points: [{}]
                }) as Nullable<string>;
            }

            this.positions.push(position);
        },
        pendingOrder(symbol: string, direction: "buy" | "sell", price: number, size: number, pendingLineId?: Nullable<string>) {
            const currentPrice = this.prices[symbol] ?? price;
            const orderType = direction === "buy"
                ? currentPrice > price ? "limit" : "stop"
                : currentPrice < price ? "limit" : "stop";
            const order: PendingOrder = {
                symbol,
                direction,
                orderType,
                price,
                size
            };

            if (this.chart) {
                order.pendingEntryLineId = this.chart.createOverlay({
                    name: "pendingEntryLine",
                    extendData: { direction, price },
                    points: [{}]
                }) as Nullable<string>;

                if (pendingLineId) {
                    this.chart.removeOverlay({ name: "pendingLine" });
                }
            }

            this.pendingOrders.push(order);
        }
    }
});