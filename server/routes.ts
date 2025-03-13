import { Express } from "express";
import { createServer, Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { checkDevice } from "./monitoring";
import { insertDeviceSchema } from "@shared/schema";
import { z } from "zod";

const deviceTimers = new Map<number, NodeJS.Timeout>();
const connectedClients = new Set<WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    
    ws.on('close', () => {
      connectedClients.delete(ws);
    });
  });

  // Device management endpoints
  app.get('/api/devices', async (req, res) => {
    const devices = await storage.getDevices();
    res.json(devices);
  });

  app.post('/api/devices', async (req, res) => {
    try {
      const device = insertDeviceSchema.parse(req.body);
      const created = await storage.createDevice(device);
      startMonitoring(created);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create device" });
      }
    }
  });

  app.patch('/api/devices/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const updates = insertDeviceSchema.partial().parse(req.body);
      const updated = await storage.updateDevice(id, updates);
      if (updated) {
        stopMonitoring(id);
        startMonitoring(updated);
        res.json(updated);
      } else {
        res.status(404).json({ error: "Device not found" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update device" });
      }
    }
  });

  app.delete('/api/devices/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    stopMonitoring(id);
    const deleted = await storage.deleteDevice(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Device not found" });
    }
  });

  app.get('/api/devices/:id/metrics', async (req, res) => {
    const id = parseInt(req.params.id);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const metrics = await storage.getMetrics(id, limit);
    res.json(metrics);
  });

  // Initialize monitoring for existing devices
  const devices = await storage.getDevices();
  devices.forEach(startMonitoring);

  return httpServer;
}

function startMonitoring(device: { id: number; interval: number }) {
  stopMonitoring(device.id);
  
  const timer = setInterval(async () => {
    try {
      const currentDevice = await storage.getDevice(device.id);
      if (!currentDevice || !currentDevice.enabled) return;

      const metric = await checkDevice(currentDevice);
      const saved = await storage.addMetric(metric);

      // Broadcast to all connected clients
      const message = JSON.stringify({
        type: 'metric',
        deviceId: device.id,
        data: saved
      });

      connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error(`Monitoring error for device ${device.id}:`, error);
    }
  }, device.interval * 1000);

  deviceTimers.set(device.id, timer);
}

function stopMonitoring(deviceId: number) {
  const timer = deviceTimers.get(deviceId);
  if (timer) {
    clearInterval(timer);
    deviceTimers.delete(deviceId);
  }
}
