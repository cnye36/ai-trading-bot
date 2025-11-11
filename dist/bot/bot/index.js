"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load polyfills first (must be before TensorFlow imports)
require("../lib/polyfills");
const configManager_1 = require("../lib/configManager");
const databaseManager_1 = require("../lib/databaseManager");
const exchangeManager_1 = require("../lib/exchangeManager");
const marketAnalyzer_1 = require("../lib/marketAnalyzer");
const ai_trader_system_1 = require("../lib/ai-trader-system");
const riskManager_1 = require("../lib/riskManager");
const node_cron_1 = __importDefault(require("node-cron"));
class TradingBot {
    config;
    db;
    exchange;
    analyzer;
    aiTrader;
    riskManager;
    isRunning = false;
    symbols = [];
    constructor() {
        this.config = new configManager_1.ConfigManager();
        this.db = new databaseManager_1.DatabaseManager();
        this.exchange = new exchangeManager_1.ExchangeManager(this.config);
        this.analyzer = new marketAnalyzer_1.MarketAnalyzer();
        this.aiTrader = new ai_trader_system_1.AITrader(this.db);
        this.riskManager = new riskManager_1.RiskManager(this.config);
    }
    async initialize() {
        console.log('🚀 Starting AI Trading Bot...');
        console.log('═══════════════════════════════════════════');
        // Validate configuration
        if (!this.config.validateConfig()) {
            throw new Error('Invalid configuration. Please check your .env file.');
        }
        // Initialize database
        await this.db.initialize();
        // Initialize exchange
        await this.exchange.initialize();
        // Initialize AI model
        await this.aiTrader.initialize();
        // Get trading symbols
        this.symbols = this.config.get('symbols', ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'DOGE/USDT', 'PEPE/USDT', 'FLOKI/USDT', 'BONK/USDT']);
        console.log(`📊 Trading pairs: ${this.symbols.join(', ')}`);
        console.log('═══════════════════════════════════════════');
        this.isRunning = true;
    }
    async processMarket(symbol) {
        try {
            // Fetch market data
            const marketData = await this.exchange.fetchMarketData(symbol);
            // Analyze market
            const analysis = await this.analyzer.analyze(marketData);
            // Get AI prediction
            const signal = await this.aiTrader.predictSignal(analysis);
            // Store analysis data
            await this.db.storeMarketData(marketData, analysis, signal);
            // Check if we should trade
            if (signal.action !== 'hold') {
                const shouldTrade = await this.riskManager.shouldTrade(signal, marketData);
                if (shouldTrade) {
                    await this.executeTrade(signal, marketData);
                }
            }
            // Log signal
            if (signal.action !== 'hold') {
                console.log(`📊 ${symbol}: ${signal.action.toUpperCase()} (${(signal.confidence * 100).toFixed(1)}%) - ${signal.reasoning}`);
            }
        }
        catch (error) {
            console.error(`❌ Error processing ${symbol}:`, error.message);
        }
    }
    async executeTrade(signal, marketData) {
        try {
            const balance = await this.exchange.getBalance();
            const tradeSize = this.riskManager.calculateTradeSize(balance, marketData);
            if (tradeSize < 0.0001) {
                console.log(`⚠️  Trade size too small for ${marketData.symbol}, skipping...`);
                return;
            }
            const trade = await this.exchange.executeTrade({
                symbol: marketData.symbol,
                action: signal.action,
                amount: tradeSize,
                price: marketData.price,
                confidence: signal.confidence
            });
            await this.db.storeTrade(trade);
            console.log(`✅ Trade executed: ${trade.action.toUpperCase()} ${trade.amount} ${trade.symbol} @ ${trade.price}`);
            // Schedule performance tracking
            setTimeout(async () => {
                await this.trackTradePerformance(trade);
            }, 60 * 60 * 1000); // Track after 1 hour
        }
        catch (error) {
            console.error(`❌ Failed to execute trade:`, error.message);
        }
    }
    async trackTradePerformance(trade) {
        try {
            const currentData = await this.exchange.fetchMarketData(trade.symbol);
            const currentPrice = currentData.price;
            let performance = 0;
            let profit = 0;
            if (trade.action === 'buy') {
                performance = (currentPrice - trade.price) / trade.price;
                profit = (currentPrice - trade.price) * trade.amount - trade.fees;
            }
            else {
                performance = (trade.price - currentPrice) / trade.price;
                profit = (trade.price - currentPrice) * trade.amount - trade.fees;
            }
            await this.db.updateTradePerformance(trade.id, performance, profit);
            await this.aiTrader.learnFromTrade(trade, performance);
            if (profit < 0) {
                this.riskManager.recordLoss(Math.abs(performance));
            }
            console.log(`📈 Trade ${trade.id} performance: ${(performance * 100).toFixed(2)}%, profit: $${profit.toFixed(2)}`);
        }
        catch (error) {
            console.error(`❌ Failed to track trade performance:`, error.message);
        }
    }
    async scanMarkets() {
        if (!this.isRunning)
            return;
        console.log(`📊 Scanning ${this.symbols.length} markets...`);
        // Process markets in parallel
        await Promise.all(this.symbols.map(symbol => this.processMarket(symbol)));
    }
    async start() {
        await this.initialize();
        console.log('📊 Trading bot is now active and monitoring markets...');
        console.log('🚀 AI Trading Bot started successfully!');
        console.log('📊 Dashboard available at http://localhost:3001/dashboard');
        console.log('═══════════════════════════════════════════');
        // Initial market scan
        await this.scanMarkets();
        // Schedule regular market scans (every 5 minutes)
        node_cron_1.default.schedule('*/5 * * * *', async () => {
            await this.scanMarkets();
        });
        // Schedule model saving (every hour)
        node_cron_1.default.schedule('0 * * * *', async () => {
            await this.aiTrader.saveModel();
        });
        // Keep the process running
        process.on('SIGINT', async () => {
            await this.shutdown();
        });
        process.on('SIGTERM', async () => {
            await this.shutdown();
        });
    }
    async shutdown() {
        console.log('\n🛑 Shutting down trading bot...');
        this.isRunning = false;
        await this.aiTrader.saveModel();
        await this.db.close();
        console.log('👋 Trading bot stopped successfully');
        process.exit(0);
    }
    async getStats() {
        const modelStats = await this.aiTrader.getModelStats();
        const balance = await this.exchange.getBalance();
        return {
            exchange: this.exchange.getExchangeName(),
            tradingPairs: this.symbols,
            modelStats,
            balance: balance.total
        };
    }
}
// Start the bot
const bot = new TradingBot();
bot.start().catch(error => {
    console.error('💥 Fatal error starting trading bot:', error);
    process.exit(1);
});
exports.default = bot;
//# sourceMappingURL=index.js.map