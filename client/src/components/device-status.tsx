import { Device, Metric } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface DeviceStatusProps {
  device: Device;
  lastMetric?: Metric;
}

export function DeviceStatus({ device, lastMetric }: DeviceStatusProps) {
  const getStatusColor = () => {
    if (!lastMetric) return "bg-gray-400";
    return lastMetric.status ? "bg-green-500" : "bg-red-500";
  };

  const getStatusIcon = () => {
    if (!lastMetric) return <Clock className="h-5 w-5 text-gray-400" />;
    return lastMetric.status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {device.name}
        </CardTitle>
        <Badge variant="outline">{device.protocol}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{device.host}</p>
            {lastMetric?.responseTime && (
              <p className="text-xs text-muted-foreground">
                Response time: {lastMetric.responseTime}ms
              </p>
            )}
            {lastMetric?.error && (
              <p className="text-xs text-red-500">{lastMetric.error}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
