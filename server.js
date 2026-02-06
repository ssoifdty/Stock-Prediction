const express = require('express');
const axios = require('axios');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

/* Root route (prevents Cannot GET /) */
app.get('/', (req, res) => {
  res.send('Stock AI Agent Running');
});

/* OpenAI */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* Fetch stock data tool */
async function getStockData(symbol) {
  const yahooSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=90d`;

  const response = await axios.get(url);

  const result = response.data.chart.result[0];
  const timestamps = result.timestamp;
  const quotes = result.indicators.quote[0];

  const data = timestamps.map((t, i) => ({
    date: new Date(t * 1000).toISOString().split('T')[0],
    close: quotes.close[i],
    volume: quotes.volume[i]
  }));

  return data.slice(-30);
}

/* Normal analysis endpoint */
app.post('/api/analyze', async (req, res) => {
  try {
    const { symbol } = req.body;
    const stockData = await getStockData(symbol);

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a stock analyst." },
        { role: "user", content: `Analyze trend: ${JSON.stringify(stockData)}` }
      ]
    });

    res.json({
      result: completion.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* AGENT endpoint (tool + reasoning) */
app.post('/api/agent', async (req, res) => {
  try {
    const { symbol } = req.body;

    const stock = await getStockData(symbol);

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI stock market agent that predicts trends."
        },
        {
          role: "user",
          content: `Predict trend using this data: ${JSON.stringify(stock)}`
        }
      ]
    });

    res.json({ result: response.choices[0].message.content });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* Health */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

/* Start server for Render */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

module.exports = app;
