import { 
  users, 
  devices, 
  monitors, 
  monitorResults, 
  alerts,
  type User, 
  type InsertUser,
  type Device,
  type InsertDevice,
  type Monitor,
  type InsertMonitor,
  type MonitorResult,
  type Alert,
  type InsertAlert
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Device management
  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, device: Partial<InsertDevice>): Promise<Device | undefined>;
  deleteDevice(id: number): Promise<boolean>;
  
  // Monitor management
  getMonitors(): Promise<Monitor[]>;
  getMonitorsByDeviceId(deviceId: number): Promise<Monitor[]>;
  getMonitor(id: number): Promise<Monitor | undefined>;
  createMonitor(monitor: InsertMonitor): Promise<Monitor>;
  updateMonitor(id: number, monitor: Partial<InsertMonitor>): Promise<Monitor | undefined>;
  deleteMonitor(id: number): Promise<boolean>;
  
  // Monitor results
  getLatestMonitorResult(monitorId: number): Promise<MonitorResult | undefined>;
  getMonitorResults(monitorId: number, limit: number): Promise<MonitorResult[]>;
  createMonitorResult(monitorId: number, status: string, responseTime?: number, details?: any): Promise<MonitorResult>;
  
  // Alerts management
  getAlerts(status?: string): Promise<Alert[]>;
  getAlertsByDeviceId(deviceId: number): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlertStatus(id: number, status: string): Promise<Alert | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private devices: Map<number, Device>;
  private monitors: Map<number, Monitor>;
  private monitorResults: Map<number, MonitorResult[]>;
  private alerts: Map<number, Alert>;
  
  private currentUserId: number;
  private currentDeviceId: number;
  private currentMonitorId: number;
  private currentResultId: number;
  private currentAlertId: number;

  constructor() {
    this.users = new Map();
    this.devices = new Map();
    this.monitors = new Map();
    this.monitorResults = new Map();
    this.alerts = new Map();
    
    this.currentUserId = 1;
    this.currentDeviceId = 1;
    this.currentMonitorId = 1;
    this.currentResultId = 1;
    this.currentAlertId = 1;
    
    // Add some sample devices for testing
    this.initializeData();
  }
  
  private initializeData() {
    // Add a few sample devices
    const sampleDevices: InsertDevice[] = [
      { name: "Core Router", ipAddress: "192.168.1.1", type: "router" },
      { name: "Main Switch", ipAddress: "192.168.1.2", type: "switch" },
      { name: "Web Server", ipAddress: "192.168.1.100", type: "server" },
      { name: "Database Server", ipAddress: "192.168.1.101", type: "server" },
      { name: "AP Office 1", ipAddress: "192.168.1.150", type: "access_point" }
    ];
    
    sampleDevices.forEach(device => this.createDevice(device));
    
    // Add ICMP monitors for each device
    for (let i = 1; i <= sampleDevices.length; i++) {
      this.createMonitor({
        deviceId: i,
        type: "icmp",
        config: { timeout: 5, packetSize: 56, count: 3 },
        enabled: true,
        interval: 60
      });
    }
    
    // Add HTTP monitor for web server
    this.createMonitor({
      deviceId: 3,
      type: "http",
      config: { 
        url: "http://192.168.1.100", 
        method: "GET", 
        expectedStatus: 200, 
        timeout: 5,
        validateSSL: false
      },
      enabled: true,
      interval: 60
    });
    
    // Add TCP monitor for database server
    this.createMonitor({
      deviceId: 4,
      type: "tcp",
      config: { port: 5432, timeout: 5 },
      enabled: true,
      interval: 60
    });
    
    // Add some initial monitor results
    this.createMonitorResult(1, "online", 12, null);
    this.createMonitorResult(2, "online", 15, null);
    this.createMonitorResult(3, "down", null, { error: "Connection refused" });
    this.createMonitorResult(4, "online", 18, null);
    this.createMonitorResult(5, "warning", 120, { warning: "High latency" });
    
    // Add some alerts
    this.createAlert({
      deviceId: 3,
      monitorId: 3,
      message: "Web Server Offline",
      severity: "danger",
      status: "active"
    });
    
    this.createAlert({
      deviceId: 4,
      monitorId: 4,
      message: "High CPU Usage",
      severity: "warning",
      status: "active"
    });
    
    this.createAlert({
      deviceId: 5,
      monitorId: 5,
      message: "AP Response Time",
      severity: "warning",
      status: "active"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Device methods
  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }
  
  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }
  
  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = this.currentDeviceId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const device: Device = { ...insertDevice, id, createdAt, updatedAt };
    this.devices.set(id, device);
    return device;
  }
  
  async updateDevice(id: number, partialDevice: Partial<InsertDevice>): Promise<Device | undefined> {
    const device = this.devices.get(id);
    if (!device) return undefined;
    
    const updatedDevice: Device = {
      ...device,
      ...partialDevice,
      updatedAt: new Date()
    };
    
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }
  
  async deleteDevice(id: number): Promise<boolean> {
    // Delete all monitors for this device
    const deviceMonitors = await this.getMonitorsByDeviceId(id);
    for (const monitor of deviceMonitors) {
      await this.deleteMonitor(monitor.id);
    }
    
    return this.devices.delete(id);
  }
  
  // Monitor methods
  async getMonitors(): Promise<Monitor[]> {
    return Array.from(this.monitors.values());
  }
  
  async getMonitorsByDeviceId(deviceId: number): Promise<Monitor[]> {
    return Array.from(this.monitors.values()).filter(monitor => monitor.deviceId === deviceId);
  }
  
  async getMonitor(id: number): Promise<Monitor | undefined> {
    return this.monitors.get(id);
  }
  
  async createMonitor(insertMonitor: InsertMonitor): Promise<Monitor> {
    const id = this.currentMonitorId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const monitor: Monitor = { ...insertMonitor, id, createdAt, updatedAt };
    this.monitors.set(id, monitor);
    return monitor;
  }
  
  async updateMonitor(id: number, partialMonitor: Partial<InsertMonitor>): Promise<Monitor | undefined> {
    const monitor = this.monitors.get(id);
    if (!monitor) return undefined;
    
    const updatedMonitor: Monitor = {
      ...monitor,
      ...partialMonitor,
      updatedAt: new Date()
    };
    
    this.monitors.set(id, updatedMonitor);
    return updatedMonitor;
  }
  
  async deleteMonitor(id: number): Promise<boolean> {
    // Delete all results for this monitor
    this.monitorResults.delete(id);
    
    return this.monitors.delete(id);
  }
  
  // Monitor results methods
  async getLatestMonitorResult(monitorId: number): Promise<MonitorResult | undefined> {
    const results = this.monitorResults.get(monitorId);
    if (!results || results.length === 0) return undefined;
    
    return results[results.length - 1];
  }
  
  async getMonitorResults(monitorId: number, limit: number): Promise<MonitorResult[]> {
    const results = this.monitorResults.get(monitorId) || [];
    return results.slice(-limit);
  }
  
  async createMonitorResult(
    monitorId: number, 
    status: string, 
    responseTime?: number, 
    details?: any
  ): Promise<MonitorResult> {
    const id = this.currentResultId++;
    const timestamp = new Date();
    const result: MonitorResult = { id, monitorId, timestamp, status, responseTime, details };
    
    const existingResults = this.monitorResults.get(monitorId) || [];
    this.monitorResults.set(monitorId, [...existingResults, result]);
    
    return result;
  }
  
  // Alerts methods
  async getAlerts(status?: string): Promise<Alert[]> {
    const allAlerts = Array.from(this.alerts.values());
    if (status) {
      return allAlerts.filter(alert => alert.status === status);
    }
    return allAlerts;
  }
  
  async getAlertsByDeviceId(deviceId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.deviceId === deviceId);
  }
  
  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }
  
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const timestamp = new Date();
    const alert: Alert = { ...insertAlert, id, timestamp, acknowledgedAt: null, resolvedAt: null };
    this.alerts.set(id, alert);
    return alert;
  }
  
  async updateAlertStatus(id: number, status: string): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert: Alert = {
      ...alert,
      status
    };
    
    if (status === 'acknowledged' && !alert.acknowledgedAt) {
      updatedAlert.acknowledgedAt = new Date();
    }
    
    if (status === 'resolved' && !alert.resolvedAt) {
      updatedAlert.resolvedAt = new Date();
    }
    
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }
}

export const storage = new MemStorage();
