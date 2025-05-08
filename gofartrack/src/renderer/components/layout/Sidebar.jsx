import React from "react";
import {
  HomeIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  TruckIcon,
  UserIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  DocumentTextIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../context/ThemeContext";

const Sidebar = ({ activeTab, handleTabClick, currentUser, onLogout }) => {
  const { isDarkMode } = useTheme();
  const isAdmin = currentUser?.user?.role === "admin";

  const mainNavItems = [
    { id: "dashboard", icon: HomeIcon, label: "Dashboard" },
    { id: "projects", icon: ChartBarIcon, label: "Projects" },
    { id: "sites", icon: BuildingOfficeIcon, label: "Sites" },
    { id: "reports", icon: DocumentTextIcon, label: "Reports" },
  ];

  const resourceNavItems = [
    { id: "employees", icon: UserGroupIcon, label: "Employees" },
    { id: "contractors", icon: UserIcon, label: "Contractors" },
    { id: "suppliers", icon: TruckIcon, label: "Suppliers" },
  ];

  const financeNavItems = [
    { id: "payments", icon: CurrencyDollarIcon, label: "Payments" },
  ];

  const systemNavItems = [
    { id: "settings", icon: Cog6ToothIcon, label: "Settings" },
  ];

  // All users can see menu items
  const visibleMainItems = mainNavItems;
  const visibleResourceItems = resourceNavItems;
  const visibleFinanceItems = financeNavItems;
  const visibleSystemItems = systemNavItems;

  return (
    <div
      className={`w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen shadow-lg`}
    >
      {/* User info section */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center space-x-4">
          <div className="bg-white/10 p-2 rounded-full">
            <UserCircleIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white text-lg">
              {currentUser?.user?.name || "User"}
            </p>
            <p className="text-sm text-blue-100">
              {currentUser?.user?.phone || "No phone"}
            </p>
            {currentUser?.user?.role === "admin" && (
              <p className="text-xs text-blue-100 mt-1 bg-blue-800/30 px-2 py-0.5 rounded">
                Administrator
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation - with flex-1 to take available space */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {/* Main Navigation */}
        <div>
          <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Main
          </h3>
          <div className="space-y-1">
            {visibleMainItems.map(({ id, icon: Icon, label }) => (
              <div
                key={id}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 ease-in-out 
                ${
                  activeTab === id
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                }
                ${
                  id === "logout"
                    ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    : ""
                }`}
                onClick={() =>
                  id === "logout" ? onLogout() : handleTabClick(id)
                }
              >
                <Icon
                  className={`w-5 h-5 mr-3 transition-all ${
                    activeTab === id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  }`}
                />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Resources Navigation */}
        <div>
          <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Resources
          </h3>
          <div className="space-y-1">
            {visibleResourceItems.map(({ id, icon: Icon, label }) => (
              <div
                key={id}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 ease-in-out 
                ${
                  activeTab === id
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => handleTabClick(id)}
              >
                <Icon
                  className={`w-5 h-5 mr-3 transition-all ${
                    activeTab === id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  }`}
                />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Finance Navigation */}
        <div>
          <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Finance
          </h3>
          <div className="space-y-1">
            {visibleFinanceItems.map(({ id, icon: Icon, label }) => (
              <div
                key={id}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 ease-in-out 
                ${
                  activeTab === id
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => handleTabClick(id)}
              >
                <Icon
                  className={`w-5 h-5 mr-3 transition-all ${
                    activeTab === id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  }`}
                />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* System Navigation */}
        <div>
          <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            System
          </h3>
          <div className="space-y-1">
            {visibleSystemItems.map(({ id, icon: Icon, label }) => (
              <div
                key={id}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 ease-in-out 
                ${
                  activeTab === id
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => handleTabClick(id)}
              >
                <Icon
                  className={`w-5 h-5 mr-3 transition-all ${
                    activeTab === id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  }`}
                />
                {label}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* We no longer need this separate logout button since it's in the system menu */}
    </div>
  );
};

export default Sidebar;
