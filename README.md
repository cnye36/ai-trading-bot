// README.md
# AI Trading Bot with Learning Capabilities

A sophisticated AI-powered trading bot built with TypeScript that learns from its trading history to improve performance over time.

## Features

🤖 **AI-Powered Decisions**: Uses TensorFlow.js neural networks for trading decisions
📈 **Technical Analysis**: RSI, MACD, Bollinger Bands, and 15+ technical indicators
🧠 **Continuous Learning**: Learns from every trade to improve future performance
⚡ **Real-time Trading**: Executes trades based on live market data
🛡️ **Risk Management**: Built-in position sizing and daily loss limits
💾 **Data Persistence**: SQLite database for trade history and model training
🔄 **Multiple Exchanges**: Support for Binance and other CCXT exchanges

## Quick Start

### 1. Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-trading-bot

# Install dependencies with pnpm
pnpm install
```

### 2. Environment Setup

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your exchange credentials
nano .env
```

### 3. Configure Your Exchange

```env
EXCHANGE=binance
API_KEY=your_api_key_here
API_SECRET=your_api_secret_here
SANDBOX=true  # Set to false for live trading

# Trading pairs
SYMBOLS=BTC/USDT,ETH/USDT

# Risk management
MAX_RISK_PER_TRADE=0.02  # 2% risk per trade
MAX_DAILY_LOSS=0.05      # 5% max daily loss
MIN_CONFIDENCE=0.6       # 60% minimum AI confidence
```

### 4. Build and Run

```bash
# Build the project
pnpm run build

# Start the bot
pnpm run start

# Or run in development mode
pnpm run dev
```

## Project Structure

```
ai-trading-bot/
├── src/
│   ├── bot/
│   │   └── TradingBot.ts          # Main trading logic
│   ├── ai/
│   │   └── AITrader.ts            # Neural network & learning
│   ├── analysis/
│   │   └── MarketAnalyzer.ts      # Technical indicators
│   ├── risk/
│   │   └── RiskManager.ts         # Risk management
│   ├── database/
│   │   └── DatabaseManager.ts     # Data persistence
│   ├── config/
│   │   └── ConfigManager.ts       # Configuration
│   ├── types/
│   │   └── index.ts               # Type definitions
│   └── index.ts                   # Entry point
├── models/                        # AI model storage
├── data/                          # Database files
├── dist/                          # Compiled JavaScript
└── package.json
```

## How It Works

### 1. Market Analysis
- Fetches real-time market data from exchanges
- Calculates 20+ technical indicators (RSI, MACD, Bollinger Bands, etc.)
- Analyzes order book imbalance and market sentiment

### 2. AI Decision Making
- Neural network processes market analysis features
- Outputs buy/sell/hold signals with confidence scores
- Only trades when confidence exceeds configured threshold

### 3. Risk Management
- Position sizing based on account balance and risk tolerance
- Daily loss limits to prevent catastrophic losses
- Volatility and spread checks before executing trades

### 4. Continuous Learning
- Records every trade outcome and market conditions
- Retrains neural network with new data periodically
- Improves decision-making accuracy over time

## Safety Features

⚠️ **Important Safety Notes:**

1. **Start with Sandbox**: Always test with sandbox/paper trading first
2. **Small Position Sizes**: Begin with minimal risk per trade (1-2%)
3. **Monitor Performance**: Check logs and database regularly
4. **Set Stop Losses**: Configure appropriate daily loss limits
5. **Backup Data**: Regularly backup your models and database

## Configuration Options

| Parameter | Default | Description |
|-----------|---------|-------------|
| `MAX_RISK_PER_TRADE` | 0.02 | Maximum risk per trade (2%) |
| `MAX_DAILY_LOSS` | 0.05 | Maximum daily loss limit (5%) |
| `MIN_CONFIDENCE` | 0.6 | Minimum AI confidence to trade (60%) |
| `LEARNING_RATE` | 0.001 | Neural network learning rate |
| `RETRAIN_INTERVAL` | 50 | Retrain model every N trades |

## Monitoring & Analytics

The bot provides comprehensive logging and stores all data for analysis:

```typescript
// Check model performance
const stats = await aiTrader.getModelStats();
console.log(`Accuracy: ${(stats.accuracy * 100).toFixed(2)}%`);
console.log(`Profit Rate: ${(stats.profitRate * 100).toFixed(2)}%`);
```

## Extending the Bot

### Add New Indicators

```typescript
// In MarketAnalyzer.ts
private calculateCustomIndicator(data: number[]): number {
    // Your custom technical indicator logic
    return result;
}
```

### Modify AI Architecture

```typescript
// In AITrader.ts - modify the neural network
tf.layers.dense({
    units: 128,  // Increase neurons
    activation: 'relu'
})
```

### Add New Exchanges

The bot uses CCXT library, supporting 100+ exchanges:

```typescript
// In config
EXCHANGE=ftx  // or coinbase, kraken, etc.
```

## Troubleshooting

### Common Issues

1. **API Errors**: Verify API keys and permissions
2. **Model Training**: Ensure sufficient historical data
3. **Memory Usage**: Monitor TensorFlow.js memory usage
4. **Database Locks**: Check SQLite file permissions

### Logs Location

- Application logs: Console output
- Trade data: `data/trading_bot.db`
- AI models: `models/trading-model/`

## License

MIT License - See LICENSE file for details

## Disclaimer

This software is for educational purposes only. Trading cryptocurrencies involves significant risk. Always test thoroughly and never risk more than you can afford to lose.