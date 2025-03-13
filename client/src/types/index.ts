export interface Device {
  id: number;
  name: string;
  ipAddress: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface Monitor {
  id: number;
  deviceId: number;
  type: string;
  config: any;
  enabled: boolean;
  interval: number;
  createdAt: string;
  updatedAt: string;
}

export interface MonitorResult {
  id: number;
  monitorId: number;
  timestamp: string;
  status: string;
  responseTime?: number;
  details?: any;
}

export interface Alert {
  id: number;
  deviceId: number;
  monitorId: number;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface DashboardSummary {
  devices: {
    total: number;
    online: number;
    percentage: number;
  };
  webServices: {
    total: number;
    online: number;
    percentage: number;
  };
  activeAlerts: number;
  averageResponseTime: number;
}

export interface DeviceWithStatus extends Device {
  status?: string;
  responseTime?: number;
  lastCheck?: string;
}

export interface DeviceTypeIcon {
  [key: string]: JSX.Element;
}

export interface DeviceTypeLabel {
  [key: string]: string;
}
