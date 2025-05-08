import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ContractorModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  projects = [],
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    specialization: "",
    tin: "",
    address: "",
    rate: "",
    license: "",
    availability: "available",
    project: "",
    status: "active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        rate: initialData.rate?.toString() || "",
        project: initialData.project?._id || initialData.project || "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      rate: parseFloat(formData.rate),
    });
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
            {initialData ? "Edit Contractor" : "Add New Contractor"}
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
            {/* Company/Contractor Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Company Name *
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

            {/* Contact Information */}
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
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            {/* Business Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                TIN Number *
              </label>
              <input
                type="text"
                required
                value={formData.tin}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tin: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                License Number *
              </label>
              <input
                type="text"
                required
                value={formData.license}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, license: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            {/* Specialization and Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Specialization *
              </label>
              <select
                required
                value={formData.specialization}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specialization: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select Specialization</option>
                <option value="General Construction">
                  General Construction
                </option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="HVAC">HVAC</option>
                <option value="Masonry">Masonry</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Roofing">Roofing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Daily Rate (RWF) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.rate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rate: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            {/* Address */}
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

            {/* Status and Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Availability
              </label>
              <select
                value={formData.availability}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    availability: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="available">Available</option>
                <option value="engaged">Engaged</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {initialData ? "Update Contractor" : "Add Contractor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractorModal;
