import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  UserCircleIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import EmployeeModal from "../components/modals/EmployeeModal";
import { projectApi, employeeApi } from "../services/api";

const Employees = ({
  employees: initialEmployees,
  handleEmployeeClick,
  currentUser,
}) => {
  const isAdmin = currentUser?.user?.role === "admin";

  // Ensure employees is always an array
  const [employees, setEmployees] = useState([]); // Initialize as empty array
  
  // Move sites state declaration here, before it's used
  const [sites, setSites] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [displayedEmployees, setDisplayedEmployees] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [projects, setProjects] = useState([]);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  // Filter state
  const [filters, setFilters] = useState({
    name: '',
    position: '',
    site: '',
    status: '',
  });

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesName = emp.name?.toLowerCase().includes(filters.name.toLowerCase());
    const matchesPosition = filters.position ? emp.position === filters.position : true;
    const matchesSite = filters.site ? emp.site === filters.site : true;
    const matchesStatus = filters.status ? (filters.status === 'present' ? emp.present : !emp.present) : true;
    return matchesName && matchesPosition && matchesSite && matchesStatus;
  });

  // Unique positions and sites for dropdowns
  const uniquePositions = Array.from(new Set(employees.map(emp => emp.position).filter(Boolean)));
  // Unique sites for dropdowns (use site names)
  const siteIdToName = Object.fromEntries(sites.map(site => [site._id, site.name]));
  const uniqueSites = Array.from(new Set(employees.map(emp => emp.site).filter(Boolean)));

  // Fetch both employees and projects when component mounts
  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, []); // Empty dependency array - runs once on mount

  useEffect(() => {
    if (!employees.length) {
      setDisplayedEmployees([]);
      setTotalPages(1);
      return;
    }

    // Calculate total pages
    const calculatedTotalPages = Math.ceil(employees.length / itemsPerPage);
    setTotalPages(calculatedTotalPages);

    // Get current employees for display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);
    setDisplayedEmployees(currentEmployees);
  }, [employees, currentPage, itemsPerPage]);

  const fetchProjects = async () => {
    try {
      const response = await projectApi.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Function to refresh employees list
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await employeeApi.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to load employees. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page changes
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleAddEmployee = () => {
    setShowAddEmployeeModal(true);
  };

  // Employee submission handler
  const handleEmployeeSubmit = async (formData) => {
    try {
      setIsLoading(true);

      // Call the API to create the employee
      const response = await employeeApi.create(formData);

      // Add the new employee to the state
      setEmployees((prevEmployees) => [...prevEmployees, response.data]);

      // Close the modal
      setShowAddEmployeeModal(false);

      // Show success message
      alert("Employee created successfully!");

      // Refresh the employee list to ensure everything is up to date
      await fetchEmployees();
    } catch (error) {
      console.error("Error submitting employee:", error);
      alert(error.response?.data?.message || "Failed to create employee");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all sites on mount
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await projectApi.getSites();
        setSites(response.data || []);
      } catch (error) {
        console.error("Error fetching sites:", error);
      }
    };
    fetchSites();
  }, []);

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your workforce and track attendance
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleAddEmployee}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Employee
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by name"
            value={filters.name}
            onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={filters.position}
            onChange={e => setFilters(f => ({ ...f, position: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Positions</option>
            {uniquePositions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
          <select
            value={filters.site}
            onChange={e => setFilters(f => ({ ...f, site: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Sites</option>
            {sites.map((site) => (
              <option key={site._id} value={site._id}>{site.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Site</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pay Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{employee.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{employee.position || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{employee.phone || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{employee.site ? (siteIdToName[employee.site] || employee.site) : "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{employee.payRate ? new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF' }).format(employee.payRate) : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.present ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'}`}>{employee.present ? 'Present' : 'Absent'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleEmployeeClick(employee)} className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"><PencilIcon className="w-5 h-5" /></button>
                  <button onClick={() => {}} className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"><TrashIcon className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {filteredEmployees.length > itemsPerPage && (
        <div className="flex flex-col items-center justify-center mt-6 text-sm">
          <div className="flex items-center mb-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex space-x-1 mx-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index + 1)}
                  className={`px-3 py-1 rounded-md ${currentPage === index + 1 ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Page {currentPage} of {totalPages} | Showing {Math.min(filteredEmployees.length, (currentPage - 1) * itemsPerPage + 1)}-
            {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
          </div>
        </div>
      )}

      <EmployeeModal
        isOpen={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        onSubmit={handleEmployeeSubmit}
        projects={projects}
      />
    </div>
  );
};

export default Employees;