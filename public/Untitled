const axios = require("axios");

async function getStockData(symbol) {
  // replace with your real stock API
  const res = await axios.get(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`);
  return res.data.quoteResponse.result[0];
}

module.exports = { getStockData };
