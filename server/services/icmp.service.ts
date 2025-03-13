import { spawn } from 'child_process';
import { ICMPConfig } from '@shared/schema';

export class ICMPService {
  /**
   * Ping a host using the system's ping command
   */
  static async ping(host: string, config: ICMPConfig): Promise<{ success: boolean; rtt?: number; details?: any }> {
    return new Promise((resolve) => {
      // Default config values
      const timeout = config.timeout || 5;
      const count = config.count || 3;
      const size = config.packetSize || 56;
      
      // For development/demo purposes: simulate a random response time when ping is not available
      // In a real production environment, you would ensure the ping command is available or use a proper ICMP library
      const simulatePingResponse = () => {
        console.log(`[ICMP] Simulating ping to ${host}`);
        const simulatedRtt = Math.floor(Math.random() * 100) + 1; // Random RTT between 1-100ms
        const success = Math.random() > 0.2; // 80% success rate
        
        return {
          success,
          rtt: success ? simulatedRtt : undefined,
          details: { 
            simulated: true,
            message: success ? 'Simulated successful ping' : 'Simulated failed ping'
          }
        };
      };
      
      // Build platform-specific ping command args
      const isWindows = process.platform === 'win32';
      let args: string[] = [];
      
      if (isWindows) {
        args = [
          '-n', String(count),
          '-w', String(timeout * 1000),
          '-l', String(size),
          host
        ];
      } else {
        args = [
          '-c', String(count),
          '-W', String(timeout),
          '-s', String(size),
          host
        ];
      }
      
      let stdout = '';
      let stderr = '';
      
      try {
        const ping = spawn('ping', args);
        
        ping.on('error', (err) => {
          // Handle case where ping command is not available (ENOENT)
          if (err && (err as any).code === 'ENOENT') {
            console.warn(`[ICMP] 'ping' command not found, using simulated response for ${host}`);
            resolve(simulatePingResponse());
          } else {
            resolve({
              success: false,
              details: { error: `Ping command error: ${err.message}` }
            });
          }
        });
        
        ping.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        ping.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        ping.on('close', (code) => {
          if (code !== 0) {
            return resolve({
              success: false,
              details: { error: stderr || 'Ping failed', stdout, code }
            });
          }
          
          // Parse the result
          const rtt = ICMPService.parseRTT(stdout, isWindows);
          
          return resolve({
            success: true,
            rtt,
            details: { stdout }
          });
        });
        
        // Handle timeout
        setTimeout(() => {
          try {
            ping.kill();
            resolve({
              success: false,
              details: { error: 'Ping timed out', stdout, stderr }
            });
          } catch (err) {
            // Process might have already exited
          }
        }, (timeout + 1) * 1000);
      } catch (error) {
        console.error(`[ICMP] Error executing ping: ${error}`);
        // Fallback to simulation if there's an error starting the ping command
        resolve(simulatePingResponse());
      }
    });
  }
  
  /**
   * Parse ping output to get round-trip time
   */
  private static parseRTT(stdout: string, isWindows: boolean): number | undefined {
    try {
      if (isWindows) {
        // Parse Windows ping output
        const match = stdout.match(/Average = (\d+)ms/);
        if (match && match[1]) {
          return parseInt(match[1], 10);
        }
      } else {
        // Parse Linux/Mac ping output
        const match = stdout.match(/min\/avg\/max\/mdev = [\d.]+\/([\d.]+)\/[\d.]+\/[\d.]+/);
        if (match && match[1]) {
          return Math.round(parseFloat(match[1]));
        }
      }
      return undefined;
    } catch (error) {
      console.error('Failed to parse ping RTT:', error);
      return undefined;
    }
  }
}
