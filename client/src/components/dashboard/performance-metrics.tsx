import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

// Simulated data for the charts
const generateNetworkData = (period: string) => {
  const points = period === 'day' ? 24 : period === 'week' ? 7 : 30;
  return Array.from({ length: points }, (_, i) => {
    const time = period === 'day' 
      ? `${i}:00` 
      : period === 'week' 
        ? `Day ${i + 1}` 
        : `Day ${i + 1}`;
    
    return {
      time,
      inbound: Math.floor(Math.random() * 100) + 20,
      outbound: Math.floor(Math.random() * 80) + 10,
    };
  });
};

const systemPerformanceData = [
  { name: 'CPU', usage: 74 },
  { name: 'Memory', usage: 46 },
  { name: 'Disk', usage: 92 },
  { name: 'Network', usage: 35 }
];

const processData = [
  { name: 'postgres', cpu: 34, memory: 1.2 },
  { name: 'nginx', cpu: 12, memory: 0.5 },
  { name: 'node', cpu: 8, memory: 0.8 }
];

const PerformanceMetrics = () => {
  const [timeRange, setTimeRange] = useState('day');
  const [selectedDevice, setSelectedDevice] = useState('database');
  
  // This would be a real API call in a production app
  const { data: networkData } = useQuery({
    queryKey: ['networkTraffic', timeRange],
    queryFn: () => Promise.resolve(generateNetworkData(timeRange))
  });
  
  // These would also be real API calls
  const { data: deviceList } = useQuery({
    queryKey: ['deviceOptions'],
    queryFn: () => Promise.resolve([
      { value: 'database', label: 'Database Server' },
      { value: 'web', label: 'Web Server' },
      { value: 'router', label: 'Core Router' }
    ])
  });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Network Traffic */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Network Traffic</h3>
            <div className="flex items-center space-x-2">
              <Select defaultValue={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Last 24 hours</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
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
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-medium">Router Bandwidth Usage</h4>
              <p className="text-xs text-gray-500">Average: 35.42 Mbps</p>
            </div>
            <div className="text-xs font-medium">
              <span className="text-green-500">▲ 1.2 Gbps</span> / 
              <span className="text-red-500">▼ 0.8 Gbps</span>
            </div>
          </div>
          
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={networkData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="inbound" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f680" 
                  name="Inbound"
                />
                <Area 
                  type="monotone" 
                  dataKey="outbound" 
                  stackId="1"
                  stroke="#ef4444" 
                  fill="#ef444480" 
                  name="Outbound"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">Upload</p>
              <p className="text-lg font-medium text-primary">256 GB</p>
              <p className="text-xs text-green-500">+12% from yesterday</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">Download</p>
              <p className="text-lg font-medium text-primary">1.2 TB</p>
              <p className="text-xs text-green-500">+8% from yesterday</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">System Performance</h3>
            <div className="flex items-center space-x-2">
              <Select defaultValue={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  {deviceList?.map(device => (
                    <SelectItem key={device.value} value={device.value}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </div>
        <div className="p-4">
          <div className="mb-6">
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={systemPerformanceData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="usage" 
                    name="Usage %"
                    fill="#3b82f6"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Active Processes</h4>
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-left py-2">Process</th>
                  <th className="text-right py-2">CPU</th>
                  <th className="text-right py-2">Memory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {processData.map((process, idx) => (
                  <tr key={idx}>
                    <td className="py-2">{process.name}</td>
                    <td className="text-right py-2">{process.cpu}%</td>
                    <td className="text-right py-2">{process.memory} GB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
