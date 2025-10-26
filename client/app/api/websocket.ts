import { WebSocketEvent, WS_BASE_URL } from "../constants";

let instance: WebSocketClient | null = null;

export class WebSocketClient {
	private ws!: WebSocket;
	private listeners: Map<string, (data: unknown) => void> = new Map();
	private isAuthenticated = false;
	private pendingMessages: Array<{ type: string; data: unknown }> = [];

	private token: string | null = null;
	private isClosedIntentionally = false;
	private reconnectDelay = 1000;
	private maxReconnectDelay = 30000;
	private baseReconnectDelay = 1000;

	private constructor() {
		this.connect();
	}

	public static getInstance(): WebSocketClient {
		if (!instance) {
			instance = new WebSocketClient();
		}
		return instance;
	}

	private connect() {
		this.ws = new WebSocket(WS_BASE_URL);
		this.isClosedIntentionally = false;

		this.ws.onopen = () => {
			this.reconnectDelay = this.baseReconnectDelay;

			const token = this.getTokenByLocalStorage();
			if (token) {
				this.Authenticate(token);
			}
		};

		this.ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			const listener = this.listeners.get(message.type);
			if (listener) {
				listener(message.data);
			}

			if (message.type === WebSocketEvent.AuthSuccess) {
				this.isAuthenticated = true;
				this.flushPendingMessages();
			}
		};

		this.ws.onclose = () => {
			this.isAuthenticated = false;

			if (!this.isClosedIntentionally) {
				setTimeout(() => {
					this.connect();
				}, this.reconnectDelay);

				this.reconnectDelay = Math.min(
					this.reconnectDelay * 2,
					this.maxReconnectDelay,
				);
			}
		};
	}

	private getTokenByLocalStorage(): string | null {
		return localStorage.getItem("authToken");
	}

	private sendAuthRequest() {
		if (!this.token) return;
		this.ws.send(
			JSON.stringify({
				type: WebSocketEvent.AuthRequest,
				data: { token: this.token },
			}),
		);
	}

	public SetListener<T>(type: string, listener: (data: T) => void) {
		this.listeners.set(type, listener as (data: unknown) => void);
	}

	public RemoveListener(type: string) {
		this.listeners.delete(type);
	}

	public Authenticate(token: string) {
		this.token = token;

		if (this.ws.readyState === WebSocket.OPEN) {
			this.sendAuthRequest();
		}
	}

	public Send(type: string, data: unknown) {
		if (this.isAuthenticated && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify({ type, data }));
		} else {
			this.pendingMessages.push({ type, data });
		}
	}

	private flushPendingMessages() {
		while (this.pendingMessages.length > 0) {
			const msg = this.pendingMessages.shift();
			if (msg) {
				this.Send(msg.type, msg.data);
			}
		}
	}
}
