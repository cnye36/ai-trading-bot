import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Brain, AlertTriangle } from 'lucide-react';

const TradingBotDashboard = () => {
  const [botStatus, setBotStatus] = useState('running');
  const [stats, setStats] = useState({
    totalTrades: 127,
    profitableTrades: 76,
    totalProfit: 1847.32,
    accuracy: 84.2,
    dailyPnL: 127.45,
    currentBalance: 10847.32
  });

  const [performanceData] = useState([
    { date: '2025-08-25', profit: 45.67, trades: 12, accuracy: 83.3 },
    { date: '2025-08-26', profit: 78.23, trades: 15, accuracy: 86.7 },
    { date: '2025-08-27', profit: -23.45, trades: 8, accuracy: 75.0 },
    { date: '2025-08-28', profit: 156.78, trades: 18, accuracy: 88.9 },
    { date: '2025-08-29', profit: 89.34, trades: 14, accuracy: 85.7 },
    { date: '2025-08-30', profit: 127.45, trades: 11, accuracy: 90.9 }
  ]);

  const [recentTrades] = useState([
    { id: 1, symbol: 'BTC/USDT', action: 'buy', amount: 0.025, price: 64250, profit: 23.45, confidence: 87.3, time: '14:32:12' },
    { id: 2, symbol: 'ETH/USDT', action: 'sell', amount: 0.8, price: 3420, profit: -12.34, confidence: 72.1, time: '14:28:45' },
    { id: 3, symbol: 'BTC/USDT', action: 'buy', amount: 0.018, price: 64100, profit: 45.67, confidence: 91.2, time: '14:15:33' },
    { id: 4, symbol: 'ETH/USDT', action: 'sell', amount: 1.2, price: 3445, profit: 78.90, confidence: 85.6, time: '14:02:18' }
  ]);

  const [aiMetrics] = useState({
    modelAccuracy: 84.2,
    predictionConfidence: 76.8,
    learningProgress: 92.3,
    totalTrainingData: 15420
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        currentBalance: prev.currentBalance + (Math.random() - 0.5) * 10,
        dailyPnL: prev.dailyPnL + (Math.random() - 0.5) * 5
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, suffix = '' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}{suffix}</p>
        </div>
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">AI Trading Bot Dashboard</h1>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                botStatus === 'running' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  botStatus === 'running' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {botStatus === 'running' ? 'Active' : 'Stopped'}
              </div>
              <button
                onClick={() => setBotStatus(botStatus === 'running' ? 'stopped' : 'running')}
                className={`px-4 py-2 rounded-md font-medium ${
                  botStatus === 'running' 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {botStatus === 'running' ? 'Stop Bot' : 'Start Bot'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Profit"
            value={`$${stats.totalProfit.toLocaleString()}`}
            icon={DollarSign}
            color="#10B981"
          />
          <StatCard
            title="Accuracy"
            value={stats.accuracy}
            icon={Brain}
            color="#3B82F6"
            suffix="%"
          />
          <StatCard
            title="Total Trades"
            value={stats.totalTrades}
            icon={Activity}
            color="#8B5CF6"
          />
          <StatCard
            title="Today's P&L"
            value={stats.dailyPnL > 0 ? `+$${stats.dailyPnL.toFixed(2)}` : `-$${Math.abs(stats.dailyPnL).toFixed(2)}`}
            icon={stats.dailyPnL > 0 ? TrendingUp : TrendingDown}
            color={stats.dailyPnL > 0 ? "#10B981" : "#EF4444"}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Profit ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Accuracy Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Model Accuracy</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[70, 95]} />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#3B82F6" name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Metrics & Recent Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="h-5 w-5 text-blue-500 mr-2" />
              AI Metrics
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Model Accuracy</span>
                  <span className="font-semibold">{aiMetrics.modelAccuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${aiMetrics.modelAccuracy}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Prediction Confidence</span>
                  <span className="font-semibold">{aiMetrics.predictionConfidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${aiMetrics.predictionConfidence}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Learning Progress</span>
                  <span className="font-semibold">{aiMetrics.learningProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${aiMetrics.learningProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Training Data Points</span>
                  <span className="font-semibold">{aiMetrics.totalTrainingData.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Trades */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 text-green-500 mr-2" />
              Recent Trades
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Symbol</th>
                    <th className="text-left py-2">Action</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Price</th>
                    <th className="text-left py-2">P&L</th>
                    <th className="text-left py-2">Confidence</th>
                    <th className="text-left py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 font-medium">{trade.symbol}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.action === 'buy' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3">{trade.amount}</td>
                      <td className="py-3">${trade.price.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`font-semibold ${
                          trade.profit > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <span className="text-xs mr-1">{trade.confidence.toFixed(1)}%</span>
                          <div className="w-12 bg-gray-200 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full ${
                                trade.confidence > 80 ? 'bg-green-500' : 
                                trade.confidence > 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${trade.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">{trade.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Risk Management Alert */}
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Risk Management Status</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Daily Loss Limit: ${(stats.currentBalance * 0.05).toFixed(2)} (5% of balance)</p>
                <p>Current Daily P&L: ${stats.dailyPnL.toFixed(2)}</p>
                <p className="mt-1">
                  Risk Status: <span className="font-semibold">
                    {Math.abs(stats.dailyPnL) / (stats.currentBalance * 0.05) < 0.5 ? 'Low' : 
                     Math.abs(stats.dailyPnL) / (stats.currentBalance * 0.05) < 0.8 ? 'Medium' : 'High'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingBotDashboard;