import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  TruckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  paymentApi,
  projectApi,
  contractorApi,
  supplierApi,
  employeeApi,
} from "../services/api";
import PaymentModal from "../components/modals/PaymentModal";
import FinancialReport from "../services/reportgenerator";
import BulkWagePaymentModal from "../components/modals/BulkWagePaymentModal";

const Payments = ({
  transactions = [],
  handleAddPayment,
  paymentType,
  setPaymentType,
  projects = [],
  employees = [],
  supplies = [],
  contractors = [],
  currentUser,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStats, setPaymentStats] = useState(null);
  const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: {
      start: "",
      end: "",
    },
    category: "",
    employeeType: "",
    paymentMethod: "",
  });
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportData, setReportData] = useState({
    transactions: [],
    projects: [],
    contractors: [],
    employees: [],
    supplies: [],
  });

  const isAdmin = currentUser?.user?.role === "admin";

  // Fetch payment statistics
  useEffect(() => {
    const fetchPaymentStats = async () => {
      try {
        const response = await paymentApi.getStatistics();
        setPaymentStats(response.data);
      } catch (error) {
        console.error("Error fetching payment statistics:", error);
      }
    };

    fetchPaymentStats();
  }, [transactions]);

  // Load report data when component mounts
  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // Uses Promise.all to fetch all data in parallel
      const [
        allTransactions,
        allProjects,
        allContractors,
        allEmployees,
        allSupplies,
      ] = await Promise.all([
        paymentApi.getAll(),
        projectApi.getAll(),
        contractorApi.getAll(),
        employeeApi.getAll(),
        supplierApi.getAll(),
      ]);

      setReportData({
        transactions: allTransactions.data || [],
        projects: allProjects.data || [],
        contractors: allContractors.data || [],
        employees: allEmployees.data || [],
        supplies: allSupplies.data || [],
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  // Calculate summary statistics
  const calculateStats = () => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const dailyWages = transactions
      .filter(
        (t) =>
          t.category === "wages" &&
          new Date(t.date).toDateString() === today.toDateString()
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyContracts = transactions
      .filter(
        (t) =>
          t.category === "contract" &&
          new Date(t.date).getMonth() === thisMonth &&
          new Date(t.date).getFullYear() === thisYear
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlySupplies = transactions
      .filter(
        (t) =>
          t.category === "supplies" &&
          new Date(t.date).getMonth() === thisMonth &&
          new Date(t.date).getFullYear() === thisYear
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { dailyWages, monthlyContracts, monthlySupplies };
  };

  const { dailyWages, monthlyContracts, monthlySupplies } = calculateStats();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Filter transactions based on filters
  useEffect(() => {
    const filtered = transactions.filter((transaction) => {
      // Apply date range filter
      if (filters.dateRange.start && new Date(transaction.date) < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange.end && new Date(transaction.date) > new Date(filters.dateRange.end)) {
        return false;
      }

      // Apply category filter
      if (filters.category && transaction.category !== filters.category) {
        return false;
      }

      // Apply employee type filter
      if (filters.employeeType && transaction.employeeType !== filters.employeeType) {
        return false;
      }

      // Apply payment method filter
      if (filters.paymentMethod && transaction.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      return true;
    });

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  const handleAddPaymentClick = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      setIsLoading(true);
      // Create the payment - this is the ONLY place we should call the API
      await paymentApi.create(paymentData);

      // Close the modal
      setShowPaymentModal(false);

      // Refresh the data
      if (handleAddPayment) {
        await handleAddPayment();
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Failed to create payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkPaymentSubmit = async (paymentData) => {
    try {
      await handleAddPayment(paymentData);
      setShowBulkPaymentModal(false);
    } catch (error) {
      console.error("Error processing bulk payment:", error);
      alert("Failed to process bulk payment. Please try again.");
    }
  };

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all financial transactions
          </p>
        </div>
        <div className="flex space-x-3">
          {/* Report button available to all users */}
          <FinancialReport
            transactions={reportData.transactions}
            projects={reportData.projects}
            contractors={reportData.contractors}
            employees={reportData.employees}
            supplies={reportData.supplies}
          />

          {/* New Payment button only visible to admins */}
          {isAdmin && (
            <button
              onClick={() => setShowBulkPaymentModal(true)}
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow border border-gray-200 dark:border-gray-700"
            >
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Bulk Wage Payment
            </button>
          )}

          {/* New Payment button only visible to admins */}
          {isAdmin && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Payment
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
          <button
            onClick={() =>
              setFilters({
                dateRange: { start: "", end: "" },
                category: "",
                employeeType: "",
                paymentMethod: "",
              })
            }
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowPathIcon className="w-4 h-4 mr-1" />
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              <option value="wages">Wages</option>
              <option value="supplies">Supplies</option>
              <option value="contractors">Contractors</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Employee Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Employee Type
            </label>
            <select
              value={filters.employeeType}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, employeeType: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="skilled">Skilled Workers</option>
              <option value="unskilled">Unskilled Workers</option>
              <option value="supervisor">Supervisors</option>
              <option value="specialist">Specialists</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Payment Method
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="mobile">Mobile Money</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Daily Wages
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(dailyWages)}
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Today</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
              <BanknotesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Contracts
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(monthlyContracts)}
              </h3>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">This Month</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Supplies</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(monthlySupplies)}
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">This Month</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
              <TruckIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {transaction.recipients ? (
                      <div className="space-y-1">
                        {transaction.recipients.map((recipient) => (
                          <div key={recipient.id} className="flex items-center">
                            <span>{recipient.name}</span>
                            <span className="mx-2">-</span>
                            <span className="text-gray-400 dark:text-gray-500">
                              {formatCurrency(recipient.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      transaction.recipient || "N/A"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    <span
                      className={
                        transaction.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <BulkWagePaymentModal
        isOpen={showBulkPaymentModal}
        onClose={() => setShowBulkPaymentModal(false)}
        onSubmit={handleBulkPaymentSubmit}
        employees={employees}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handlePaymentSubmit}
        isLoading={isLoading}
        projects={projects}
        employees={employees}
        supplies={supplies}
        contractors={contractors}
      />
    </div>
  );
};

export default Payments;
