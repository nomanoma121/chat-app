export class WebSocketClient {
	private ws = new WebSocket("ws://localhost:50054/ws");
	private listeners: Map<string, (data: any) => void> = new Map();

	constructor() {
		this.ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			const listener = this.listeners.get(message.type);
			if (listener) {
				listener(message.data);
			}
		};
	}

	public SetListener<T>(type: string, listener: (data: T) => void) {
		this.listeners.set(type, listener);
	}

	public RemoveListener(type: string) {
		this.listeners.delete(type);
	}

	public Send(type: string, data: any) {
		this.ws.send(JSON.stringify({ type, data: data }));
	}
}
