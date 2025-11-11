"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
class DatabaseManager {
    db = null;
    async initialize() {
        const dbPath = path_1.default.join(__dirname, '../../data/trading_bot.db');
        this.db = new sqlite3_1.default.Database(dbPath);
        const run = (0, util_1.promisify)(this.db.run.bind(this.db));
        // Create tables
        await run(`
            CREATE TABLE IF NOT EXISTS trades (
                id TEXT PRIMARY KEY,
                symbol TEXT NOT NULL,
                action TEXT NOT NULL,
                amount REAL NOT NULL,
                price REAL NOT NULL,
                timestamp INTEGER NOT NULL,
                confidence REAL NOT NULL,
                fees REAL DEFAULT 0,
                performance REAL,
                profit REAL
            )
        `);
        await run(`
            CREATE TABLE IF NOT EXISTS market_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                price REAL NOT NULL,
                volume REAL NOT NULL,
                analysis TEXT NOT NULL,
                signal TEXT NOT NULL
            )
        `);
        await run(`
            CREATE TABLE IF NOT EXISTS model_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp INTEGER NOT NULL,
                accuracy REAL NOT NULL,
                profit_rate REAL NOT NULL,
                total_trades INTEGER NOT NULL
            )
        `);
        console.log('📊 Database initialized successfully');
    }
    async storeTrade(trade) {
        if (!this.db)
            return;
        const run = (0, util_1.promisify)(this.db.run.bind(this.db));
        await run(`
            INSERT INTO trades (id, symbol, action, amount, price, timestamp, confidence, fees)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [trade.id, trade.symbol, trade.action, trade.amount, trade.price, trade.timestamp, trade.confidence, trade.fees]);
    }
    async updateTradePerformance(tradeId, performance, profit) {
        if (!this.db)
            return;
        const run = (0, util_1.promisify)(this.db.run.bind(this.db));
        await run(`
            UPDATE trades SET performance = ?, profit = ? WHERE id = ?
        `, [performance, profit, tradeId]);
    }
    async storeMarketData(marketData, analysis, signal) {
        if (!this.db)
            return;
        const run = (0, util_1.promisify)(this.db.run.bind(this.db));
        await run(`
            INSERT INTO market_data (symbol, timestamp, price, volume, analysis, signal)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            marketData.symbol,
            marketData.timestamp,
            marketData.price,
            marketData.volume,
            JSON.stringify(analysis),
            JSON.stringify(signal)
        ]);
    }
    async getHistoricalData() {
        if (!this.db)
            return [];
        const all = (0, util_1.promisify)(this.db.all.bind(this.db));
        const rows = await all(`
            SELECT md.analysis, md.signal, t.performance
            FROM market_data md
            LEFT JOIN trades t ON md.timestamp BETWEEN t.timestamp - 60000 AND t.timestamp + 60000
            WHERE md.timestamp > ?
            ORDER BY md.timestamp DESC
            LIMIT 1000
        `, [Date.now() - 30 * 24 * 60 * 60 * 1000]); // Last 30 days
        return rows.map((row) => ({
            analysis: JSON.parse(row.analysis),
            signal: JSON.parse(row.signal),
            performance: row.performance
        }));
    }
    async getAnalysisForTrade(tradeId) {
        if (!this.db)
            return null;
        const get = (0, util_1.promisify)(this.db.get.bind(this.db));
        const trade = await get('SELECT timestamp FROM trades WHERE id = ?', [tradeId]);
        if (!trade)
            return null;
        const analysis = await get(`
            SELECT analysis FROM market_data
            WHERE timestamp BETWEEN ? AND ?
            ORDER BY ABS(timestamp - ?)
            LIMIT 1
        `, [trade.timestamp - 60000, trade.timestamp + 60000, trade.timestamp]);
        return analysis ? JSON.parse(analysis.analysis) : null;
    }
    async getModelPerformanceStats() {
        if (!this.db)
            return { totalTrades: 0, correctPredictions: 0, profitableTrades: 0 };
        const get = (0, util_1.promisify)(this.db.get.bind(this.db));
        const stats = await get(`
            SELECT
                COUNT(*) as totalTrades,
                SUM(CASE WHEN performance > 0.001 THEN 1 ELSE 0 END) as correctPredictions,
                SUM(CASE WHEN profit > 0 THEN 1 ELSE 0 END) as profitableTrades
            FROM trades
            WHERE performance IS NOT NULL
        `);
        return {
            totalTrades: stats.totalTrades || 0,
            correctPredictions: stats.correctPredictions || 0,
            profitableTrades: stats.profitableTrades || 0
        };
    }
    async close() {
        if (this.db) {
            const close = (0, util_1.promisify)(this.db.close.bind(this.db));
            await close();
        }
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=databaseManager.js.map