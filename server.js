const express = require('express');
const axios = require('axios');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Homepage route (fixes "Cannot GET /")
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Fetch Indian stock data from Yahoo Finance
const getStockData = async (symbol) => {
  const yahooSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=90d`;

  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const result = response.data.chart.result[0];
  const timestamps = result.timestamp;
  const quotes = result.indicators.quote[0];

  return timestamps.map((t, i) => ({
    date: new Date(t * 1000).toISOString().split('T')[0],
    open: quotes.open[i],
    high: quotes.high[i],
    low: quotes.low[i],
    close: quotes.close[i],
    volume: quotes.volume[i]
  })).filter(d => d.close);
};

// AI Trend Analysis
const analyzeTrend = async (stockData) => {
  const summary = stockData.slice(-30);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a financial analyst specializing in Indian stock market trend analysis."
      },
      {
        role: "user",
        content: `Analyze the trend (bullish, bearish, sideways) for this stock data and explain briefly: ${JSON.stringify(summary)}`
      }
    ],
    temperature: 0.3
  });

  return completion.choices[0].message.content;
};

// API endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: "Stock symbol required" });
    }

    const data = await getStockData(symbol);
    const analysis = await analyzeTrend(data);

    res.json({
      symbol,
      analysis,
      data,
      success: true
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
