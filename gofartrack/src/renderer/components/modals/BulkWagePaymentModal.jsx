import React, { useState, useEffect } from "react";
import { CalendarIcon, UserGroupIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import Modal from "./Modal";

const BulkWagePaymentModal = ({ isOpen, onClose, onSubmit, employees }) => {
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    paymentType: "all", // all, category, position, individual
    category: "",
    position: "",
    employeeId: "",
    amount: "",
    description: "",
    paymentMethod: "cash",
    reference: ""
  });

  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const categories = [...new Set(employees.map(emp => emp.category))];
  const positions = [...new Set(employees.map(emp => emp.position))];

  useEffect(() => {
    let filtered = [...employees];
    
    if (formData.paymentType === 'category' && formData.category) {
      filtered = filtered.filter(emp => emp.category === formData.category);
    } else if (formData.paymentType === 'position' && formData.position) {
      filtered = filtered.filter(emp => emp.position === formData.position);
    } else if (formData.paymentType === 'individual' && formData.employeeId) {
      filtered = filtered.filter(emp => emp._id === formData.employeeId);
    }

    setFilteredEmployees(filtered);
    
    // Calculate total amount based on filtered employees
    const total = filtered.reduce((sum, emp) => sum + (emp.payRate || 0), 0);
    setTotalAmount(total);
  }, [formData.paymentType, formData.category, formData.position, formData.employeeId, employees]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const paymentData = {
      type: "expense",
      category: "wages",
      date: formData.paymentDate,
      amount: totalAmount,
      description: formData.description || `Wage payment for ${formData.paymentType}`,
      paymentMethod: formData.paymentMethod,
      reference: formData.reference,
      recipients: filteredEmployees.map(emp => ({
        id: emp._id,
        name: emp.name,
        amount: emp.payRate
      }))
    };

    onSubmit(paymentData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Wage Payment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <CalendarIcon className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type
            </label>
            <select
              value={formData.paymentType}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Employees</option>
              <option value="category">By Category</option>
              <option value="position">By Position</option>
              <option value="individual">Individual</option>
            </select>
          </div>
        </div>

        {formData.paymentType === 'category' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.paymentType === 'position' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Position</option>
              {positions.map(position => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.paymentType === 'individual' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Employee</option>
              {employees.map(employee => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} - {employee.position}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
            <option value="mobile">Mobile Money</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional payment description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference Number
          </label>
          <input
            type="text"
            value={formData.reference}
            onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional reference number"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredEmployees.length} employees selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-500" />
              <span className="text-lg font-semibold text-gray-900">
                Total: {new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF' }).format(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Process Payment
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BulkWagePaymentModal; 