import { useEffect, useState } from 'react';
import { monitoringClient } from '@/lib/monitoring';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'reconnecting';

interface UseMonitoringOptions {
  autoConnect?: boolean;
}

export function useMonitoring(options: UseMonitoringOptions = {}) {
  const { autoConnect = true } = options;
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    // Sayfaya ilk giriş veya sayfa yenilenmesi durumunda bağlantı kur
    let connectionTimer: number | null = null;
    
    if (autoConnect) {
      // Çok hızlı yeniden bağlanmayı önlemek için kısa bir gecikme ekleyelim
      connectionTimer = window.setTimeout(() => {
        connect();
      }, 500);
    }

    // Set up event listeners
    const unsubscribe = monitoringClient.on((eventType, data) => {
      setLastEvent({ type: eventType, data, timestamp: new Date() });

      // Update connection status based on events
      switch (eventType) {
        case 'connected':
          setStatus('connected');
          break;
        case 'disconnected':
          setStatus('disconnected');
          break;
        case 'reconnecting':
          setStatus('reconnecting');
          break;
        case 'reconnect_failed':
          // Otomatik yeniden bağlanma başarısız olduğunda
          setStatus('disconnected');
          break;
        case 'error':
          // WebSocket bağlantı hatası oluştuğunda
          console.warn('WebSocket bağlantı hatası:', data);
          break;
      }
    });

    // Clean up on unmount
    return () => {
      unsubscribe();
      
      // Clear timeout and disconnect
      if (connectionTimer) {
        window.clearTimeout(connectionTimer);
      }
      
      // Only disconnect if we initiated the connection
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect]);

  // Connection methods
  const connect = () => {
    setStatus('connecting');
    monitoringClient.connect();
  };

  const disconnect = () => {
    monitoringClient.disconnect();
    setStatus('disconnected');
  };

  return {
    status,
    lastEvent,
    connect,
    disconnect,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting' || status === 'reconnecting',
  };
}
