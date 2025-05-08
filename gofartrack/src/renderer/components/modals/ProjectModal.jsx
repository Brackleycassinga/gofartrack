import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  supervisors = [],
  initialData = null,
  loading = false,
  currentUser,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    startDate: "",
    endDate: "",
    budget: "",
    description: "",
    supervisor: "",
    status: "Not Started",
    progress: 0,
  });

  const hasSupervisors = Array.isArray(supervisors) && supervisors.length > 0;
  const isAdmin = currentUser?.user?.role === "admin";

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate supervisor
    if (!formData.supervisor) {
      alert("Please select a supervisor");
      return;
    }

    // Create project data with initial site
    const projectData = {
      ...formData,
      budget: parseFloat(formData.budget) || 0,
      progress: parseInt(formData.progress) || 0,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };

    try {
      await onSubmit(projectData);
      setFormData({
        name: "",
        location: "",
        startDate: "",
        endDate: "",
        budget: "",
        description: "",
        supervisor: "",
        status: "Not Started",
        progress: 0,
      });
    } catch (error) {
      console.error("Modal error:", error);
    }
  };
  console.log("PROJECT MODAL Current user:", currentUser);
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? "Edit Project" : "Create New Project"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Project Details */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            {/* Supervisor Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Project Supervisor *
              </label>
              <select
                required
                value={formData.supervisor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    supervisor: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select Supervisor</option>
                {supervisors.map((sup) => (
                  <option key={sup._id} value={sup._id}>
                    {sup.name} ({sup.position})
                  </option>
                ))}
              </select>
              {supervisors.length === 0 && (
                <p className="mt-1 text-xs text-red-500">
                  No supervisors available. Please create a supervisor first.
                </p>
              )}
            </div>

            {/* Other fields remain the same */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Budget (RWF)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, budget: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="Not Started">Not Started</option>
                <option value="On Track">On Track</option>
                <option value="Delayed">Delayed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows="3"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            {isAdmin && (
              <button
                type="submit"
                disabled={!formData.supervisor || supervisors.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading
                  ? "Creating..."
                  : initialData
                  ? "Update Project"
                  : "Create Project"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
