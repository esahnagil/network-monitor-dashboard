import StatusOverview from "@/components/dashboard/status-overview";
import DeviceList from "@/components/dashboard/device-list";
import ActiveAlerts from "@/components/dashboard/active-alerts";
import PerformanceMetrics from "@/components/dashboard/performance-metrics";

const Dashboard = () => {
  return (
    <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Network Overview</h2>
        <p className="text-gray-600">Monitoring your network infrastructure</p>
      </div>

      {/* Status Overview */}
      <StatusOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Device List */}
        <DeviceList />

        {/* Active Alerts */}
        <ActiveAlerts />
      </div>

      {/* Performance Metrics */}
      <PerformanceMetrics />
    </main>
  );
};

export default Dashboard;
