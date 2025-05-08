import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  BanknotesIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import ContractorModal from "../components/modals/ContractorModal";
import { contractorApi } from "../services/api";

// Add currentUser prop to the component
const Contractors = ({ currentUser }) => {
  // Add check for admin role
  const isAdmin = currentUser?.user?.role === "admin";

  const [showModal, setShowModal] = useState(false);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractor, setSelectedContractor] = useState(null);

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const response = await contractorApi.getAll();
      setContractors(response.data);
    } catch (error) {
      console.error("Error fetching contractors:", error);
      alert("Failed to load contractors");
    } finally {
      setLoading(false);
    }
  };

  const handleContractorSubmit = async (formData) => {
    try {
      console.log("Contractor data:", formData);
      const response = await contractorApi.create(formData);
      console.log("Contractor created:", response.data);
      setShowModal(false);
      fetchContractors();
    } catch (error) {
      console.error("Error saving contractor:", error);
      alert(error.response?.data?.message || "Failed to save contractor");
    }
  };

  const handleEditContractor = (contractor) => {
    setSelectedContractor(contractor);
    setShowModal(true);
  };

  const handleDeleteContractor = async (id) => {
    if (window.confirm("Are you sure you want to delete this contractor?")) {
      try {
        await contractorApi.delete(id);
        fetchContractors();
      } catch (error) {
        console.error("Error deleting contractor:", error);
        alert("Failed to delete contractor");
      }
    }
  };

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contractors</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your contractors and their teams
          </p>
        </div>
        {/* Conditionally render the Add Contractor button based on admin role */}
        {isAdmin && (
          <button
            onClick={() => {
              setSelectedContractor(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Contractor
          </button>
        )}
      </div>

      {/* Contractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contractors.map((contractor) => (
          <div
            key={contractor._id || contractor.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <UserGroupIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {contractor.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {contractor.specialization}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditContractor(contractor)}
                  className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteContractor(contractor._id || contractor.id)}
                  className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <PhoneIcon className="w-4 h-4 mr-2" />
                {contractor.phone}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                {contractor.email}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPinIcon className="w-4 h-4 mr-2" />
                {contractor.address}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                {contractor.currentProject || "No active project"}
              </div>
            </div>

            {/* Team Size Badge */}
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                Team Size: {contractor.teamSize}
              </span>
            </div>
          </div>
        ))}
      </div>

      <ContractorModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedContractor(null);
        }}
        onSubmit={handleContractorSubmit}
        initialData={selectedContractor}
      />
    </div>
  );
};

export default Contractors;
