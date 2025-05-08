import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, CalendarIcon, BuildingOfficeIcon, TrashIcon, PencilIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { projectApi, reportApi } from '../services/api';
import DailyReportModal from '../components/modals/DailyReportModal';

const Reports = ({ currentUser }) => {
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Filter states
  const [filterDate, setFilterDate] = useState('');
  const [filterProject, setFilterProject] = useState('');
  
  // Fetch projects and reports on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const projectsResponse = await projectApi.getAll();
        setProjects(projectsResponse.data || []);
        await fetchReports();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Function to refresh reports list
  const fetchReports = async () => {
    try {
      const response = await reportApi.getAll();
      console.log('Reports fetched:', response.data);
      setReports(response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };
  
  // Apply filters
  const filteredReports = reports.filter(report => {
    const matchesDate = filterDate ? report.date?.includes(filterDate) : true;
    const matchesProject = filterProject ? report.projectId === filterProject : true;
    return matchesDate && matchesProject;
  });
  
  // Handle modal open for adding new report
  const handleAddReport = () => {
    setSelectedReport(null);
    setShowModal(true);
  };
  
  // Handle edit report
  const handleEditReport = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };
  
  // Handle delete report
  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        setLoading(true);
        await reportApi.delete(reportId);
        await fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Handle report submission from modal
  const handleReportSubmit = async (reportData) => {
    try {
      setLoading(true);
      
      // Log the data being submitted for debugging
      console.log('Submitting report data:', reportData);
      
      if (selectedReport?._id) {
        await reportApi.update(selectedReport._id, reportData);
        alert('Report updated successfully!');
      } else {
        await reportApi.create(reportData);
        alert('Report created successfully!');
      }
      
      setShowModal(false);
      await fetchReports();
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Failed to save report. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header with add button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Reports</h1>
        </div>
        <button
          onClick={handleAddReport}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
        >
          + Add Daily Report
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-2">
          <FunnelIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Filter Reports</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Project</label>
            <select
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Reports Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Report</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading && reports.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Loading reports...</td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No reports found.</td>
              </tr>
            ) : (
              filteredReports.map(report => (
                <tr key={report._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(report.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {projects.find(p => p._id === report.projectId)?.name || 'Unknown Project'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    <div className="max-w-xs overflow-hidden text-ellipsis">
                      {report.text.length > 100 ? `${report.text.substring(0, 100)}...` : report.text}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleEditReport(report)} 
                      className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteReport(report._id)} 
                      className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Daily Report Modal */}
      <DailyReportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleReportSubmit}
        projects={projects}
        initialData={selectedReport || {}}
        loading={loading}
      />
    </div>
  );
};

export default Reports;