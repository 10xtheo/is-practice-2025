interface WebSocketMessage {
	message: string;
	event_id: string;
}

class WebSocketService {
	private ws: WebSocket | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectTimeout = 3000;

	constructor(private url: string) {}

	connect() {
		try {
			this.ws = new WebSocket(this.url);

			this.ws.onopen = () => {
				console.log('WebSocket connection established');
				this.reconnectAttempts = 0;
			};

			this.ws.onmessage = (event) => {
				try {
					const data: WebSocketMessage = JSON.parse(event.data);
					alert(`New notification: ${data.message}`);
				} catch (error) {
					console.error('Error parsing WebSocket message:', error);
				}
			};

			this.ws.onclose = () => {
				console.log('WebSocket connection closed');
				this.attemptReconnect();
			};

			this.ws.onerror = (error) => {
				console.error('WebSocket error:', error);
			};
		} catch (error) {
			console.error('Error creating WebSocket connection:', error);
			this.attemptReconnect();
		}
	}

	private attemptReconnect() {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
			setTimeout(() => this.connect(), this.reconnectTimeout);
		} else {
			console.error('Max reconnection attempts reached');
		}
	}

	disconnect() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}
}

export const createWebSocketService = (url: string) => new WebSocketService(url);
