// src/analysis/MarketAnalyzer.ts
import { 
    RSI, MACD, BollingerBands, Stochastic, ATR,
    SMA, EMA
} from 'technicalindicators';
import { MarketData, MarketAnalysis, OHLCV } from '../../../types';

export class MarketAnalyzer {
    async analyze(marketData: MarketData): Promise<MarketAnalysis> {
        const ohlcv = marketData.ohlcv;
        const closes = ohlcv.map(d => d.close);
        const highs = ohlcv.map(d => d.high);
        const lows = ohlcv.map(d => d.low);
        const volumes = ohlcv.map(d => d.volume);

        // Technical indicators
        const rsi = this.calculateRSI(closes);
        const macd = this.calculateMACD(closes);
        const bollinger = this.calculateBollingerBands(closes);
        const stochastic = this.calculateStochastic(highs, lows, closes);
        const atr = this.calculateATR(highs, lows, closes);

        // Price analysis
        const priceChange1h = this.calculatePriceChange(closes, 60);
        const priceChange24h = this.calculatePriceChange(closes, 1440);
        const volatility = this.calculateVolatility(closes);
        
        // Volume analysis
        const volumeRatio = this.calculateVolumeRatio(volumes);
        
        // Trend analysis
        const trendStrength = this.calculateTrendStrength(closes);
        const momentum = this.calculateMomentum(closes);
        
        // Support/Resistance
        const supportLevel = this.calculateSupportLevel(lows);
        const resistanceLevel = this.calculateResistanceLevel(highs);
        
        // Market sentiment (simplified)
        const marketSentiment = this.calculateMarketSentiment(marketData);
        
        // Order book analysis
        const orderBookImbalance = this.calculateOrderBookImbalance(marketData);

        return {
            rsi,
            macd,
            bollinger,
            stochastic,
            atr,
            priceChange1h,
            priceChange24h,
            volatility,
            volumeRatio,
            trendStrength,
            momentum,
            supportLevel,
            resistanceLevel,
            marketSentiment,
            orderBookImbalance,
            timestamp: Date.now()
        };
    }

    private calculateRSI(closes: number[]): number {
        if (closes.length < 14) return 50;
        const rsiValues = RSI.calculate({ values: closes, period: 14 });
        return rsiValues[rsiValues.length - 1] || 50;
    }

    private calculateMACD(closes: number[]): { macd: number, signal: number, histogram: number } {
        if (closes.length < 26) return { macd: 0, signal: 0, histogram: 0 };
        
        const macdResult = MACD.calculate({
            values: closes,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9
        });
        
        const latest = macdResult[macdResult.length - 1];
        return {
            macd: latest?.MACD || 0,
            signal: latest?.signal || 0,
            histogram: latest?.histogram || 0
        };
    }

    private calculateBollingerBands(closes: number[]): { upper: number, middle: number, lower: number } {
        if (closes.length < 20) return { upper: 0, middle: 0, lower: 0 };
        
        const bb = BollingerBands.calculate({
            values: closes,
            period: 20,
            stdDev: 2
        });
        
        const latest = bb[bb.length - 1];
        return {
            upper: latest?.upper || 0,
            middle: latest?.middle || 0,
            lower: latest?.lower || 0
        };
    }

    private calculateStochastic(highs: number[], lows: number[], closes: number[]): { k: number, d: number } {
        if (closes.length < 14) return { k: 50, d: 50 };
        
        const stoch = Stochastic.calculate({
            high: highs,
            low: lows,
            close: closes,
            period: 14,
            signalPeriod: 3
        });
        
        const latest = stoch[stoch.length - 1];
        return {
            k: latest?.k || 50,
            d: latest?.d || 50
        };
    }

    private calculateATR(highs: number[], lows: number[], closes: number[]): number {
        if (closes.length < 14) return 0;
        
        const atrValues = ATR.calculate({
            high: highs,
            low: lows,
            close: closes,
            period: 14
        });
        
        return atrValues[atrValues.length - 1] || 0;
    }

    private calculatePriceChange(closes: number[], periods: number): number {
        if (closes.length < periods + 1) return 0;
        
        const current = closes[closes.length - 1];
        const previous = closes[closes.length - 1 - periods];
        
        return (current - previous) / previous;
    }

    private calculateVolatility(closes: number[]): number {
        if (closes.length < 2) return 0;
        
        const returns = [];
        for (let i = 1; i < closes.length; i++) {
            returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
        }
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        
        return Math.sqrt(variance);
    }

    private calculateVolumeRatio(volumes: number[]): number {
        if (volumes.length < 20) return 1;
        
        const currentVolume = volumes[volumes.length - 1];
        const averageVolume = volumes.slice(-20).reduce((sum, v) => sum + v, 0) / 20;
        
        return currentVolume / averageVolume;
    }

    private calculateTrendStrength(closes: number[]): number {
        if (closes.length < 20) return 0;
        
        const sma20 = SMA.calculate({ values: closes, period: 20 });
        const ema12 = EMA.calculate({ values: closes, period: 12 });
        
        const currentPrice = closes[closes.length - 1];
        const currentSMA = sma20[sma20.length - 1];
        const currentEMA = ema12[ema12.length - 1];
        
        // Trend strength based on price position relative to moving averages
        let strength = 0;
        if (currentPrice > currentSMA) strength += 0.5;
        if (currentPrice > currentEMA) strength += 0.5;
        
        return strength;
    }

    private calculateMomentum(closes: number[]): number {
        if (closes.length < 10) return 0;
        
        const current = closes[closes.length - 1];
        const previous = closes[closes.length - 10];
        
        return (current - previous) / previous;
    }

    private calculateSupportLevel(lows: number[]): number {
        if (lows.length < 20) return 0;
        
        const recentLows = lows.slice(-20);
        return Math.min(...recentLows);
    }

    private calculateResistanceLevel(highs: number[]): number {
        if (highs.length < 20) return 0;
        
        const recentHighs = highs.slice(-20);
        return Math.max(...recentHighs);
    }

    private calculateMarketSentiment(marketData: MarketData): number {
        // Simplified sentiment based on price action and volume
        const priceChange = (marketData.price - marketData.ohlcv[marketData.ohlcv.length - 2]?.close) / 
                           marketData.ohlcv[marketData.ohlcv.length - 2]?.close || 0;
        
        const volumeRatio = marketData.volume / 
                           (marketData.ohlcv.slice(-10).reduce((sum, d) => sum + d.volume, 0) / 10);
        
        return (priceChange * volumeRatio) / 2; // Normalized sentiment
    }

    private calculateOrderBookImbalance(marketData: MarketData): number {
        // Order book imbalance (bid vs ask pressure)
        const midPrice = (marketData.bid + marketData.ask) / 2;
        const spreadRatio = marketData.spread / midPrice;
        
        return (marketData.bid - marketData.ask) / (marketData.bid + marketData.ask) - spreadRatio;
    }
}

