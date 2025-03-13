import { Device, Monitor, MonitorResult, Alert } from "@/types";
import { queryClient } from "./queryClient";

type MonitoringEventCallback = (eventType: string, data: any) => void;

class MonitoringClient {
  private socket: WebSocket | null = null;
  private eventCallbacks: MonitoringEventCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private isConnecting = false;

  /**
   * Initialize the WebSocket connection
   */
  connect() {
    if (this.socket || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    // Determine the WebSocket URL based on the current environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use a specific path for our monitoring WebSocket to avoid conflicts with Vite's WebSocket
    const host = window.location.host;
    let wsUrl = `${protocol}//${host}/ws/monitoring`;
    
    // Development ortamında farklı port kullanılıyorsa WebSocket bağlantısını ayarla
    if (import.meta.env.DEV && host.includes(':')) {
      const serverPort = 5000; // Express sunucusunun çalıştığı port
      const hostWithoutPort = host.split(':')[0];
      wsUrl = `${protocol}//${hostWithoutPort}:${serverPort}/ws/monitoring`;
    }

    try {
      console.log("WebSocket bağlantısı kuruluyor:", wsUrl);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  /**
   * Register an event callback
   */
  on(callback: MonitoringEventCallback) {
    this.eventCallbacks.push(callback);
    return () => {
      this.eventCallbacks = this.eventCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen() {
    console.log("WebSocket connection established");
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.notifyCallbacks('connected', { status: 'connected' });
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      const { type, data: eventData } = data;

      this.notifyCallbacks(type, eventData);

      // Update React Query cache based on event type
      this.updateQueryCache(type, eventData);
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent) {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    this.socket = null;
    this.isConnecting = false;
    this.notifyCallbacks('disconnected', { 
      code: event.code, 
      reason: event.reason 
    });

    // Attempt to reconnect if the connection wasn't closed intentionally
    if (event.code !== 1000) {
      this.attemptReconnect();
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event) {
    console.error("WebSocket hatası:", event);
    this.socket = null;
    this.isConnecting = false;
    this.notifyCallbacks('error', { event });
    
    // Hata durumunda yeniden bağlanmayı dene
    this.attemptReconnect();
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Maximum reconnection attempts reached");
      this.notifyCallbacks('reconnect_failed', { 
        attempts: this.reconnectAttempts 
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.notifyCallbacks('reconnecting', { 
      attempt: this.reconnectAttempts,
      delay
    });

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Notify all registered callbacks of an event
   */
  private notifyCallbacks(eventType: string, data: any) {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error("Error in monitoring event callback:", error);
      }
    });
  }

  /**
   * Update the React Query cache based on WebSocket events
   */
  private updateQueryCache(type: string, data: any) {
    switch (type) {
      case 'devices':
        queryClient.setQueryData(['/api/devices'], data);
        break;
      
      case 'alerts':
        queryClient.setQueryData(['/api/alerts'], data);
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
        break;
      
      case 'monitorResult':
        // Update the latest monitor result
        queryClient.setQueryData(
          ['/api/monitor-results', data.monitorId, 'latest'],
          data.result
        );

        // If we have monitors data in the cache, update the monitor's latest result
        const monitors = queryClient.getQueryData<Monitor[]>(['/api/monitors']);
        if (monitors) {
          const updatedMonitors = monitors.map(monitor => {
            if (monitor.id === data.monitorId) {
              return {
                ...monitor,
                latestResult: data.result
              };
            }
            return monitor;
          });
          queryClient.setQueryData(['/api/monitors'], updatedMonitors);
        }

        // Invalidate the dashboard summary to reflect new status
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
        break;
      
      case 'alert':
        // When a new alert is created, invalidate alerts queries
        queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
        break;
    }
  }
}

// Create a singleton instance
export const monitoringClient = new MonitoringClient();
