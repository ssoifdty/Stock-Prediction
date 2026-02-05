const express = require('express');
const axios = require('axios');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Free Indian Stock API - Using Alpha Vantage (supports Indian stocks with .BSE or .NSE suffix)
// Alternative: Yahoo Finance API (free, no API key needed)
const getStockData = async (symbol) => {
  try {
    // Try Yahoo Finance API first (free, no API key)
    // Format: RELIANCE.NS for NSE, RELIANCE.BO for BSE
    const yahooSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
    
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=90d`;
    
    const response = await axios.get(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (response.data && response.data.chart && response.data.chart.result) {
      const result = response.data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];
      
      const data = timestamps.map((timestamp, index) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: quotes.open[index],
        high: quotes.high[index],
        low: quotes.low[index],
        close: quotes.close[index],
        volume: quotes.volume[index]
      })).filter(item => item.open && item.high && item.low && item.close);

      return data;
    }
    
    throw new Error('No data received from Yahoo Finance');
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    throw new Error(`Failed to fetch stock data: ${error.message}`);
  }
};

// Analyze trend using OpenAI
const analyzeTrend = async (stockData) => {
  try {
    const dataSummary = stockData.slice(-30).map(d => ({
      date: d.date,
      close: d.close,
      volume: d.volume
    }));

    const prompt = `Analyze the following Indian stock market data for the last 30 days and provide:
1. Trend classification: "bullish", "bearish", or "sideways"
2. A brief explanation (2-3 sentences) of why this trend is identified
3. Key observations about price movements and volume

Stock Data (last 30 days):
${JSON.stringify(dataSummary, null, 2)}

Respond in JSON format:
{
  "trend": "bullish|bearish|sideways",
  "explanation": "your explanation here",
  "observations": "key observations here"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a financial analyst specializing in Indian stock market analysis. Provide clear, concise trend analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const responseText = completion.choices[0].message.content;
    
    // Try to parse JSON from response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText);
    } catch (e) {
      // Fallback: create analysis from text
      const trendMatch = responseText.match(/(bullish|bearish|sideways)/i);
      analysis = {
        trend: trendMatch ? trendMatch[1].toLowerCase() : "sideways",
        explanation: responseText,
        observations: responseText
      };
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing trend:', error.message);
    throw new Error(`Failed to analyze trend: ${error.message}`);
  }
};

// API endpoint to get stock analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    }

    // Fetch stock data
    const stockData = await getStockData(symbol);

    if (!stockData || stockData.length === 0) {
      return res.status(404).json({ error: 'No stock data found for the given symbol' });
    }

    // Analyze trend
    const analysis = await analyzeTrend(stockData);

    // Return data and analysis
    res.json({
      symbol: symbol,
      data: stockData,
      analysis: analysis,
      success: true
    });

  } catch (error) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      success: false 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Make sure OPENAI_API_KEY is set in your .env file`);
});
