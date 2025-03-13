import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const MonitoringProtocol = {
  ICMP: "ICMP",
  HTTP: "HTTP", 
  TCP: "TCP",
  SNMP: "SNMP"
} as const;

export type MonitoringProtocolType = typeof MonitoringProtocol[keyof typeof MonitoringProtocol];

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  host: text("host").notNull(),
  protocol: text("protocol", { enum: ["ICMP", "HTTP", "TCP", "SNMP"] }).notNull(),
  port: integer("port"),
  snmpCommunity: text("snmp_community"),
  snmpOid: text("snmp_oid"),
  interval: integer("interval").notNull().default(60), // seconds
  enabled: boolean("enabled").notNull().default(true)
});

export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  status: boolean("status").notNull(),
  responseTime: integer("response_time"),
  error: text("error"),
  data: jsonb("data")
});

export const insertDeviceSchema = createInsertSchema(devices)
  .omit({ id: true })
  .extend({
    port: z.number().min(1).max(65535).optional(),
    snmpCommunity: z.string().optional(),
    snmpOid: z.string().optional(),
    interval: z.number().min(10).max(3600)
  });

export const insertMetricSchema = createInsertSchema(metrics)
  .omit({ id: true });

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;