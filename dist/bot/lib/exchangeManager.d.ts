import { ConfigManager } from './configManager';
import { MarketData, Trade } from '../types/types';
export declare class ExchangeManager {
    private exchange;
    private isInitialized;
    constructor(config: ConfigManager);
    initialize(): Promise<void>;
    fetchMarketData(symbol: string): Promise<MarketData>;
    executeTrade(trade: Omit<Trade, 'id' | 'timestamp' | 'fees' | 'performance' | 'profit'>): Promise<Trade>;
    getBalance(): Promise<any>;
    getOpenOrders(symbol?: string): Promise<any[]>;
    getSupportedExchanges(): string[];
    getExchangeName(): string;
}
//# sourceMappingURL=exchangeManager.d.ts.map