async function analyze() {
    const symbol = document.getElementById("symbol").value;
  
    const res = await fetch(`/analyze-stock?symbol=${symbol}`);
    const data = await res.json();
  
    document.getElementById("result").innerText =
      "Trend: " + data.trend + " | " + data.explanation;
  }
  