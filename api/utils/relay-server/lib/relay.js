import { WebSocketServer } from 'ws';
import { RealtimeClient } from '@openai/realtime-api-beta';

export class RealtimeRelay {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.sockets = new WeakMap();
    this.wss = null;
  }

  listen(port) {
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', this.connectionHandler.bind(this));
    this.log(`Listening on ws://localhost:${port}`);
  }

  async connectionHandler(ws, req) {
    if (!req.url) {
      this.log('No URL provided, closing connection.');
      ws.close();
      return;
    } 

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname !== '/') {
      this.log(`Invalid pathname: "${pathname}"`);
      ws.close();
      return;
    }

    // Instantiate new client
    this.log(`Connecting with key "${this.apiKey.slice(0, 3)}..."`);
    const client = new RealtimeClient({ url: "wss://api.soket.ai/dev/s2s", apiKey: this.apiKey });

    // Handle different types of events with proper filtering
    client.realtime.on('server.session.created', (event) => {
      this.log(`Relaying "session.created" to Client`);
      this.safeSend(ws, event);
    });

    client.realtime.on('server.session.updated', (event) => {
      this.log(`Relaying "session.updated" to Client`);
      this.safeSend(ws, event);
    });

    client.realtime.on('server.conversation.item.created', (event) => {
      this.log(`Relaying "conversation.item.created" to Client`);
      this.safeSend(ws, event);
    });

    client.realtime.on('server.conversation.item.updated', (event) => {
      this.log(`Relaying "conversation.item.updated" to Client`);
      this.safeSend(ws, event);
    });

    client.realtime.on('server.response.created', (event) => {
      this.log(`Relaying "response.created" to Client`);
      this.safeSend(ws, event);
    });

    client.realtime.on('server.response.output_text.delta', (event) => {
      this.log(`Relaying "response.output_text.delta" to Client`);
      this.safeSend(ws, event);
    });

    client.realtime.on('server.response.output_audio.delta', (event) => {
      this.log(`Relaying "response.output_audio.delta" to Client`);
      this.safeSend(ws, event);
    });

    client.realtime.on('server.response.completed', (event) => {
      this.log(`Relaying "response.completed" to Client`);
      this.safeSend(ws, event);
    });

    // Handle error events specifically
    client.realtime.on('server.error', (event) => {
      this.log(`OpenAI API Error: ${JSON.stringify(event)}`);
      // Don't forward errors to client unless they're critical
      if (event.error?.code === 'rate_limit_exceeded' || 
          event.error?.code === 'invalid_api_key' ||
          event.error?.code === 'quota_exceeded') {
        this.safeSend(ws, event);
      }
    });

    client.realtime.on('close', () => {
      this.log('OpenAI connection closed');
      ws.close();
    });
    
    client.realtime.on('error', (error) => {
      this.log(`OpenAI connection error: ${error.message}`);
      ws.close();
    });

    // Relay: Browser Event -> OpenAI Realtime API Event
    const messageQueue = [];
    const messageHandler = (data) => {
      try {
        const event = JSON.parse(data);
        this.log(`Relaying "${event.type}" to OpenAI`);
        client.realtime.send(event.type, event);
      } catch (e) {
        console.error(e.message);
        this.log(`Error parsing event from client: ${data}`);
      }
    };
    
    ws.on('message', (data) => {
      if (!client.isConnected()) {
        messageQueue.push(data);
      } else {
        messageHandler(data);
      }
    });
    
    ws.on('close', () => {
      this.log('Client disconnected');
      client.disconnect();
    });
    
    ws.on('error', (error) => {
      this.log(`WebSocket error: ${error.message}`);
      client.disconnect();
    });

    // Connect to OpenAI Realtime API
    try {
      this.log(`Connecting to OpenAI...`);
      await client.connect();
    } catch (e) {
      this.log(`Error connecting to OpenAI: ${e.message}`);
      ws.close();
      return;
    }
    this.log(`Connected to OpenAI successfully!`);
    while (messageQueue.length) {
      messageHandler(messageQueue.shift());
    }
  }

  safeSend(ws, event) {
    try {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(event));
      }
    } catch (e) {
      this.log(`Error sending event to client: ${e.message}`);
    }
  }

  log(...args) {
    console.log(`[RealtimeRelay]`, ...args);
  }
}
