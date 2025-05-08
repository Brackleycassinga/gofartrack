import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { projectApi } from "../../services/api";

const EMPLOYEE_CATEGORIES = [
  { id: 'skilled', label: 'Skilled Workers' },
  { id: 'unskilled', label: 'Unskilled Workers' },
  { id: 'supervisor', label: 'Supervisors' },
  { id: 'specialist', label: 'Specialists' }
];

const EMPLOYEE_POSITIONS = {
  skilled: [
    'Electrician',
    'Plumber',
    'Carpenter',
    'Mason',
    'Welder',
    'Heavy Equipment Operator',
    'HVAC Technician',
    'Painter',
    'Roofer',
    'Steel Worker'
  ],
  unskilled: [
    'General Laborer',
    'Construction Helper',
    'Site Cleaner',
    'Material Handler',
    'Demolition Worker'
  ],
  supervisor: [
    'Site Supervisor',
    'Project Manager',
    'Foreman',
    'Safety Officer',
    'Quality Control Inspector'
  ],
  specialist: [
    'Architect',
    'Civil Engineer',
    'Structural Engineer',
    'Surveyor',
    'Environmental Specialist',
    'Safety Specialist'
  ]
};

const EmployeeModal = ({ isOpen, onClose, onSubmit, projects = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    nationalId: "",
    category: "",
    position: "",
    site: "",
    payRate: "",
    startDate: new Date().toISOString().split("T")[0],
    address: "",
    status: "active",
    hours: 0,
    present: true,
    project: "",
  });

  const [sites, setSites] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  // Fetch sites when project is selected
  const fetchSites = async (projectId) => {
    try {
      console.log("Fetching sites for project:", projectId);
      const response = await projectApi.getSitesByProject(projectId);
      console.log("Sites response:", response.data);
      setSites(response.data || []);
    } catch (error) {
      console.error("Error fetching sites:", error);
      setSites([]);
    }
  };

  // Handle project selection with immediate site fetch
  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    console.log("Selected project:", projectId);
    setSelectedProject(projectId);
    setFormData((prev) => ({ ...prev, project: projectId, site: "" }));
    if (projectId) {
      fetchSites(projectId);
    } else {
      setSites([]);
    }
  };

  // Add useEffect to load sites when modal opens with a selected project
  useEffect(() => {
    if (selectedProject) {
      fetchSites(selectedProject);
    }
  }, [selectedProject]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      category,
      position: '' // Reset position when category changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format the data for backend
      const employeeData = {
        ...formData,
        payRate: parseFloat(formData.payRate),
        startDate: new Date(formData.startDate).toISOString(),
        // Only include project/site if they're selected
        project: formData.project || undefined,
        site: formData.site || undefined,
      };

      await onSubmit(employeeData);
      // Reset form and close modal on success
      setFormData({
        name: "",
        phone: "",
        nationalId: "",
        category: "",
        position: "",
        site: "",
        payRate: "",
        startDate: new Date().toISOString().split("T")[0],
        address: "",
        status: "active",
        hours: 0,
        present: true,
        project: "",
      });
      onClose();
    } catch (error) {
      console.error("Error saving employee:", error);
      alert(error.response?.data?.message || "Failed to save employee");
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Add New Employee
          </h3>
          <button onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Required Fields */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                National ID *
              </label>
              <input
                type="text"
                required
                value={formData.nationalId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    nationalId: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            {/* Category and Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {EMPLOYEE_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, position: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!formData.category}
              >
                <option value="">Select Position</option>
                {formData.category && EMPLOYEE_POSITIONS[formData.category].map(position => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            {/* Pay Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pay Rate (RWF/Day) *
              </label>
              <input
                type="number"
                required
                value={formData.payRate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, payRate: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows="2"
              />
            </div>

            {/* Optional Project/Site Selection - Only show if projects exist */}
            {projects.length > 0 && (
              <div className="col-span-2 border-t pt-4 mt-2">
                <p className="text-sm text-gray-500 mb-4">
                  Optional Assignment
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Project
                    </label>
                    <select
                      value={selectedProject}
                      onChange={handleProjectChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option value="">Select Project</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProject && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Site
                      </label>
                      <select
                        value={formData.site}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            site: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      >
                        <option value="">Select Site</option>
                        {sites.map((site) => (
                          <option key={site._id} value={site._id}>
                            {site.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Save Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
