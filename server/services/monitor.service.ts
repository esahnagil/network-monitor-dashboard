import { ICMPService } from './icmp.service';
import { SNMPService } from './snmp.service';
import { HTTPService } from './http.service';
import { TCPService } from './tcp.service';
import { IStorage } from '../storage';
import { 
  Device, 
  Monitor, 
  ICMPConfig, 
  SNMPConfig, 
  HTTPConfig, 
  TCPConfig 
} from '@shared/schema';

type EventListener = (event: string, data: any) => void;

export class MonitorService {
  private storage: IStorage;
  private running: boolean = false;
  private eventListeners: EventListener[] = [];
  private checkIntervals: Map<number, NodeJS.Timeout> = new Map();

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Start the monitoring service
   */
  async startMonitoring() {
    if (this.running) {
      return;
    }
    
    this.running = true;
    console.log('Starting monitoring service');
    
    // Get all monitors
    const monitors = await this.storage.getMonitors();
    
    // Set up monitoring for each enabled monitor
    for (const monitor of monitors) {
      if (monitor.enabled) {
        this.scheduleMonitor(monitor);
      }
    }
  }
  
  /**
   * Stop the monitoring service
   */
  stopMonitoring() {
    this.running = false;
    
    // Clear all intervals
    for (const intervalId of this.checkIntervals.values()) {
      clearInterval(intervalId);
    }
    
    this.checkIntervals.clear();
    console.log('Monitoring service stopped');
  }
  
  /**
   * Schedule a monitor check at regular intervals
   */
  private scheduleMonitor(monitor: Monitor) {
    // Clear any existing interval for this monitor
    if (this.checkIntervals.has(monitor.id)) {
      clearInterval(this.checkIntervals.get(monitor.id)!);
    }
    
    // Schedule the first check immediately
    this.checkMonitor(monitor);
    
    // Schedule regular checks
    const interval = monitor.interval * 1000; // Convert to milliseconds
    const intervalId = setInterval(() => {
      this.checkMonitor(monitor);
    }, interval);
    
    this.checkIntervals.set(monitor.id, intervalId);
  }
  
  /**
   * Check a monitor and update its status
   */
  private async checkMonitor(monitor: Monitor) {
    try {
      const device = await this.storage.getDevice(monitor.deviceId);
      
      if (!device) {
        console.error(`Device not found for monitor ${monitor.id}`);
        return;
      }
      
      let status: string;
      let responseTime: number | undefined;
      let details: any = {};
      
      // Check based on monitor type
      switch (monitor.type) {
        case 'icmp':
          const icmpResult = await this.checkICMP(device, monitor.config as ICMPConfig);
          status = icmpResult.status;
          responseTime = icmpResult.responseTime;
          details = icmpResult.details;
          break;
        
        case 'snmp':
          const snmpResult = await this.checkSNMP(device, monitor.config as SNMPConfig);
          status = snmpResult.status;
          details = snmpResult.details;
          break;
        
        case 'http':
          const httpResult = await this.checkHTTP(monitor.config as HTTPConfig);
          status = httpResult.status;
          responseTime = httpResult.responseTime;
          details = httpResult.details;
          break;
        
        case 'tcp':
          const tcpResult = await this.checkTCP(device, monitor.config as TCPConfig);
          status = tcpResult.status;
          responseTime = tcpResult.responseTime;
          details = tcpResult.details;
          break;
        
        default:
          status = 'unknown';
          details = { error: `Unknown monitor type: ${monitor.type}` };
      }
      
      // Store the monitor result
      const result = await this.storage.createMonitorResult(
        monitor.id, 
        status, 
        responseTime, 
        details
      );
      
      // Get the previous result to check for status changes
      const previousResults = await this.storage.getMonitorResults(monitor.id, 2);
      const previousResult = previousResults.length > 1 ? previousResults[0] : null;
      
      // If status changed to 'down' or 'warning', create an alert
      if (status !== 'online' && (!previousResult || previousResult.status === 'online')) {
        const severity = status === 'down' ? 'danger' : 'warning';
        const message = this.generateAlertMessage(device, monitor, status);
        
        const alert = await this.storage.createAlert({
          deviceId: device.id,
          monitorId: monitor.id,
          message,
          severity,
          status: 'active'
        });
        
        // Notify listeners about the new alert
        this.notifyListeners('alert', alert);
      }
      
      // Notify listeners about the updated monitor result
      this.notifyListeners('monitorResult', {
        monitorId: monitor.id,
        deviceId: device.id,
        result
      });
      
    } catch (error) {
      console.error(`Error checking monitor ${monitor.id}:`, error);
    }
  }
  
  /**
   * Check an ICMP monitor
   */
  private async checkICMP(device: Device, config: ICMPConfig): Promise<{
    status: string;
    responseTime?: number;
    details?: any;
  }> {
    try {
      const result = await ICMPService.ping(device.ipAddress, config);
      
      if (!result.success) {
        return {
          status: 'down',
          details: result.details
        };
      }
      
      // Check if response time indicates a warning
      const rtt = result.rtt || 0;
      if (rtt > 100) { // Threshold for warning
        return {
          status: 'warning',
          responseTime: rtt,
          details: { warning: 'High latency', ...result.details }
        };
      }
      
      return {
        status: 'online',
        responseTime: rtt,
        details: result.details
      };
    } catch (error) {
      return {
        status: 'down',
        details: { error: `ICMP check failed: ${error instanceof Error ? error.message : String(error)}` }
      };
    }
  }
  
