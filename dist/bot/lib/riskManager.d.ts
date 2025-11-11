import { ConfigManager } from './configManager';
import { Signal, MarketData } from '../types/types';
export declare class RiskManager {
    private maxRiskPerTrade;
    private maxDailyLoss;
    private minConfidenceThreshold;
    private dailyLoss;
    private lastResetDate;
    constructor(config: ConfigManager);
    shouldTrade(signal: Signal, marketData: MarketData): Promise<boolean>;
    calculateTradeSize(balance: any, marketData: MarketData): number;
    private isVolatilityTooHigh;
    private isSpreadTooWide;
    recordLoss(lossPercent: number): void;
}
//# sourceMappingURL=riskManager.d.ts.map