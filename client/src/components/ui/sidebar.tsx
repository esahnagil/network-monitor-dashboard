import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { X, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const Sidebar = ({ visible, setVisible }: SidebarProps) => {
  const [location] = useLocation();
  const { t } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(false);

  const navItems = [
    {
      name: t("dashboard.title"),
      path: "/",
      icon: (
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
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      name: t("devices.title"),
      path: "/devices",
      icon: (
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
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
      ),
    },
    {
      name: t("monitoring.title"),
      path: "/monitoring",
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      name: t("alerts.title"),
      path: "/alerts",
      icon: (
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    {
      name: t("settings.title"),
      path: "/settings",
      icon: (
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const closeOnMobile = () => {
    if (window.innerWidth < 768) {
      setVisible(false);
    }
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {visible && !isMinimized && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={() => setVisible(false)}
        />
      )}

      <nav
        className={cn(
          "fixed left-0 top-0 bottom-0 bg-gray-900 text-white transition-transform duration-300 ease-in-out z-30 row-start-1 row-end-4 col-start-1",
          {
            "translate-x-0": visible,
            "-translate-x-full": !visible,
            "w-64": !isMinimized,
            "w-16": isMinimized,
          }
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn(
            "p-4 flex items-center",
            isMinimized ? "justify-center" : "justify-between"
          )}>
            {!isMinimized && (
              <div className="flex items-center space-x-2">
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
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <h1 className="font-bold text-xl">NetGuardian</h1>
              </div>
            )}

            <div className="flex items-center">
              {!isMinimized && (
                <button 
                  className="md:hidden rounded-md text-gray-400 hover:text-white hover:bg-gray-800 p-1.5"
                  onClick={() => setVisible(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              <button
                className="hidden md:block rounded-md text-gray-400 hover:text-white hover:bg-gray-800 p-1.5"
                onClick={toggleMinimized}
              >
                {isMinimized ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className={cn(
              "space-y-1",
              isMinimized ? "px-2" : "px-4"
            )}>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={closeOnMobile}
                  className={cn(
                    "flex items-center rounded-md py-2.5 text-sm font-medium transition-colors",
                    isMinimized ? "justify-center px-2" : "px-4 space-x-2",
                    {
                      "bg-gray-800": location === item.path,
                      "hover:bg-gray-800": location !== item.path,
                    }
                  )}
                  title={isMinimized ? item.name : undefined}
                >
                  {item.icon}
                  {!isMinimized && <span>{item.name}</span>}
                </Link>
              ))}
            </div>
          </div>

          {!isMinimized && (
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white font-medium">JD</span>
                </div>
                <div>
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-gray-400">{t('user.role.admin')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;