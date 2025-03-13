import { useQuery, useMutation } from "@tanstack/react-query";
import { Alert } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";

const AlertSeverityBorder = ({ severity }: { severity: string }) => {
  const borderClasses = {
    'danger': 'border-red-500',
    'warning': 'border-yellow-500',
    'info': 'border-blue-500'
  };

  return borderClasses[severity as keyof typeof borderClasses] || borderClasses.info;
};

const ActiveAlerts = () => {
  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    queryFn: async () => {
      const res = await fetch('/api/alerts?status=active');
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return res.json();
    }
  });

  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await apiRequest('PUT', `/api/alerts/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
    }
  });

  const handleAcknowledge = (alertId: number) => {
    updateAlertMutation.mutate({ id: alertId, status: 'acknowledged' });
  };

  const handleEscalate = (alertId: number) => {
    // In a real app, this might do something different like create a ticket or notify specific personnel
    // For now, we'll just acknowledge it
    updateAlertMutation.mutate({ id: alertId, status: 'acknowledged' });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Active Alerts</h3>
            <button className="text-gray-500 hover:text-gray-700">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" 
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="border-l-4 border-gray-300 pl-3 py-2 animate-pulse">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-40"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-10"></div>
              </div>
              <div className="mt-2 flex space-x-2">
                <div className="h-6 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <div className="h-6 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Active Alerts</h3>
          <button className="text-gray-500 hover:text-gray-700">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" 
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {alerts && alerts.length > 0 ? (
          alerts.map(alert => (
            <div 
              key={alert.id} 
              className={cn("border-l-4 pl-3 py-2", AlertSeverityBorder({ severity: alert.severity }))}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium">{alert.message}</h4>
                  <p className="text-xs text-gray-500">
                    Alert ID: {alert.id} - Device ID: {alert.deviceId}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </span>
              </div>
              <div className="mt-2 flex space-x-2">
                <button 
                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                  onClick={() => handleAcknowledge(alert.id)}
                  disabled={updateAlertMutation.isPending}
                >
                  Acknowledge
                </button>
                <button 
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleEscalate(alert.id)}
                  disabled={updateAlertMutation.isPending}
                >
                  Escalate
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 mx-auto text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No active alerts</p>
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <button className="w-full py-2 text-sm text-center text-primary hover:underline">
          View All Alerts
        </button>
      </div>
    </div>
  );
};

export default ActiveAlerts;
