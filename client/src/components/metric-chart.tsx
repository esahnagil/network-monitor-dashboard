import { useMemo } from "react";
import { Metric } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface MetricChartProps {
  metrics: Metric[];
  title: string;
}

export function MetricChart({ metrics, title }: MetricChartProps) {
  const data = useMemo(() => {
    return metrics.map(metric => ({
      time: format(new Date(metric.timestamp), "HH:mm:ss"),
      responseTime: metric.responseTime || 0
    }));
  }, [metrics]);

  return (
    <Card className="h-[300px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="responseTime"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
