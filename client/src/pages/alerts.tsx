import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Alert, Device } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  Table, 
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Alerts = () => {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("active");

  // Fetch alerts
  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ['/api/alerts', statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/alerts?status=${statusFilter}`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return res.json();
    }
  });

  // Fetch devices for reference
  const { data: devices } = useQuery<Device[]>({
    queryKey: ['/api/devices'],
  });

  // Update alert status mutation
  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await apiRequest('PUT', `/api/alerts/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      toast({
        title: "Alert Updated",
        description: "The alert status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update alert: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Get device name by ID
  const getDeviceName = (deviceId: number) => {
    return devices?.find(d => d.id === deviceId)?.name || 'Unknown Device';
  };

  // Get alert severity class
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  // Count alerts by severity
  const alertCounts = {
    danger: alerts?.filter(a => a.severity === 'danger').length || 0,
    warning: alerts?.filter(a => a.severity === 'warning').length || 0,
    info: alerts?.filter(a => a.severity === 'info').length || 0,
    total: alerts?.length || 0
  };

  // Handle alert action
  const handleAlertAction = (id: number, status: string) => {
    updateAlertMutation.mutate({ id, status });
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Alerts</h2>
        <p className="text-gray-600">Monitor and manage system alerts</p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertCounts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertCounts.danger}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{alertCounts.warning}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{alertCounts.info}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Alert History</h3>
          <Select 
            defaultValue={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Alerts</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="">All Alerts</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, idx) => (
                  <TableRow key={idx} className="animate-pulse">
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : alerts?.length ? (
                alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Badge
                        className={cn("font-normal", getSeverityClass(alert.severity))}
                      >
                        {alert.severity === 'danger' ? 'Critical' : 
                          alert.severity === 'warning' ? 'Warning' : 'Info'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getDeviceName(alert.deviceId)}</TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={alert.status === 'active' ? 'destructive' : 
                                alert.status === 'acknowledged' ? 'outline' : 'default'}
                        className={alert.status === 'resolved' ? 'bg-green-500' : ''}
                      >
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {alert.status === 'active' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAlertAction(alert.id, 'acknowledged')}
                            disabled={updateAlertMutation.isPending}
                          >
                            Acknowledge
                          </Button>
                        )}
                        {(alert.status === 'active' || alert.status === 'acknowledged') && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleAlertAction(alert.id, 'resolved')}
                            disabled={updateAlertMutation.isPending}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    {statusFilter ? `No ${statusFilter} alerts found.` : 'No alerts found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
};

export default Alerts;
