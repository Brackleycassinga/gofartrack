import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  ShoppingBagIcon,
  TruckIcon,
  TagIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { supplierApi } from "../services/api";
import SupplierModal from "../components/modals/SupplierModal";

// Add currentUser prop to the component
const Suppliers = ({ currentUser }) => {
  // Add check for admin role
  const isAdmin = currentUser?.user?.role === "admin";

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // This correctly fetches data when the component mounts
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierApi.getAll();
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      if (selectedSupplier) {
        await supplierApi.update(selectedSupplier._id, formData);
      } else {
        await supplierApi.create(formData);
      }
      setShowModal(false);
      setSelectedSupplier(null);
      await fetchSuppliers();
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert(error.response?.data?.message || "Failed to save supplier");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading suppliers...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your suppliers and their information
          </p>
        </div>
        {/* Conditionally render the New Supplier button based on admin role */}
        {isAdmin && (
          <button
            onClick={() => {
              setSelectedSupplier(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Supplier
          </button>
        )}
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <div
            key={supplier._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {supplier.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      supplier.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {supplier.status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                {/* You might also want to conditionally render the Edit button */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setShowModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => {
                      // Implement delete functionality
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <PhoneIcon className="w-4 h-4 mr-2" />
                {supplier.phone}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                {supplier.email}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPinIcon className="w-4 h-4 mr-2" />
                {supplier.address}
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  supplier.status === "active"
                    ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                }`}
              >
                {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <SupplierModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSupplier(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedSupplier}
      />
    </div>
  );
};

export default Suppliers;
