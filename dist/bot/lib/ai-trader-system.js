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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITrader = void 0;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class AITrader {
    db;
    model = null;
    modelPath = path_1.default.join(__dirname, '../../models/trading-model');
    trainingData = { inputs: [], outputs: [] };
    isTraining = false;
    constructor(db) {
        this.db = db;
    }
    async initialize() {
        try {
            await this.loadModel();
        }
        catch (error) {
            console.log('📚 No existing model found, creating new one...');
            await this.createModel();
        }
        await this.loadHistoricalData();
        await this.trainModel();
    }
    async createModel() {
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({
                    inputShape: [20], // 20 input features
                    units: 64,
                    activation: 'relu',
                    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                }),
                tf.layers.dropout({ rate: 0.3 }),
                tf.layers.dense({
                    units: 32,
                    activation: 'relu',
                    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({
                    units: 16,
                    activation: 'relu'
                }),
                tf.layers.dense({
                    units: 3, // buy, sell, hold
                    activation: 'softmax'
                })
            ]
        });
        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        console.log('🧠 Neural network model created');
    }
    async loadModel() {
        this.model = await tf.loadLayersModel(`file://${this.modelPath}/model.json`);
        console.log('🔄 Loaded existing model');
    }
    async saveModel() {
        if (!this.model)
            return;
        try {
            await promises_1.default.mkdir(this.modelPath, { recursive: true });
            await this.model.save(`file://${this.modelPath}`);
            console.log('💾 Model saved successfully');
        }
        catch (error) {
            console.error('❌ Failed to save model:', error);
        }
    }
    async loadHistoricalData() {
        const historicalData = await this.db.getHistoricalData();
        this.trainingData.inputs = [];
        this.trainingData.outputs = [];
        for (const data of historicalData) {
            const features = this.extractFeatures(data.analysis);
            const label = this.createLabel(data.signal, data.performance || 0);
            this.trainingData.inputs.push(features);
            this.trainingData.outputs.push(label);
        }
        console.log(`📊 Loaded ${this.trainingData.inputs.length} historical data points`);
    }
    extractFeatures(analysis) {
        return [
            analysis.rsi || 0,
            analysis.macd?.macd || 0,
            analysis.macd?.signal || 0,
            analysis.macd?.histogram || 0,
            analysis.bollinger?.upper || 0,
            analysis.bollinger?.middle || 0,
            analysis.bollinger?.lower || 0,
            analysis.stochastic?.k || 0,
            analysis.stochastic?.d || 0,
            analysis.atr || 0,
            analysis.volumeRatio || 0,
            analysis.priceChange1h || 0,
            analysis.priceChange24h || 0,
            analysis.volatility || 0,
            analysis.trendStrength || 0,
            analysis.supportLevel || 0,
            analysis.resistanceLevel || 0,
            analysis.momentum || 0,
            analysis.marketSentiment || 0,
            analysis.orderBookImbalance || 0
        ];
    }
    createLabel(signal, performance) {
        // Create label based on signal and actual performance
        let trueAction = 2; // hold by default
        if (signal.action === 'buy' && performance > 0.005) { // Profitable buy
            trueAction = 0; // buy
        }
        else if (signal.action === 'sell' && performance > 0.005) { // Profitable sell
            trueAction = 1; // sell
        }
        else if (Math.abs(performance) < 0.002) { // Neutral performance
            trueAction = 2; // hold
        }
        const label = [0, 0, 0];
        label[trueAction] = 1;
        return label;
    }
    async predictSignal(analysis) {
        if (!this.model) {
            return { action: 'hold', confidence: 0, reasoning: 'Model not ready' };
        }
        const features = this.extractFeatures(analysis);
        const inputTensor = tf.tensor2d([features]);
        const prediction = this.model.predict(inputTensor);
        const probabilities = await prediction.data();
        inputTensor.dispose();
        prediction.dispose();
        const [buyProb, sellProb, holdProb] = probabilities;
        const maxProb = Math.max(buyProb, sellProb, holdProb);
        let action;
        let reasoning;
        if (maxProb === buyProb && buyProb > 0.6) {
            action = 'buy';
            reasoning = `High buy probability (${(buyProb * 100).toFixed(1)}%)`;
        }
        else if (maxProb === sellProb && sellProb > 0.6) {
            action = 'sell';
            reasoning = `High sell probability (${(sellProb * 100).toFixed(1)}%)`;
        }
        else {
            action = 'hold';
            reasoning = `Uncertain market conditions (buy: ${(buyProb * 100).toFixed(1)}%, sell: ${(sellProb * 100).toFixed(1)}%)`;
        }
        return {
            action,
            confidence: maxProb,
            reasoning,
            probabilities: { buy: buyProb, sell: sellProb, hold: holdProb }
        };
    }
    async learnFromTrade(trade, performance) {
        // Add this trade to training data for continuous learning
        const analysis = await this.db.getAnalysisForTrade(trade.id);
        if (!analysis)
            return;
        const features = this.extractFeatures(analysis);
        const label = this.createLabel({ action: trade.action, confidence: trade.confidence, reasoning: '' }, performance);
        this.trainingData.inputs.push(features);
        this.trainingData.outputs.push(label);
        // Retrain periodically or when we have enough new data
        if (this.trainingData.inputs.length % 50 === 0) {
            await this.trainModel();
        }
    }
    async trainModel() {
        if (!this.model || this.trainingData.inputs.length < 10 || this.isTraining) {
            return;
        }
        this.isTraining = true;
        try {
            console.log('🎓 Training AI model...');
            const inputs = tf.tensor2d(this.trainingData.inputs);
            const outputs = tf.tensor2d(this.trainingData.outputs);
            // Split data for validation
            const splitIndex = Math.floor(this.trainingData.inputs.length * 0.8);
            const trainInputs = inputs.slice([0, 0], [splitIndex, -1]);
            const trainOutputs = outputs.slice([0, 0], [splitIndex, -1]);
            const valInputs = inputs.slice([splitIndex, 0], [-1, -1]);
            const valOutputs = outputs.slice([splitIndex, 0], [-1, -1]);
            const history = await this.model.fit(trainInputs, trainOutputs, {
                epochs: 50,
                batchSize: 32,
                validationData: [valInputs, valOutputs],
                verbose: 0,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        if (epoch % 10 === 0) {
                            console.log(`Epoch ${epoch}: loss=${logs?.loss?.toFixed(4)}, accuracy=${logs?.acc?.toFixed(4)}`);
                        }
                    }
                }
            });
            // Clean up tensors
            inputs.dispose();
            outputs.dispose();
            trainInputs.dispose();
            trainOutputs.dispose();
            valInputs.dispose();
            valOutputs.dispose();
            const finalLoss = history.history.loss[history.history.loss.length - 1];
            const finalAccuracy = history.history.acc[history.history.acc.length - 1];
            console.log(`✅ Training completed! Loss: ${finalLoss.toFixed(4)}, Accuracy: ${(finalAccuracy * 100).toFixed(2)}%`);
            await this.saveModel();
        }
        catch (error) {
            console.error('❌ Training failed:', error);
        }
        finally {
            this.isTraining = false;
        }
    }
    async getModelStats() {
        const stats = await this.db.getModelPerformanceStats();
        return {
            totalTrades: stats.totalTrades,
            accuracy: stats.correctPredictions / stats.totalTrades,
            profitRate: stats.profitableTrades / stats.totalTrades
        };
    }
}
exports.AITrader = AITrader;
//# sourceMappingURL=ai-trader-system.js.map