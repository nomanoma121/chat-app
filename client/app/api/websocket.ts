import { WebSocketEvent, WS_BASE_URL } from "../constants";

export class WebSocketClient {
	private ws = new WebSocket(WS_BASE_URL);
	private listeners: Map<string, (data: unknown) => void> = new Map();
	private isAuthenticated = false;
	private pendingMessages: Array<{ type: string; data: unknown }> = [];

	constructor() {
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
	}

	public SetListener<T>(type: string, listener: (data: T) => void) {
		this.listeners.set(type, listener);
	}

	public RemoveListener(type: string) {
		this.listeners.delete(type);
	}

	public Authenticate(token: string) {
		this.ws.send(
			JSON.stringify({ type: WebSocketEvent.AuthRequest, data: { token } }),
		);
	}

	public Send(type: string, data: unknown) {
		if (this.isAuthenticated) {
			this.ws.send(JSON.stringify({ type, data }));
		} else {
			this.pendingMessages.push({ type, data });
		}
	}

	private flushPendingMessages() {
		while (this.pendingMessages.length > 0) {
			const msg = this.pendingMessages.shift();
			if (msg) {
				this.ws.send(JSON.stringify({ type: msg.type, data: msg.data }));
			}
		}
	}
}
