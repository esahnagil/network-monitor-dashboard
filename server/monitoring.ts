import { createConnection } from "net";
import { Device, InsertMetric, MonitoringProtocol } from "@shared/schema";

export async function checkDevice(device: Device): Promise<InsertMetric> {
  const timestamp = new Date();
  let status = false;
  let responseTime: number | null = null;
  let error: string | null = null;
  let data: any = null;

  try {
    switch (device.protocol) {
      case MonitoringProtocol.ICMP:
        ({ status, responseTime } = await checkTCPPing(device.host));
        break;
      case MonitoringProtocol.HTTP:
        ({ status, responseTime } = await checkHTTP(device.host));
        break;
      case MonitoringProtocol.TCP:
        if (!device.port) throw new Error("Port is required for TCP monitoring");
        ({ status, responseTime } = await checkTCP(device.host, device.port));
        break;
      case MonitoringProtocol.SNMP:
        if (!device.port) {
          device.port = 161; // Default SNMP port
        }
        ({ status, responseTime } = await checkTCP(device.host, device.port));
        break;
      default:
        throw new Error(`Unsupported protocol: ${device.protocol}`);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
    status = false;
  }

  return {
    deviceId: device.id,
    timestamp,
    status,
    responseTime,
    error,
    data
  };
}

// TCP based ping - more reliable than ICMP in containerized environments
async function checkTCPPing(host: string): Promise<{ status: boolean; responseTime: number }> {
  return checkTCP(host, 80);
}

async function checkHTTP(host: string): Promise<{ status: boolean; responseTime: number }> {
  const start = Date.now();
  try {
    const response = await fetch(host);
    const responseTime = Date.now() - start;
    return {
      status: response.ok,
      responseTime
    };
  } catch (error) {
    throw new Error(`HTTP check failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function checkTCP(host: string, port: number): Promise<{ status: boolean; responseTime: number }> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const socket = createConnection(port, host);

    socket.on('connect', () => {
      const responseTime = Date.now() - start;
      socket.destroy();
      resolve({ status: true, responseTime });
    });

    socket.on('error', (error) => {
      socket.destroy();
      reject(error);
    });

    socket.setTimeout(5000, () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
  });
}