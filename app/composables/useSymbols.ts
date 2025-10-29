export const useSymbols = async () => {
    const { data: symbols } = await useAsyncData(
        "symbols",
        () => $fetch("https://api.binance.com/api/v3/exchangeInfo"),
        {
            transform: (res: any) => res.symbols
                .filter((s: any) => 
                    s.status === "TRADING" &&
                    s.isSpotTradingAllowed &&
                    s.quoteAsset === "USDT" &&
                    !s.symbol.includes("UP") &&
                    !s.symbol.includes("DOWN") &&
                    !s.symbol.startsWith("1000") &&
                    !s.symbol.endsWith("BULL") &&
                    !s.symbol.endsWith("BEAR")
                )
                .map((s: any) => s.symbol),
            getCachedData: key => useNuxtData(key).data.value,
        }
    );

    return symbols;
};