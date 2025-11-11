"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
class ConfigManager {
    config = new Map();
    constructor() {
        dotenv_1.default.config();
        this.loadConfig();
    }
    loadConfig() {
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
    get(key, defaultValue) {
        return this.config.get(key) ?? defaultValue;
    }
    set(key, value) {
        this.config.set(key, value);
    }
    validateConfig() {
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
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=configManager.js.map