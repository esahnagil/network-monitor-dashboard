import net from 'net';
import { TCPConfig } from '@shared/schema';

export class TCPService {
  /**
   * Check if a TCP port is open and measure response time
   */
  static async checkPort(host: string, config: TCPConfig): Promise<{ 
    success: boolean; 
    responseTime?: number; 
    error?: string;
  }> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const port = config.port;
      const timeout = (config.timeout || 5) * 1000;
      
      // Create socket
      const socket = new net.Socket();
      
      // Set socket timeout
      socket.setTimeout(timeout);
      
      // Connection established
      socket.on('connect', () => {
        const responseTime = Date.now() - startTime;
        socket.destroy();
        resolve({ success: true, responseTime });
      });
      
      // Connection error
      socket.on('error', (err) => {
        socket.destroy();
        resolve({ 
          success: false, 
          error: `Connection failed: ${err.message}`
        });
      });
      
      // Connection timeout
      socket.on('timeout', () => {
        socket.destroy();
        resolve({ 
          success: false, 
          error: `Connection timed out after ${timeout}ms`
        });
      });
      
      // Attempt to connect
      socket.connect(port, host);
    });
  }
}
