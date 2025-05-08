import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const DailyReportModal = ({ isOpen, onClose, onSubmit, projects = [], initialData = {}, loading }) => {
  const [projectId, setProjectId] = useState(initialData.projectId || '');
  const [date, setDate] = useState(initialData.date || new Date().toISOString().slice(0, 10));
  const [text, setText] = useState(initialData.text || '');

  useEffect(() => {
    if (isOpen) {
      setProjectId(initialData.projectId || '');
      setDate(initialData.date || new Date().toISOString().slice(0, 10));
      setText(initialData.text || '');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!projectId) {
      alert('Please select a project');
      return;
    }
    
    if (!text.trim()) {
      alert('Please enter a report');
      return;
    }
    
    // Call the parent's onSubmit
    onSubmit({ projectId, date, text });
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xl">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {initialData._id ? 'Edit Daily Report' : 'Add Daily Report'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Project</label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Report</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={5}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Write your daily report here..."
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initialData._id ? 'Update Report' : 'Create Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyReportModal;