import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const SiteModal = ({
  isOpen,
  onClose,
  onSubmit,
  projects = [],
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    project: "",
    status: "Active",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        project: initialData.project?._id || initialData.project,
      });
    } else {
      // Reset form when opening for a new site
      setFormData({
        name: "",
        location: "",
        project: "",
        status: "Active",
        description: "",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Additional validation
    if (!formData.name || !formData.location || !formData.project) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Log for debugging
    console.log("Submitting form data:", formData);

    try {
      // Clean up any extra fields that might cause issues
      const cleanedData = {
        name: formData.name,
        location: formData.location,
        project: formData.project,
        status: formData.status,
        description: formData.description || "",
      };

      console.log("Cleaned form data:", cleanedData);
      await onSubmit(cleanedData);
      // If we reach here, submission was successful
    } catch (error) {
      console.error("Form submission error:", error);
      // Error is handled in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? "Edit Site" : "New Construction Site"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Site Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Location*
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project*
              </label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
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
                onChange={handleChange}
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
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : initialData
                ? "Save Changes"
                : "Create Site"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteModal;
