import { useEffect, useRef, useState } from 'react';
import { Metric } from '@shared/schema';

interface WebSocketMessage {
  type: string;
  deviceId: number;
  data: Metric;
}

export function useWebSocket() {
  const [lastMetric, setLastMetric] = useState<Metric | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.addEventListener('message', (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        if (message.type === 'metric') {
          setLastMetric(message.data);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    socket.addEventListener('close', () => {
      console.log('WebSocket connection closed');
    });

    return () => {
      socket.close();
    };
  }, []);

  return { lastMetric };
}
