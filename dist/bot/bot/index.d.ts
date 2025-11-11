import '../lib/polyfills';
import { MarketData } from '../types/types';
declare class TradingBot {
    private config;
    private db;
    private exchange;
    private analyzer;
    private aiTrader;
    private riskManager;
    private isRunning;
    private symbols;
    constructor();
    initialize(): Promise<void>;
    processMarket(symbol: string): Promise<void>;
    executeTrade(signal: any, marketData: MarketData): Promise<void>;
    trackTradePerformance(trade: any): Promise<void>;
    scanMarkets(): Promise<void>;
    start(): Promise<void>;
    shutdown(): Promise<void>;
    getStats(): Promise<any>;
}
declare const bot: TradingBot;
export default bot;
//# sourceMappingURL=index.d.ts.map