import ws from 'k6/ws';

export const WebSocketEvent = {
  SubscribeChannels: "SUBSCRIBE_CHANNELS",
  MessageCreate: "MESSAGE_CREATE",
  AuthRequest: "AUTH_REQUEST",
  AuthSuccess: "AUTH_SUCCESS",
  AuthError: "AUTH_ERROR",
} as const;

interface K6Socket {
  on(event: 'open', handler: () => void): void;
  on(event: 'message', handler: (data: string) => void): void;
  on(event: 'close', handler: (code?: number, reason?: string) => void): void;
  on(event: 'error', handler: (error: any) => void): void;
  on(event: 'ping' | 'pong', handler: () => void): void;
  send(data: string): void;
  close(code?: number): void;
  setTimeout(callback: () => void, delay: number): void;
  setInterval(callback: () => void, interval: number): void;
  ping(): void;
  pong(): void;
}

type WebSocketMessage = {
  type: typeof WebSocketEvent[keyof typeof WebSocketEvent];
  data: any;
};

export class WebSocketClient {
  private socket?: K6Socket;

  constructor(private baseUrl: string, private token?: string) {}

  public connect(onMessage?: (data: any) => void) {

    ws.connect(this.baseUrl, {}, (socket: K6Socket) => {
      this.socket = socket;

      socket.on('open', () => {
        if (this.token) {
          this.send({
            type: WebSocketEvent.AuthRequest,
            data: { token: this.token }
          });
        }
      });

      socket.on('message', (data) => {
        if (onMessage) {
          const message = JSON.parse(data);
          onMessage(message);
        }
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      socket.setTimeout(() => {
        this.close();
      }, 30000);
    });
  }

  public send(data: WebSocketMessage) {
    if (this.socket) {
      this.socket.send(JSON.stringify(data));
    }
  }

  public close() {
    if (this.socket) {
      this.socket.close();
    }
  }

  public setTimeout(callback: () => void, delay: number) {
    if (this.socket) {
      this.socket.setTimeout(callback, delay);
    }
  }
}
