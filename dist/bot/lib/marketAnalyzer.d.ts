import { MarketData, MarketAnalysis } from '../types/types';
export declare class MarketAnalyzer {
    analyze(marketData: MarketData): Promise<MarketAnalysis>;
    private calculateRSI;
    private calculateMACD;
    private calculateBollingerBands;
    private calculateStochastic;
    private calculateATR;
    private calculatePriceChange;
    private calculateVolatility;
    private calculateVolumeRatio;
    private calculateTrendStrength;
    private calculateMomentum;
    private calculateSupportLevel;
    private calculateResistanceLevel;
    private calculateMarketSentiment;
    private calculateOrderBookImbalance;
}
//# sourceMappingURL=marketAnalyzer.d.ts.map