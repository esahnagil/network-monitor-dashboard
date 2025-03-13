import { useQuery } from "@tanstack/react-query";
import { DashboardSummary } from "@/types";
import { cn } from "@/lib/utils";

const StatusOverview = () => {
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['/api/dashboard/summary'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="mt-2">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-1"></div>
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Unable to load dashboard summary. Try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Devices Online</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" 
            />
          </svg>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-semibold">{summary.devices.online}/{summary.devices.total}</p>
          <div className="flex items-center mt-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn("rounded-full h-2", {
                  "bg-green-500": summary.devices.percentage >= 90,
                  "bg-yellow-500": summary.devices.percentage >= 70 && summary.devices.percentage < 90,
                  "bg-red-500": summary.devices.percentage < 70
                })}
                style={{ width: `${summary.devices.percentage}%` }}
              ></div>
            </div>
            <span 
              className={cn("text-xs font-medium ml-2", {
                "text-green-500": summary.devices.percentage >= 90,
                "text-yellow-500": summary.devices.percentage >= 70 && summary.devices.percentage < 90,
                "text-red-500": summary.devices.percentage < 70
              })}
            >
              {summary.devices.percentage}%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Web Services</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
            />
          </svg>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-semibold">{summary.webServices.online}/{summary.webServices.total}</p>
          <div className="flex items-center mt-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn("rounded-full h-2", {
                  "bg-green-500": summary.webServices.percentage >= 90,
                  "bg-yellow-500": summary.webServices.percentage >= 70 && summary.webServices.percentage < 90,
                  "bg-red-500": summary.webServices.percentage < 70
                })}
                style={{ width: `${summary.webServices.percentage}%` }}
              ></div>
            </div>
            <span 
              className={cn("text-xs font-medium ml-2", {
                "text-green-500": summary.webServices.percentage >= 90,
                "text-yellow-500": summary.webServices.percentage >= 70 && summary.webServices.percentage < 90,
                "text-red-500": summary.webServices.percentage < 70
              })}
            >
              {summary.webServices.percentage}%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Active Alerts</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-semibold">{summary.activeAlerts}</p>
          <div className="flex items-center mt-1 text-xs text-red-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 10l7-7m0 0l7 7m-7-7v18" 
              />
            </svg>
            <span className="ml-1">+{summary.activeAlerts} in the last hour</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Average Response</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-semibold">{summary.averageResponseTime} ms</p>
          <div className="flex items-center mt-1 text-xs text-green-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
            <span className="ml-1">-3ms from yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusOverview;
