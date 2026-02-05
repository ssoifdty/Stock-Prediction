# Indian Stock Market Trend Analysis

A Node.js web application that analyzes Indian stock market trends using AI. The app fetches stock data from free APIs, analyzes trends using OpenAI, and displays candlestick charts.

## Features

- 📊 Fetches last 90 days of stock price data from Yahoo Finance API
- 🤖 AI-powered trend analysis (bullish, bearish, sideways) using OpenAI
- 📈 Interactive candlestick charts using Chart.js
- 🎨 Modern, responsive UI
- 🔒 Secure API key management via environment variables

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Add your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=your_actual_openai_api_key_here
```

## Usage

1. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Enter an Indian stock symbol (NSE format):
   - Examples: `RELIANCE`, `TCS`, `INFY`, `HDFCBANK`
   - Or with suffix: `RELIANCE.NS` (NSE) or `RELIANCE.BO` (BSE)

4. Click "Analyze Stock" to get:
   - AI-powered trend analysis
   - Daily candlestick chart for the last 90 days

## API Endpoint

### POST `/api/analyze`

Analyzes a stock symbol and returns trend analysis with chart data.

**Request Body:**
```json
{
  "symbol": "RELIANCE"
}
```

**Response:**
```json
{
  "symbol": "RELIANCE",
  "data": [
    {
      "date": "2024-01-01",
      "open": 2500.00,
      "high": 2550.00,
      "low": 2480.00,
      "close": 2530.00,
      "volume": 1000000
    }
  ],
  "analysis": {
    "trend": "bullish",
    "explanation": "The stock shows a strong upward trend...",
    "observations": "Key observations about price movements..."
  },
  "success": true
}
```

## Stock Symbol Format

The app supports Indian stock symbols in the following formats:
- **NSE**: `RELIANCE`, `TCS`, `INFY` (automatically adds `.NS` suffix)
- **BSE**: `RELIANCE.BO`
- **With suffix**: `RELIANCE.NS`, `TCS.NS`

## Technologies Used

- **Backend**: Node.js, Express.js
- **AI Analysis**: OpenAI GPT-3.5-turbo
- **Stock Data**: Yahoo Finance API (free, no API key required)
- **Charts**: Chart.js with Chart.js Financial plugin
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## Project Structure

```
.
├── server.js          # Express server and API endpoints
├── package.json       # Dependencies and scripts
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
├── README.md          # This file
└── public/
    └── index.html     # Frontend application
```

## Notes

- The app uses Yahoo Finance API which is free and doesn't require an API key
- OpenAI API key is required for trend analysis
- Stock data is fetched for the last 90 days
- The trend analysis uses GPT-3.5-turbo model for cost efficiency

## Troubleshooting

1. **"OPENAI_API_KEY not configured"**: Make sure you've created a `.env` file with your OpenAI API key

2. **"No stock data found"**: 
   - Verify the stock symbol is correct
   - Try adding `.NS` suffix for NSE stocks (e.g., `RELIANCE.NS`)
   - Check your internet connection

3. **Chart not displaying**: Ensure you have a stable internet connection to load Chart.js from CDN

## License

ISC
