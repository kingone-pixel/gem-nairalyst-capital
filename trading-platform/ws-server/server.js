// ws-server/server.js
const WebSocket = require('ws');
const signalR = require('@microsoft/signalr');

// 1. Create a WebSocket server for your React frontend clients
const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });
console.log(`\n✅ Fan-out server running on port ${PORT}`);

// 2. Track which symbols each client is subscribed to
const clientSubscriptions = new Map();

// 3. Create the Biquote Connection (THIS WAS MISSING)
const biquoteConnection = new signalR.HubConnectionBuilder()
  .withUrl('https://biquote.io/hubs/tick')
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

// 4. Listen for ticks from Biquote and broadcast them selectively
biquoteConnection.on('ReceiveTick', (tick) => {
  const symbol = tick.s; 
  const price = tick.mid || tick.bid || tick.ask; 

  if (!symbol || !price) return;

  // 👇 LOG EVERY TICK TO THE TERMINAL 👇
  console.log(`📈 Received Tick: ${symbol} @ ${price}`);

  // Send the update ONLY to clients that are subscribed to this symbol
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const subs = clientSubscriptions.get(client.id);
      if (subs && subs.has(symbol)) {
        client.send(JSON.stringify({ symbol, price }));
      }
    }
  });
});

// 5. Handle incoming connections from your React app
wss.on('connection', (ws) => {
  ws.id = Math.random().toString(36).substr(2, 9);
  clientSubscriptions.set(ws.id, new Set());
  
  console.log(`\n🔌 React Frontend Connected: ${ws.id}`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe' && Array.isArray(data.symbols)) {
        const currentSubs = clientSubscriptions.get(ws.id);
        data.symbols.forEach((sym) => currentSubs.add(sym));
        console.log(`📥 Client ${ws.id} subscribed to: ${data.symbols.join(', ')}`);
      }
    } catch (err) {
      console.error('Message Error:', err);
    }
  });

  ws.on('close', () => {
    clientSubscriptions.delete(ws.id);
    console.log(`❌ React Frontend Disconnected: ${ws.id}`);
  });
});

// 6. Start the Biquote connection
biquoteConnection.start()
  .then(async () => {
    console.log('✅ Connected to Biquote Data Feed.');
    
    const symbolsToWatch = [
      'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 
      'EURGBP', 'EURJPY', 'GBPJPY', 'XAUUSD', 'XAGUSD', 
      'BTCUSD', 'ETHUSD', 'US500'
    ];
    
    await biquoteConnection.invoke('Subscribe', symbolsToWatch);
    console.log(`✅ Subscribed to Biquote for: ${symbolsToWatch.join(', ')}`);
  })
  .catch((err) => {
    console.error('❌ Biquote Connection Error:', err);
  });