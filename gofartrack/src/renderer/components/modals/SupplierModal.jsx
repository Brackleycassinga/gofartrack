import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const SupplierModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    category: "",
    products: "",
    tin: "",
    website: "",
    status: "active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? "Edit Supplier" : "New Supplier"}
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
                Company Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                TIN Number
              </label>
              <input
                type="text"
                value={formData.tin}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tin: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select Category</option>
                <option value="Building Materials">Building Materials</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Tools">Tools & Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Products/Services
              </label>
              <textarea
                value={formData.products}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, products: e.target.value }))
                }
                rows="2"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Website (optional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="https://"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {initialData ? "Save Changes" : "Add Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
