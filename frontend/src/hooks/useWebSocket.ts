import { useEffect, useRef } from 'react';
import { createWebSocketService } from '../utils/websocket';

export const useWebSocket = (url: string) => {
	const wsServiceRef = useRef<ReturnType<typeof createWebSocketService> | null>(null);

	useEffect(() => {
		wsServiceRef.current = createWebSocketService(url);
		wsServiceRef.current.connect();

		return () => {
			wsServiceRef.current?.disconnect();
		};
	}, [url]);
};
