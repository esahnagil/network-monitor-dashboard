import { useQuery } from "@tanstack/react-query";
import { Device, Metric } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import { DeviceStatus } from "@/components/device-status";
import { MetricChart } from "@/components/metric-chart";

export default function Dashboard() {
  const { data: devices } = useQuery<Device[]>({
    queryKey: ["/api/devices"]
  });

  const { lastMetric } = useWebSocket();

  const deviceMetrics = new Map<number, Metric>();
  if (lastMetric) {
    deviceMetrics.set(lastMetric.deviceId, lastMetric);
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">System Status</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices?.map(device => (
          <DeviceStatus
            key={device.id}
            device={device}
            lastMetric={deviceMetrics.get(device.id)}
          />
        ))}
      </div>

      {devices?.map(device => (
        <MetricChartSection key={device.id} deviceId={device.id} />
      ))}
    </div>
  );
}

function MetricChartSection({ deviceId }: { deviceId: number }) {
  const { data: device } = useQuery<Device>({
    queryKey: [`/api/devices/${deviceId}`]
  });

  const { data: metrics } = useQuery<Metric[]>({
    queryKey: [`/api/devices/${deviceId}/metrics`],
    queryFn: () => fetch(`/api/devices/${deviceId}/metrics?limit=100`).then(r => r.json())
  });

  if (!device || !metrics?.length) return null;

  return (
    <MetricChart
      metrics={metrics}
      title={`${device.name} - Response Time`}
    />
  );
}