  /**
   * Check an SNMP monitor
   */
  private async checkSNMP(device: Device, config: SNMPConfig): Promise<{
    status: string;
    details?: any;
  }> {
    try {
      const result = await SNMPService.get(device.ipAddress, config);
      
      if (!result.success) {
        return {
          status: 'down',
          details: { error: result.error }
        };
      }
      
      // Parse metrics from SNMP data
      const metrics = SNMPService.parseMetrics(result.data || {});
      
      // Check for warning conditions
      if (metrics.cpuUsage && metrics.cpuUsage > 80) {
        return {
          status: 'warning',
          details: { warning: 'High CPU usage', metrics, data: result.data }
        };
      }
      
      if (metrics.memoryUsage && metrics.memoryUsage > 80) {
        return {
          status: 'warning',
          details: { warning: 'High memory usage', metrics, data: result.data }
        };
      }
      
      if (metrics.diskUsage && metrics.diskUsage > 90) {
        return {
          status: 'warning',
          details: { warning: 'High disk usage', metrics, data: result.data }
        };
      }
      
      return {
        status: 'online',
        details: { metrics, data: result.data }
      };
    } catch (error) {
      return {
        status: 'down',
        details: { error: `SNMP check failed: ${error instanceof Error ? error.message : String(error)}` }
      };
    }
  }
  
  /**
   * Check an HTTP monitor
   */
  private async checkHTTP(config: HTTPConfig): Promise<{
    status: string;
    responseTime?: number;
    details?: any;
  }> {
    try {
      const result = await HTTPService.checkEndpoint(config);
      
      if (!result.success) {
        return {
          status: 'down',
          responseTime: result.responseTime,
          details: { 
            error: result.error || `HTTP status ${result.statusCode} does not match expected ${config.expectedStatus || 200}`,
            statusCode: result.statusCode
          }
        };
      }
      
      // Check if response time indicates a warning
      const responseTime = result.responseTime || 0;
      if (responseTime > 1000) { // Threshold for warning (1 second)
        return {
          status: 'warning',
          responseTime,
          details: { 
            warning: 'High response time', 
            statusCode: result.statusCode,
            contentLength: result.contentLength
          }
        };
      }
      
      return {
        status: 'online',
        responseTime,
        details: { 
          statusCode: result.statusCode,
          contentLength: result.contentLength
        }
      };
    } catch (error) {
      return {
        status: 'down',
        details: { error: `HTTP check failed: ${error instanceof Error ? error.message : String(error)}` }
      };
    }
  }
  
  /**
   * Check a TCP monitor
   */
  private async checkTCP(device: Device, config: TCPConfig): Promise<{
    status: string;
    responseTime?: number;
    details?: any;
  }> {
    try {
      const result = await TCPService.checkPort(device.ipAddress, config);
      
      if (!result.success) {
        return {
          status: 'down',
          details: { error: result.error }
        };
      }
      
      // Check if response time indicates a warning
      const responseTime = result.responseTime || 0;
      if (responseTime > 500) { // Threshold for warning (500 ms)
        return {
          status: 'warning',
          responseTime,
          details: { warning: 'High response time' }
        };
      }
      
      return {
        status: 'online',
        responseTime,
        details: { port: config.port }
      };
    } catch (error) {
      return {
        status: 'down',
        details: { error: `TCP check failed: ${error instanceof Error ? error.message : String(error)}` }
      };
    }
  }
  
  /**
   * Generate an alert message based on monitor type and status
   */
  private generateAlertMessage(device: Device, monitor: Monitor, status: string): string {
    const statusText = status === 'down' ? 'Offline' : 'Warning';
    
    switch (monitor.type) {
      case 'icmp':
        return `${device.name} ${statusText} - ICMP failed`;
      
      case 'snmp':
        return `${device.name} ${statusText} - SNMP check failed`;
      
      case 'http':
        const config = monitor.config as HTTPConfig;
        return `HTTP Endpoint ${statusText} - ${config.url}`;
      
      case 'tcp':
        const tcpConfig = monitor.config as TCPConfig;
        return `${device.name} Port ${tcpConfig.port} ${statusText}`;
      
      default:
        return `${device.name} ${statusText} - ${monitor.type} check failed`;
    }
  }
  
  /**
   * Register an event listener for monitor events
   */
  registerEventListener(listener: EventListener) {
    this.eventListeners.push(listener);
  }
  
  /**
   * Remove all event listeners
   */
  removeEventListeners() {
    this.eventListeners = [];
  }
  
  /**
   * Notify all registered listeners of an event
   */
  private notifyListeners(event: string, data: any) {
    for (const listener of this.eventListeners) {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    }
  }
}
