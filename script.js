const chartContainer = document.getElementById('chart-container');
let currentSymbol = 'ethusdt';
let currentInterval = '1m';
let socket;
let chart;
let series;

const savedData = {
    ethusdt: [],
    bnbusdt: [],
    dotusdt: []
};

const chartOptions = {
    layout: {
        background: { type: 'solid', color: '#1e1e1e' },  // Dark background
        textColor: 'white',  // White text for axes labels
    },
    grid: {
        vertLines: {
            color: 'white',  // Dark gray vertical grid lines
        },
        horzLines: {
            color: '#444444',  // Dark gray horizontal grid lines
        },
    },
    timeScale: {
        borderColor: '#888888',  // Light gray border for the time scale
    },
    priceScale: {
        borderColor: '#888888',  // Light gray border for the price scale
    },
};

// Initialize TradingView Lightweight Chart
function createChart() {
    chart = LightweightCharts.createChart(chartContainer, { ...chartOptions});
    series = chart.addCandlestickSeries();
}

// Update the chart with new candlestick data
function updateChart(candlestick) {
    const candle = {
        time: candlestick.t / 1000,  // Convert timestamp from milliseconds to seconds
        open: parseFloat(candlestick.o),
        high: parseFloat(candlestick.h),
        low: parseFloat(candlestick.l),
        close: parseFloat(candlestick.c)
    };
    series.update(candle);
}

// Save candlestick data to in-memory structure or localStorage
function saveCandleData(symbol, candlestick) {
    savedData[symbol].push(candlestick);
    // localStorage.setItem(symbol, JSON.stringify(savedData[symbol]));
}

// Restore previously saved chart data from localStorage

// function restoreChartData(symbol) {
//     if (localStorage.getItem(symbol)) {
//         savedData[symbol] = JSON.parse(localStorage.getItem(symbol));
//         savedData[symbol].forEach(candle => updateChart(candle));
//     }
// }

// Connect to Binance WebSocket
function connectToBinanceWebSocket(symbol, interval) {
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`;
    socket = new WebSocket(wsUrl);

    socket.onmessage = function (event) {
        const message = JSON.parse(event.data);
        if (message.k) {
            const candlestick = message.k;
            if (candlestick.x) {
                saveCandleData(symbol, candlestick);
            }
            updateChart(candlestick);
        }
    };
}

// Handle cryptocurrency toggle button click
document.getElementById('crypto-toggle').addEventListener('click', function (e) {
    if (e.target.classList.contains('toggle-btn')) {
        // Remove 'active' class from all buttons and add to the clicked button
        document.querySelectorAll('#crypto-toggle .toggle-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Change the current cryptocurrency symbol
        currentSymbol = e.target.getAttribute('data-value');
        socket.close();
        // restoreChartData(currentSymbol);
        connectToBinanceWebSocket(currentSymbol, currentInterval);
    }
});

// Handle interval toggle button click
document.getElementById('interval-toggle').addEventListener('click', function (e) {
    if (e.target.classList.contains('toggle-btn')) {
        // Remove 'active' class from all buttons and add to the clicked button
        document.querySelectorAll('#interval-toggle .toggle-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Change the current interval
        currentInterval = e.target.getAttribute('data-value');
        socket.close();
        connectToBinanceWebSocket(currentSymbol, currentInterval);
    }
});

// Initialize the chart and WebSocket connection
createChart();
connectToBinanceWebSocket(currentSymbol, currentInterval);
// restoreChartData(currentSymbol);
