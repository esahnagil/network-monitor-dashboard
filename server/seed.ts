import { db } from "./db";
import { devices, monitors, monitorResults, alerts } from "@shared/schema";
import type { InsertDevice, InsertMonitor, InsertAlert } from "@shared/schema";

/**
 * Seed the database with initial data
 */
export async function seedDatabase() {
  // Check if database is already seeded
  const existingDevices = await db.select().from(devices);
  if (existingDevices.length > 0) {
    console.log("Database already seeded, skipping seed operation");
    return;
  }

  console.log("Seeding database with initial data...");
  
  // Add sample devices
  const sampleDevices: InsertDevice[] = [
    { name: "Core Router", ipAddress: "192.168.1.1", type: "router" },
    { name: "Main Switch", ipAddress: "192.168.1.2", type: "switch" },
    { name: "Web Server", ipAddress: "192.168.1.100", type: "server" },
    { name: "Database Server", ipAddress: "192.168.1.101", type: "server" },
    { name: "AP Office 1", ipAddress: "192.168.1.150", type: "access_point" }
  ];
  
  // Insert devices and get their IDs
  const deviceIds: number[] = [];
  
  for (const device of sampleDevices) {
    const now = new Date();
    const [result] = await db
      .insert(devices)
      .values({
        ...device,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    
    deviceIds.push(result.id);
  }
  
  // Add ICMP monitors for all devices
  for (const deviceId of deviceIds) {
    const now = new Date();
    const monitor: InsertMonitor = {
      deviceId,
      type: "icmp",
      config: { timeout: 5, packetSize: 56, count: 3 },
      enabled: true,
      interval: 60
    };
    
    const [result] = await db
      .insert(monitors)
      .values({
        ...monitor,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    
    // Add initial result
    await db
      .insert(monitorResults)
      .values({
        monitorId: result.id,
        status: deviceId === 3 ? "down" : deviceId === 5 ? "warning" : "online",
        responseTime: deviceId === 5 ? 120 : deviceId === 3 ? null : Math.floor(Math.random() * 20) + 10,
        details: deviceId === 3 ? { error: "Connection refused" } : 
                deviceId === 5 ? { warning: "High latency" } : null,
        timestamp: new Date()
      });
  }
  
  // Add HTTP monitor for web server
  const now = new Date();
  const httpMonitor: InsertMonitor = {
    deviceId: 3, // Web Server
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
  };
  
  const [httpResult] = await db
    .insert(monitors)
    .values({
      ...httpMonitor,
      createdAt: now,
      updatedAt: now
    })
    .returning();
  
  // Add TCP monitor for database server
  const tcpMonitor: InsertMonitor = {
    deviceId: 4, // Database Server
    type: "tcp",
    config: { port: 5432, timeout: 5 },
    enabled: true,
    interval: 60
  };
  
  const [tcpResult] = await db
    .insert(monitors)
    .values({
      ...tcpMonitor,
      createdAt: now,
      updatedAt: now
    })
    .returning();
    
  // Add some alerts
  const alertData: InsertAlert[] = [
    {
      deviceId: 3,
      monitorId: httpResult.id,
      message: "Web Server Offline",
      severity: "danger",
      status: "active"
    },
    {
      deviceId: 4,
      monitorId: tcpResult.id,
      message: "High CPU Usage",
      severity: "warning",
      status: "active"
    },
    {
      deviceId: 5,
      monitorId: 5, // ICMP monitor for AP
      message: "AP Response Time",
      severity: "warning",
      status: "active"
    }
  ];
  
  for (const alert of alertData) {
    await db
      .insert(alerts)
      .values({
        ...alert,
        timestamp: new Date()
      });
  }
  
  console.log("Database seeded successfully");
}