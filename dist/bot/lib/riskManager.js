"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskManager = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
class RiskManager {
    maxRiskPerTrade;
    maxDailyLoss;
    minConfidenceThreshold;
    dailyLoss = 0;
    lastResetDate = new Date().toDateString();
    constructor(config) {
        this.maxRiskPerTrade = config.get('maxRiskPerTrade', 0.02); // 2% max risk per trade
        this.maxDailyLoss = config.get('maxDailyLoss', 0.05); // 5% max daily loss
        this.minConfidenceThreshold = config.get('minConfidence', 0.6);
    }
    async shouldTrade(signal, marketData) {
        // Reset daily loss if it's a new day
        const today = new Date().toDateString();
        if (today !== this.lastResetDate) {
            this.dailyLoss = 0;
            this.lastResetDate = today;
        }
        // Check confidence threshold
        if (signal.confidence < this.minConfidenceThreshold) {
            console.log(`❌ Trade rejected: Low confidence (${(signal.confidence * 100).toFixed(1)}%)`);
            return false;
        }
        // Check daily loss limit
        if (this.dailyLoss >= this.maxDailyLoss) {
            console.log(`❌ Trade rejected: Daily loss limit reached (${(this.dailyLoss * 100).toFixed(2)}%)`);
            return false;
        }
        // Check volatility
        if (this.isVolatilityTooHigh(marketData)) {
            console.log(`❌ Trade rejected: Market volatility too high`);
            return false;
        }
        // Check spread
        if (this.isSpreadTooWide(marketData)) {
            console.log(`❌ Trade rejected: Spread too wide`);
            return false;
        }
        return true;
    }
    calculateTradeSize(balance, marketData) {
        const availableBalance = balance.USDT?.free || 0;
        const riskAmount = new decimal_js_1.default(availableBalance).mul(this.maxRiskPerTrade);
        // Calculate position size based on ATR for stop loss
        const stopLossDistance = marketData.price * 0.02; // 2% stop loss
        const positionSize = riskAmount.div(stopLossDistance);
        // Ensure we don't exceed available balance
        const maxSize = new decimal_js_1.default(availableBalance).div(marketData.price).mul(0.95); // 95% of available
        return Math.min(positionSize.toNumber(), maxSize.toNumber());
    }
    isVolatilityTooHigh(marketData) {
        // Check if recent price swings are too extreme
        const recentCandles = marketData.ohlcv.slice(-5);
        const maxChange = Math.max(...recentCandles.map(c => Math.abs(c.close - c.open) / c.open));
        return maxChange > 0.05; // 5% volatility threshold
    }
    isSpreadTooWide(marketData) {
        const spreadPercent = marketData.spread / marketData.price;
        return spreadPercent > 0.001; // 0.1% spread threshold
    }
    recordLoss(lossPercent) {
        this.dailyLoss += lossPercent;
    }
}
exports.RiskManager = RiskManager;
//# sourceMappingURL=riskManager.js.map