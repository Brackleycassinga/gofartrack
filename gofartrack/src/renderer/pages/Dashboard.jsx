import React from "react";
import {
  PlusIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

const Dashboard = (props) => {
  // Extract data from props
  const projects = props.projects || [];
  const employees = props.employees || [];
  const transactions = props.transactions || [];
  const supplies = props.supplies || [];

  // Calculate metrics based on actual data
  const activeProjects = projects.filter(
    (p) => p.status !== "Completed"
  ).length;
  const totalEmployees = employees.length;
  const presentEmployees = employees.filter((emp) => emp.present).length;

  // Calculate total labor costs based on wage payments in transactions
  const totalLaborCost = transactions
    .filter((t) => t.category === "wages" || t.recipientType === "employee")
    .reduce((total, transaction) => {
      if (transaction.type === "expense") {
        return total + Math.abs(transaction.amount || 0);
      }
      return total;
    }, 0);

  // Get site statistics from projects
  const siteMap = {};
  projects.forEach((project) => {
    if (project.location) {
      if (!siteMap[project.location]) {
        siteMap[project.location] = {
          name: project.location,
          employeeCount: 0,
          progress: project.progress || 0,
        };
      }
    }
  });

  // Count employees at each site
  employees.forEach((emp) => {
    const site = emp.site;
    if (site && siteMap[site]) {
      siteMap[site].employeeCount += 1;
    }
  });

  const sites = Object.values(siteMap);

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header with Date and Quick Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => props.handleTabClick && props.handleTabClick("projects")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Project
          </button>
          <button
            onClick={() => props.handleTabClick && props.handleTabClick("employees")}
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow border border-gray-200 dark:border-gray-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Projects Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Projects</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {projects.length}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                {activeProjects} active
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Employees Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Employees</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalEmployees}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-2">
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                {presentEmployees} present today
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Sites Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Sites</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {sites.length}
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-2">
                <UserGroupIcon className="w-3 h-3 mr-1" />
                {sites.reduce((total, site) => total + site.employeeCount, 0)} workers assigned
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        {/* Labor Cost Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Labor Cost</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalLaborCost)}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-2">
                <ClockIcon className="w-3 h-3 mr-1" />
                Total from payments
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
              <BanknotesIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Project Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 lg:col-span-2 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Progress</h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{project.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{project.progress || 0}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  <CurrencyDollarIcon className={`w-5 h-5 ${
                    transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-300 truncate">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div className={`text-sm font-medium ${
                  transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
