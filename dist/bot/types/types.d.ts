export interface OHLCV {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
export interface MarketData {
    symbol: string;
    timestamp: number;
    price: number;
    volume: number;
    ohlcv: OHLCV[];
    bid: number;
    ask: number;
    spread: number;
}
export interface MarketAnalysis {
    rsi?: number;
    macd?: {
        macd: number;
        signal: number;
        histogram: number;
    };
    bollinger?: {
        upper: number;
        middle: number;
        lower: number;
    };
    stochastic?: {
        k: number;
        d: number;
    };
    atr?: number;
    priceChange1h?: number;
    priceChange24h?: number;
    volatility?: number;
    volumeRatio?: number;
    trendStrength?: number;
    momentum?: number;
    supportLevel?: number;
    resistanceLevel?: number;
    marketSentiment?: number;
    orderBookImbalance?: number;
    timestamp: number;
}
export interface Signal {
    action: 'buy' | 'sell' | 'hold';
    confidence: number;
    reasoning: string;
    probabilities?: {
        buy: number;
        sell: number;
        hold: number;
    };
}
export interface Trade {
    id: string;
    symbol: string;
    action: 'buy' | 'sell';
    amount: number;
    price: number;
    timestamp: number;
    confidence: number;
    fees: number;
    performance?: number;
    profit?: number;
}
export interface ModelPerformance {
    totalTrades: number;
    successfulTrades: number;
    totalProfit: number;
    accuracy: number;
    sharpeRatio: number;
    maxDrawdown: number;
}
//# sourceMappingURL=types.d.ts.map