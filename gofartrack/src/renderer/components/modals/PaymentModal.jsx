import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { paymentApi, projectApi } from "../../services/api";

const PaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  projects = [],
  employees = [],
  supplies = [],
  contractors = [],
}) => {
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    recipient: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    category: "wages",
    reference: "",
    status: "completed",
  });

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [recipientType, setRecipientType] = useState("employee");
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [error, setError] = useState("");
  const [availableSites, setAvailableSites] = useState([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allSites, setAllSites] = useState([]);
  const [loadingAllSites, setLoadingAllSites] = useState(false);

  // Debug: Log projects when component mounts or projects change
  useEffect(() => {
    console.log("Projects received:", projects);
  }, [projects]);

  // Load ALL sites when component mounts or is opened
  useEffect(() => {
    if (isOpen) {
      loadAllSites();
    }
  }, [isOpen]);

  // Function to load all sites from database regardless of project
  const loadAllSites = async () => {
    setLoadingAllSites(true);
    setError("");

    try {
      // Try to get all sites from API
      const response = await projectApi.getAllSites();
      console.log("All sites loaded:", response.data);
      setAllSites(response.data || []);
    } catch (err) {
      console.error("Error fetching all sites:", err);
      setError("Failed to load sites. Please check your connection.");
      setAllSites([]);
    } finally {
      setLoadingAllSites(false);
    }
  };

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: "expense",
        amount: "",
        recipient: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        category: "wages",
        reference: "",
        status: "completed",
      });
      setSelectedProject("");
      setSelectedSite("");
      setRecipientType("employee");
      setError("");
      setSubmitting(false);
    }
  }, [isOpen]);

  // Update recipient options based on selected project, site, and recipient type
  useEffect(() => {
    // For contractors and suppliers, we can list all regardless of site selection
    if (recipientType === "contractor") {
      // List all contractors regardless of site/project assignment
      const options = contractors.map((c) => ({
        id: c.id || c._id,
        name: c.name || c.firstName + " " + c.lastName,
        position: c.speciality || c.role || "",
      }));
      setFormData((prev) => ({ ...prev, category: "contract" }));
      setRecipientOptions(options);
      return;
    }

    if (recipientType === "supplier") {
      // List all suppliers regardless of site/project assignment
      const options = supplies.map((s) => ({
        id: s.id || s._id,
        name: s.name,
        description: s.description || s.quantity ? `(${s.quantity})` : "",
        position: s.description || s.quantity ? `${s.quantity} units` : "",
      }));
      setFormData((prev) => ({ ...prev, category: "supplies" }));
      setRecipientOptions(options);
      return;
    }

    // For employees, we still require both project and site
    if (!selectedProject || !selectedSite) {
      setRecipientOptions([]);
      return;
    }

    // Only employees reach this point
    const options = employees.filter(
      (emp) => emp.site === selectedSite || emp.project === selectedProject
    );
    setFormData((prev) => ({ ...prev, category: "wages" }));
    setRecipientOptions(options);
  }, [
    selectedProject,
    selectedSite,
    recipientType,
    employees,
    contractors,
    supplies,
  ]);

  // Modified project selection handler that also updates available sites
  const handleProjectSelect = async (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    setSelectedSite("");

    // If no project is selected, use all sites
    if (!projectId) {
      setAvailableSites(allSites);
      return;
    }

    setSitesLoading(true);
    setError("");

    try {
      // First try to get sites by project
      const response = await projectApi.getSitesByProject(projectId);

      if (response.data && response.data.length > 0) {
        setAvailableSites(response.data);
      } else {
        // If no sites found by project, use all sites
        console.log("No sites found for project, using all sites");
        setAvailableSites(allSites);
      }
    } catch (err) {
      console.error("Error fetching sites by project:", err);
      // On error, fall back to all sites
      setAvailableSites(allSites);
    } finally {
      setSitesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecipientSelect = (e) => {
    const recipientId = e.target.value;
    let recipient = "";

    if (recipientId) {
      const selected = recipientOptions.find(
        (option) => (option.id || option._id) === recipientId
      );

      if (selected) {
        recipient = selected.name;

        // Set appropriate description based on recipient type
        let description = "";
        switch (recipientType) {
          case "employee":
            description = `Wages for ${selected.name} at ${selectedSite}`;
            break;
          case "contractor":
            description = `Contract payment to ${selected.name} for ${selectedSite}`;
            break;
          case "supplier":
            description = `Supply payment for ${selected.name}`;
            break;
        }

        setFormData((prev) => ({
          ...prev,
          recipient,
          description,
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, recipient: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (submitting) return;

    // Set submitting state to true
    setSubmitting(true);

    try {
      if (!formData.amount || Number(formData.amount) <= 0) {
        setError("Please enter a valid amount.");
        setSubmitting(false);
        return;
      }

      const paymentData = {
        ...formData,
        amount: Number(formData.amount),
        projectReference: selectedProject,
        siteReference: selectedSite,
        recipientType: recipientType,
      };

      // Let the parent component handle the API call
      if (onSubmit) {
        await onSubmit(paymentData);
      }

      onClose();
    } catch (error) {
      console.error("Error creating payment:", error);
      setError(error.response?.data?.message || "Failed to create payment");
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">New Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={submitting}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Debug info - Comment out in production */}
          {projects.length === 0 && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              No projects available. Please check that projects are being loaded
              correctly.
            </div>
          )}

          {/* Display debug info about projects if present */}
          {projects.length > 0 && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {projects.length} projects available.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="expense"
                    checked={formData.type === "expense"}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Expense</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="income"
                    checked={formData.type === "income"}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Income</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (RWF)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                value={selectedProject}
                onChange={handleProjectSelect}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Project</option>
                {Array.isArray(projects) &&
                  projects.map((project) => (
                    <option
                      key={project._id || project.id}
                      value={project._id || project.id}
                    >
                      {project.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site
              </label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={sitesLoading || loadingAllSites}
                required
              >
                <option value="">
                  {sitesLoading || loadingAllSites
                    ? "Loading sites..."
                    : "Select Site"}
                </option>
                {/* Always try to show all available sites */}
                {(availableSites.length > 0 ? availableSites : allSites).map(
                  (site) => (
                    <option
                      key={site._id || site.id}
                      value={site._id || site.id}
                    >
                      {site.name}
                    </option>
                  )
                )}
              </select>
              {selectedProject &&
                !sitesLoading &&
                !loadingAllSites &&
                availableSites.length === 0 &&
                allSites.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">
                    No sites found. Please add sites first.
                  </p>
                )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Type
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="recipientType"
                  value="employee"
                  checked={recipientType === "employee"}
                  onChange={() => setRecipientType("employee")}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Employee</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="recipientType"
                  value="contractor"
                  checked={recipientType === "contractor"}
                  onChange={() => setRecipientType("contractor")}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Contractor</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="recipientType"
                  value="supplier"
                  checked={recipientType === "supplier"}
                  onChange={() => setRecipientType("supplier")}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Supplier</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient
            </label>
            <select
              onChange={handleRecipientSelect}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={
                (recipientType === "employee" &&
                  (!selectedSite || recipientOptions.length === 0)) ||
                ((recipientType === "contractor" ||
                  recipientType === "supplier") &&
                  recipientOptions.length === 0)
              }
              required
            >
              <option value="">Select Recipient</option>
              {recipientOptions.map((option) => (
                <option
                  key={option._id || option.id}
                  value={option._id || option.id}
                >
                  {option.name} {option.position ? `(${option.position})` : ""}
                </option>
              ))}
            </select>
            {recipientOptions.length === 0 && (
              <p className="mt-1 text-sm text-red-500">
                {recipientType === "employee" && selectedSite
                  ? `No employees found for the selected site. Please add employees to this site first.`
                  : recipientType === "contractor"
                  ? "No contractors found. Please add contractors first."
                  : recipientType === "supplier"
                  ? "No suppliers found. Please add suppliers first."
                  : recipientType === "employee"
                  ? "Please select a project and site first."
                  : ""}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="mobile">Mobile Money</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Payment details"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Invoice or reference #"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || submitting}
            >
              {submitting || isLoading ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
