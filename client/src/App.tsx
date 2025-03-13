import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/ui/sidebar";
import Dashboard from "@/pages/dashboard";
import Devices from "@/pages/devices";
import Monitoring from "@/pages/monitoring";
import Alerts from "@/pages/alerts";
import Settings from "@/pages/settings";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMonitoring } from "@/hooks/use-monitoring";
import { useToast } from "@/hooks/use-toast";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { LanguageSelector } from "@/components/language-selector";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/devices" component={Devices} />
      <Route path="/monitoring" component={Monitoring} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const { status: monitoringStatus, lastEvent } = useMonitoring();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    const handleStatusChange = () => {
      if (monitoringStatus === 'connected') {
        toast({
          title: t('notifications.connectionEstablished'),
          description: t('monitoring.connectionSuccess'),
          duration: 3000
        });
      } else if (monitoringStatus === 'disconnected') {
        toast({
          title: t('notifications.connectionLost'),
          description: t('monitoring.connectionLost'),
          variant: 'destructive',
          duration: 3000
        });
      }
    };

    handleStatusChange();
  }, [monitoringStatus]);

  useEffect(() => {
    const handleAlertEvent = () => {
      if (lastEvent && lastEvent.type === 'alert') {
        toast({
          title: t('alerts.notification.title'),
          description: lastEvent.data.message,
          variant: 'destructive',
          duration: 5000
        });
      }
    };

    handleAlertEvent();
  }, [lastEvent]);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <div className="min-h-screen bg-background">
          <Sidebar visible={showSidebar} setVisible={setShowSidebar} />

          <div className={cn(
            "transition-all duration-300 min-h-screen",
            showSidebar ? "md:ml-64" : "ml-0"
          )}>
            <header className="sticky top-0 bg-white shadow-sm z-20">
              <div className="flex items-center justify-between p-4">
                <button 
                  className="text-gray-500 hover:text-gray-700 md:hidden"
                  onClick={() => setShowSidebar(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>

                <div className="flex items-center space-x-4 ml-auto">
                  <div className="relative">
                    <button className="text-gray-500 hover:text-gray-700 relative">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                        />
                      </svg>
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
                    </button>
                  </div>

                  <div className="relative hidden md:block">
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="bg-gray-100 rounded-md px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 absolute right-3 top-2.5 text-gray-500" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                      />
                    </svg>
                  </div>

                  <div className="md:hidden">
                    <button className="text-gray-500 hover:text-gray-700">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                      </svg>
                    </button>
                  </div>

                  <LanguageSelector variant="minimal" />
                </div>
              </div>
            </header>

            <main className="p-6">
              <Router />
            </main>
          </div>
          <Toaster />
        </div>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;