import { Device, InsertDevice, Metric, InsertMetric } from "@shared/schema";

export interface IStorage {
  // Device operations
  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, device: Partial<InsertDevice>): Promise<Device | undefined>;
  deleteDevice(id: number): Promise<boolean>;

  // Metric operations  
  getMetrics(deviceId: number, limit?: number): Promise<Metric[]>;
  addMetric(metric: InsertMetric): Promise<Metric>;
}

export class MemStorage implements IStorage {
  private devices: Map<number, Device>;
  private metrics: Map<number, Metric[]>;
  private deviceId: number;
  private metricId: number;

  constructor() {
    this.devices = new Map();
    this.metrics = new Map();
    this.deviceId = 1;
    this.metricId = 1;
  }

  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const id = this.deviceId++;
    const newDevice: Device = {
      ...device,
      id,
      port: device.port ?? null,
      snmpCommunity: device.snmpCommunity ?? null,
      snmpOid: device.snmpOid ?? null,
      enabled: device.enabled ?? true
    };
    this.devices.set(id, newDevice);
    this.metrics.set(id, []);
    return newDevice;
  }

  async updateDevice(id: number, device: Partial<InsertDevice>): Promise<Device | undefined> {
    const existing = this.devices.get(id);
    if (!existing) return undefined;

    const updated: Device = {
      ...existing,
      ...device,
      port: device.port ?? existing.port,
      snmpCommunity: device.snmpCommunity ?? existing.snmpCommunity,
      snmpOid: device.snmpOid ?? existing.snmpOid,
      enabled: device.enabled ?? existing.enabled
    };
    this.devices.set(id, updated);
    return updated;
  }

  async deleteDevice(id: number): Promise<boolean> {
    const deleted = this.devices.delete(id);
    if (deleted) {
      this.metrics.delete(id);
    }
    return deleted;
  }

  async getMetrics(deviceId: number, limit?: number): Promise<Metric[]> {
    const deviceMetrics = this.metrics.get(deviceId) || [];
    return limit ? deviceMetrics.slice(-limit) : deviceMetrics;
  }

  async addMetric(metric: InsertMetric): Promise<Metric> {
    const id = this.metricId++;
    const newMetric: Metric = {
      ...metric,
      id,
      responseTime: metric.responseTime ?? null,
      error: metric.error ?? null,
      data: metric.data ?? null
    };

    const deviceMetrics = this.metrics.get(metric.deviceId) || [];
    deviceMetrics.push(newMetric);
    this.metrics.set(metric.deviceId, deviceMetrics);

    return newMetric;
  }
}

export const storage = new MemStorage();