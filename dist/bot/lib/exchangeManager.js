"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeManager = void 0;
const ccxt = __importStar(require("ccxt"));
class ExchangeManager {
    exchange;
    isInitialized = false;
    constructor(config) {
        const exchangeId = config.get('exchange', 'binance');
        const ExchangeClass = ccxt[exchangeId];
        this.exchange = new ExchangeClass({
            apiKey: config.get('apiKey'),
            secret: config.get('secret'),
            enableRateLimit: true,
            options: {
                defaultType: 'spot',
                adjustForTimeDifference: true
            }
        });
        if (config.get('sandbox')) {
            this.exchange.setSandboxMode(true);
            console.log('🏖️  Running in SANDBOX mode');
        }
    }
    async initialize() {
        try {
            await this.exchange.loadMarkets();
            this.isInitialized = true;
            console.log(`🔗 Connected to ${this.exchange.name}`);
        }
        catch (error) {
            console.error('❌ Failed to initialize exchange:', error);
            throw error;
        }
    }
    async fetchMarketData(symbol) {
        if (!this.isInitialized) {
            throw new Error('Exchange not initialized');
        }
        try {
            // Fetch current ticker
            const ticker = await this.exchange.fetchTicker(symbol);
            // Fetch order book
            const orderBook = await this.exchange.fetchOrderBook(symbol);
            // Fetch OHLCV data (last 100 candles, 1-minute timeframe)
            const ohlcvData = await this.exchange.fetchOHLCV(symbol, '1m', undefined, 100);
            const ohlcv = ohlcvData.map((candle) => ({
                timestamp: Number(candle[0]),
                open: Number(candle[1]),
                high: Number(candle[2]),
                low: Number(candle[3]),
                close: Number(candle[4]),
                volume: Number(candle[5])
            }));
            const bid = orderBook.bids.length > 0 ? Number(orderBook.bids[0][0]) : Number(ticker.bid || ticker.last);
            const ask = orderBook.asks.length > 0 ? Number(orderBook.asks[0][0]) : Number(ticker.ask || ticker.last);
            return {
                symbol,
                timestamp: Number(ticker.timestamp || Date.now()),
                price: Number(ticker.last),
                volume: Number(ticker.quoteVolume || ticker.baseVolume || 0),
                ohlcv,
                bid,
                ask,
                spread: Number(ask - bid)
            };
        }
        catch (error) {
            console.error(`❌ Error fetching market data for ${symbol}:`, error);
            throw error;
        }
    }
    async executeTrade(trade) {
        if (!this.isInitialized) {
            throw new Error('Exchange not initialized');
        }
        try {
            const orderType = 'market';
            const side = trade.action;
            const amount = trade.amount;
            console.log(`📤 Executing ${side} order: ${amount} ${trade.symbol} @ market price`);
            const order = await this.exchange.createOrder(trade.symbol, orderType, side, amount);
            const fees = order.fee?.cost || (trade.price * amount * 0.001); // Estimate 0.1% if not provided
            return {
                id: order.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                symbol: trade.symbol,
                action: trade.action,
                amount: order.filled || amount,
                price: order.average || trade.price,
                timestamp: order.timestamp || Date.now(),
                confidence: trade.confidence,
                fees
            };
        }
        catch (error) {
            console.error(`❌ Failed to execute trade:`, error);
            throw error;
        }
    }
    async getBalance() {
        if (!this.isInitialized) {
            throw new Error('Exchange not initialized');
        }
        try {
            return await this.exchange.fetchBalance();
        }
        catch (error) {
            console.error('❌ Failed to fetch balance:', error);
            throw error;
        }
    }
    async getOpenOrders(symbol) {
        if (!this.isInitialized) {
            throw new Error('Exchange not initialized');
        }
        try {
            return await this.exchange.fetchOpenOrders(symbol);
        }
        catch (error) {
            console.error('❌ Failed to fetch open orders:', error);
            throw error;
        }
    }
    getSupportedExchanges() {
        return Object.keys(ccxt.exchanges);
    }
    getExchangeName() {
        return this.exchange.name || 'Unknown';
    }
}
exports.ExchangeManager = ExchangeManager;
//# sourceMappingURL=exchangeManager.js.map