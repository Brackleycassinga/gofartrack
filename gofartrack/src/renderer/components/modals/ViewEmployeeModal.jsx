import React from "react";
import {
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const ViewEmployeeModal = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  const StatusBadge = ({ present }) => (
    <span
      className={`px-2 py-1 text-xs rounded-full ${
        present ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {present ? "Present" : "Absent"}
    </span>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Employee Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Header with basic info */}
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {employee.name}
              </h2>
              <p className="text-gray-500">{employee.position}</p>
            </div>
            <StatusBadge present={employee.present} />
          </div>

          {/* Main details grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <DetailItem icon={PhoneIcon} label="Phone" value={employee.phone} />
            <DetailItem
              icon={IdentificationIcon}
              label="National ID"
              value={employee.nationalId}
            />
            <DetailItem icon={MapPinIcon} label="Site" value={employee.site} />
            <DetailItem
              icon={CalendarDaysIcon}
              label="Start Date"
              value={new Date(employee.startDate).toLocaleDateString()}
            />
            <DetailItem
              icon={CurrencyDollarIcon}
              label="Pay Rate"
              value={`${employee.payRate} RWF/hour`}
            />
            <DetailItem
              icon={CheckCircleIcon}
              label="Status"
              value={employee.status}
            />
          </div>

          {/* Address */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Address</h4>
            <p className="text-gray-600">{employee.address}</p>
          </div>

          {/* Footer actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center">
    <Icon className="w-5 h-5 text-gray-400 mr-2" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

export default ViewEmployeeModal;
