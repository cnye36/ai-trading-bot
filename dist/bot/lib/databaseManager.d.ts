import { Trade, MarketData, MarketAnalysis, Signal } from '../types/types';
export declare class DatabaseManager {
    private db;
    initialize(): Promise<void>;
    storeTrade(trade: Trade): Promise<void>;
    updateTradePerformance(tradeId: string, performance: number, profit: number): Promise<void>;
    storeMarketData(marketData: MarketData, analysis: MarketAnalysis, signal: Signal): Promise<void>;
    getHistoricalData(): Promise<Array<{
        analysis: MarketAnalysis;
        signal: Signal;
        performance?: number;
    }>>;
    getAnalysisForTrade(tradeId: string): Promise<MarketAnalysis | null>;
    getModelPerformanceStats(): Promise<{
        totalTrades: number;
        correctPredictions: number;
        profitableTrades: number;
    }>;
    close(): Promise<void>;
}
//# sourceMappingURL=databaseManager.d.ts.map