import React, { useState, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import MenuBar from "./components/layout/MenuBar";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Projects from "./pages/Projects";
import Payments from "./pages/Payments";
import Suppliers from "./pages/Suppliers";
import Contractors from "./pages/Contractors";
import Settings from "./pages/Settings";
import Login from "./components/Login";
import Signup from "./components/Signup";
import {
  employeeApi,
  projectApi,
  paymentApi,
  supplierApi,
  contractorApi,
  authApi,
} from "./services/api";
import EmployeeModal from "./components/modals/EmployeeModal";
import ViewEmployeeModal from "./components/modals/ViewEmployeeModal";
import Sites from "./pages/Sites";
import { ThemeProvider } from './context/ThemeContext';
import Reports from "./pages/Reports";
console.log("App component loading...");

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [windowMode, setWindowMode] = useState("normal");
  const [menuOpen, setMenuOpen] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Add effect to check for existing auth
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // State for data from API
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [contractors, setContractors] = useState([]); // Add state for contractors

  // Other state variables remain the same
  const [newProject, setNewProject] = useState({
    name: "",
    location: "",
    startDate: "",
    endDate: "",
    budget: "",
    description: "",
    supervisor: "",
  });

  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);

  const [paymentType, setPaymentType] = useState("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    type: "",
    amount: "",
    recipient: "",
    description: "",
    date: "",
    paymentMethod: "",
    category: "",
    reference: "",
  });

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    category: "",
    products: "",
    tin: "",
    website: "",
  });

  const [showContractorModal, setShowContractorModal] = useState(false);
  const [newContractor, setNewContractor] = useState({
    name: "",
    phone: "",
    email: "",
    tin: "",
    address: "",
    rate: "",
    availability: "available",
  });

  const [settings, setSettings] = useState({
    language: "en",
    notifications: true,
    backupEnabled: true,
    autoSync: true,
    darkMode: false,
    currency: "RWF",
    timeZone: "Africa/Kigali",
  });

  const [viewEmployeeModal, setViewEmployeeModal] = useState(false);

  const handleLogin = (userData) => {
    console.log("Login success:", userData);
    setIsAuthenticated(true);
    setCurrentUser(userData);
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleSignup = (userData) => {
    console.log("Signup success:", userData);
    setIsAuthenticated(true);
    setCurrentUser(userData);
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setViewEmployeeModal(true);
  };

  const closeModal = () => {
    setShowEmployeeModal(false);
  };

  const toggleFullscreen = () => {
    setWindowMode(windowMode === "normal" ? "fullscreen" : "normal");
  };

  const toggleMenu = (menu) => {
    setMenuOpen(menuOpen === menu ? null : menu);
  };

  const handleAddProject = () => {
    setShowProjectModal(true);
  };

  // Fetch functions for API data
  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectApi.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await paymentApi.getAll();
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchSupplies = async () => {
    try {
      const response = await supplierApi.getAll();
      setSupplies(response.data);
    } catch (error) {
      console.error("Error fetching supplies:", error);
    }
  };

  // Add function to fetch contractors
  const fetchContractors = async () => {
    try {
      const response = await contractorApi.getAll();
      setContractors(response.data);
    } catch (error) {
      console.error("Error fetching contractors:", error);
    }
  };

  // Other handlers remain the same
  const handleProjectSubmit = async (projectData) => {
    try {
      if (selectedProject) {
        await projectApi.update(selectedProject._id, projectData);
      } else {
        await projectApi.create(projectData);
      }
      setShowProjectModal(false);
      setSelectedProject(null);
      await fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      alert(
        error.response?.data?.message ||
          "Failed to save project. Make sure all fields are properly filled."
      );
    }
  };

  const handleAddEmployee = () => {
    setShowAddEmployeeModal(true);
  };

  const handleEmployeeSubmit = async (formData) => {
    try {
      console.log("Submitting employee data:", formData);

      // Validate payRate
      const payRate = parseFloat(formData.payRate);
      if (isNaN(payRate) || payRate <= 0) {
        alert("Please enter a valid pay rate");
        return;
      }

      // Validate site
      if (!formData.site) {
        alert("Please select a site");
        return;
      }

      // Ensure all required fields are present and properly formatted
      const employeeData = {
        name: formData.name,
        phone: formData.phone,
        nationalId: formData.nationalId,
        position: formData.position,
        site: formData.site,
        payRate: payRate,
        startDate: formData.startDate,
        address: formData.address,
        status: "active",
        hours: 0,
        present: true,
      };

      console.log("Submitting validated employee data:", employeeData);

      const response = await employeeApi.create(employeeData);

      if (response.data) {
        setEmployees((prevEmployees) => [...prevEmployees, response.data]);
        setShowAddEmployeeModal(false);
        alert("Employee added successfully!");
        await fetchEmployees();
      }
    } catch (error) {
      console.error("Error details:", error.response?.data || error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        let errorMessage = "Please fix the following issues:";

        if (errors.payRate) {
          errorMessage += "\n- Pay Rate: " + errors.payRate.message;
        }

        if (errors.site) {
          errorMessage += "\n- Site: " + errors.site.message;
        }

        alert(errorMessage);
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to create employee. Please check all required fields."
        );
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Fetching initial data...");
      fetchEmployees();
      fetchProjects();
      fetchTransactions();
      fetchSupplies();
      fetchContractors(); // Add fetch contractors call
    }
  }, [isAuthenticated]);

  const handleAddPayment = async () => {
    setShowPaymentModal(true);
    await fetchTransactions();
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      await paymentApi.create(paymentData);
      setShowPaymentModal(false);
      setNewPayment({
        type: "",
        amount: "",
        recipient: "",
        description: "",
        date: "",
        paymentMethod: "",
        category: "",
        reference: "",
      });
      await fetchTransactions();
    } catch (error) {
      console.error("Error saving payment:", error);
      alert("Failed to save payment. Please try again.");
    }
  };

  const handleAddSupplier = () => {
    setShowSupplierModal(true);
  };

  const handleSupplierSubmit = async (supplierData) => {
    try {
      await supplierApi.create(supplierData);
      setShowSupplierModal(false);
      setNewSupplier({
        name: "",
        phone: "",
        email: "",
        address: "",
        category: "",
        products: "",
        tin: "",
        website: "",
      });
      await fetchSupplies();
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert("Failed to save supplier. Please try again.");
    }
  };

  const handleAddContractor = () => {
    setShowContractorModal(true);
  };

  // Update the contractor submit function
  const handleContractorSubmit = async (contractorData) => {
    try {
      await contractorApi.create(contractorData);
      setShowContractorModal(false);
      setNewContractor({
        name: "",
        phone: "",
        email: "",
        specialization: "",
        license: "",
        tin: "",
        address: "",
        rate: "",
        availability: "available",
      });
      await fetchContractors();
    } catch (error) {
      console.error("Error saving contractor:", error);
      alert("Failed to save contractor. Please try again.");
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Calculate employee statistics
  const totalEmployees = employees.length;
  const presentEmployees = employees.filter((emp) => emp.present).length;
  const standardRateCount = employees.filter(
    (emp) => emp.payRate === 10
  ).length;
  const skilledRateCount = employees.filter((emp) => emp.payRate === 15).length;

  // Calculate total labor costs
  const totalLaborCost = employees.reduce((total, emp) => {
    return total + (emp.payRate || 0) * (emp.hours || 0);
  }, 0);

  // Debug data loading
  useEffect(() => {
    console.log("Current data state:", {
      employees,
      projects,
      transactions,
      supplies,
      contractors, // Log contractors
    });
  }, [employees, projects, transactions, supplies, contractors]); // Add contractors dependency

  // Add error logging for authentication
  useEffect(() => {
    console.log("Authentication state:", isAuthenticated);
  }, [isAuthenticated]);
  console.log("MAIN APP Current user:", currentUser);
  const renderContent = () => {
    console.log("Rendering content for tab:", activeTab);
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            projects={projects}
            employees={employees}
            transactions={transactions}
            supplies={supplies}
            tasks={[]}
            handleTabClick={handleTabClick}
            handleEmployeeClick={handleEmployeeClick}
            totalEmployees={employees.length}
            presentEmployees={employees.filter((emp) => emp.present).length}
            totalLaborCost={employees.reduce(
              (total, emp) => total + (emp.payRate || 0),
              0
            )}
            currentUser={currentUser}
          />
        );
      case "projects":
        return (
          <Projects
            projects={projects}
            handleAddProject={handleAddProject}
            currentUser={currentUser}
          />
        );
      case "employees":
        return (
          <Employees
            employees={employees}
            handleEmployeeClick={handleEmployeeClick}
            currentUser={currentUser}
          />
        );
      case "payments":
        return (
          <Payments
            transactions={transactions}
            handleAddPayment={handleAddPayment}
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            projects={projects}
            employees={employees}
            supplies={supplies}
            contractors={contractors}
            currentUser={currentUser}
          />
        );
      case "suppliers":
        return (
          <Suppliers
            supplies={supplies}
            handleAddSupplier={handleAddSupplier}
            currentUser={currentUser}
          />
        );
      case "contractors":
        return (
          <Contractors
            contractors={contractors}
            handleAddContractor={handleAddContractor}
            currentUser={currentUser}
          />
        );
      case "sites":
        return <Sites projects={projects} currentUser={currentUser} />;
      case "settings":
        return (
          <Settings
            settings={settings}
            handleSettingChange={handleSettingChange}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <Reports
            currentUser={currentUser}
          />
        );
    }
  };

  if (!isAuthenticated) {
    console.log("Rendering login screen...");
    return (
      <ThemeProvider>
        <ErrorBoundary>
          {showSignup ? (
            <Signup
              onSignup={handleLogin}
              switchToLogin={() => setShowSignup(false)}
            />
          ) : (
            <Login
              onLogin={handleLogin}
              switchToSignup={() => setShowSignup(true)}
            />
          )}
        </ErrorBoundary>
      </ThemeProvider>
    );
  }

  console.log("Rendering main app...");
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className={`h-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
          <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            <MenuBar
              menuOpen={menuOpen}
              toggleMenu={toggleMenu}
              toggleFullscreen={toggleFullscreen}
              onNewProject={handleAddProject}
              onNewEmployee={handleAddEmployee}
            />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar
                activeTab={activeTab}
                handleTabClick={handleTabClick}
                currentUser={currentUser}
                onLogout={handleLogout}
              />

              <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                <header className="h-14 flex items-center justify-between px-6 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
                  <h1 className="text-lg font-semibold text-gray-800">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      Welcome back, {currentUser?.user?.name || 'User'}
                    </div>
                  </div>
                </header>

                <div className="flex-1 overflow-auto p-6">
                  <div className="max-w-7xl mx-auto">
                    {renderContent()}
                  </div>
                </div>

                <div className="h-8 bg-white border-t border-gray-200 px-6 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
                  <div className="flex items-center space-x-4">
                    <span>Last synchronized: Today, 11:42 AM</span>
                    <span className="text-gray-300">|</span>
                    <span>v1.2.5</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>© 2025 Go Far Solutions</span>
                  </div>
                </div>
              </main>
            </div>

            <ViewEmployeeModal
              isOpen={viewEmployeeModal}
              onClose={() => setViewEmployeeModal(false)}
              employee={selectedEmployee}
            />

            <EmployeeModal
              isOpen={showAddEmployeeModal}
              onClose={() => setShowAddEmployeeModal(false)}
              onSubmit={handleEmployeeSubmit}
              projects={projects}
            />

            {/* Other modals can be added here */}
          </div>
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
