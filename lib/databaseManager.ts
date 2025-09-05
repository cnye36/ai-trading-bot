// src/database/DatabaseManager.ts
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { Trade, MarketData, MarketAnalysis, Signal } from '../types';
import path from 'path';

export class DatabaseManager {
    private db: sqlite3.Database | null = null;

    async initialize(): Promise<void> {
        const dbPath = path.join(__dirname, '../../data/trading_bot.db');
        
        this.db = new sqlite3.Database(dbPath);
        const run = promisify(this.db.run.bind(this.db));

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

    async storeTrade(trade: Trade): Promise<void> {
        if (!this.db) return;

        const run = promisify(this.db.run.bind(this.db));
        await run(`
            INSERT INTO trades (id, symbol, action, amount, price, timestamp, confidence, fees)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [trade.id, trade.symbol, trade.action, trade.amount, trade.price, trade.timestamp, trade.confidence, trade.fees]);
    }

    async updateTradePerformance(tradeId: string, performance: number, profit: number): Promise<void> {
        if (!this.db) return;

        const run = promisify(this.db.run.bind(this.db));
        await run(`
            UPDATE trades SET performance = ?, profit = ? WHERE id = ?
        `, [performance, profit, tradeId]);
    }

    async storeMarketData(marketData: MarketData, analysis: MarketAnalysis, signal: Signal): Promise<void> {
        if (!this.db) return;

        const run = promisify(this.db.run.bind(this.db));
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

    async getHistoricalData(): Promise<Array<{analysis: MarketAnalysis, signal: Signal, performance?: number}>> {
        if (!this.db) return [];

        const all = promisify(this.db.all.bind(this.db));
        const rows: any[] = await all(`
            SELECT md.analysis, md.signal, t.performance
            FROM market_data md
            LEFT JOIN trades t ON md.timestamp BETWEEN t.timestamp - 60000 AND t.timestamp + 60000
            WHERE md.timestamp > ?
            ORDER BY md.timestamp DESC
            LIMIT 1000
        `, [Date.now() - 30 * 24 * 60 * 60 * 1000]); // Last 30 days

        return rows.map(row => ({
            analysis: JSON.parse(row.analysis),
            signal: JSON.parse(row.signal),
            performance: row.performance
        }));
    }

    async getAnalysisForTrade(tradeId: string): Promise<MarketAnalysis | null> {
        if (!this.db) return null;

        const get = promisify(this.db.get.bind(this.db));
        const trade: any = await get('SELECT timestamp FROM trades WHERE id = ?', [tradeId]);
        if (!trade) return null;

        const analysis: any = await get(`
            SELECT analysis FROM market_data 
            WHERE timestamp BETWEEN ? AND ? 
            ORDER BY ABS(timestamp - ?) 
            LIMIT 1
        `, [trade.timestamp - 60000, trade.timestamp + 60000, trade.timestamp]);

        return analysis ? JSON.parse(analysis.analysis) : null;
    }

    async getModelPerformanceStats(): Promise<{
        totalTrades: number,
        correctPredictions: number,
        profitableTrades: number
    }> {
        if (!this.db) return { totalTrades: 0, correctPredictions: 0, profitableTrades: 0 };

        const get = promisify(this.db.get.bind(this.db));
        const stats: any = await get(`
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

    async close(): Promise<void> {
        if (this.db) {
            const close = promisify(this.db.close.bind(this.db));
            await close();
        }
    }
}