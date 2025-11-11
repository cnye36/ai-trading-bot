import { DatabaseManager } from './databaseManager';
import { MarketAnalysis, Signal, Trade } from '../types/types';
export declare class AITrader {
    private db;
    private model;
    private readonly modelPath;
    private trainingData;
    private isTraining;
    constructor(db: DatabaseManager);
    initialize(): Promise<void>;
    private createModel;
    private loadModel;
    saveModel(): Promise<void>;
    private loadHistoricalData;
    private extractFeatures;
    private createLabel;
    predictSignal(analysis: MarketAnalysis): Promise<Signal>;
    learnFromTrade(trade: Trade, performance: number): Promise<void>;
    private trainModel;
    getModelStats(): Promise<{
        totalTrades: number;
        accuracy: number;
        profitRate: number;
    }>;
}
//# sourceMappingURL=ai-trader-system.d.ts.map