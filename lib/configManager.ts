// src/config/ConfigManager.ts
import dotenv from 'dotenv';

export class ConfigManager {
    private config: Map<string, any> = new Map();

    constructor() {
        dotenv.config();
        this.loadConfig();
    }

    private loadConfig(): void {
        // Exchange configuration
        this.config.set('exchange', process.env.EXCHANGE || 'binance');
        this.config.set('apiKey', process.env.API_KEY || '');
        this.config.set('secret', process.env.API_SECRET || '');
        this.config.set('sandbox', process.env.SANDBOX === 'true');

        // Trading configuration
        this.config.set('symbols', process.env.SYMBOLS?.split(',') || ['BTC/USDT', 'ETH/USDT']);
        this.config.set('maxRiskPerTrade', parseFloat(process.env.MAX_RISK_PER_TRADE || '0.02'));
        this.config.set('maxDailyLoss', parseFloat(process.env.MAX_DAILY_LOSS || '0.05'));
        this.config.set('minConfidence', parseFloat(process.env.MIN_CONFIDENCE || '0.6'));

        // AI configuration
        this.config.set('learningRate', parseFloat(process.env.LEARNING_RATE || '0.001'));
        this.config.set('retrainInterval', parseInt(process.env.RETRAIN_INTERVAL || '50'));
        this.config.set('modelSaveInterval', parseInt(process.env.MODEL_SAVE_INTERVAL || '100'));
    }

    get(key: string, defaultValue?: any): any {
        return this.config.get(key) ?? defaultValue;
    }

    set(key: string, value: any): void {
        this.config.set(key, value);
    }

    validateConfig(): boolean {
        const requiredKeys = ['exchange', 'apiKey', 'secret'];
        
        for (const key of requiredKeys) {
            if (!this.config.get(key)) {
                console.error(`❌ Missing required configuration: ${key}`);
                return false;
            }
        }

        return true;
    }
}


