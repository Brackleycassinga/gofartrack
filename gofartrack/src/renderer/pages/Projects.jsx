import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { employeeApi, projectApi } from "../services/api";
import ProjectModal from "../components/modals/ProjectModal";

const Projects = ({ projects: initialProjects = [], currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]); // Initialize with empty array instead of props
  const [projectToEdit, setProjectToEdit] = useState(null);
  const isAdmin = currentUser?.user?.role === "admin";

  // Function to fetch projects directly from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data when component mounts
    fetchProjects();
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const response = await employeeApi.getAll();
      const supervisorsList = response.data.filter(
        (emp) => emp.role === "Supervisor" || emp.role === "Manager"
      );
      setSupervisors(supervisorsList);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  const handleProjectSubmit = async (projectData) => {
    try {
      setLoading(true);
      let response;

      if (projectToEdit) {
        // Update existing project
        response = await projectApi.update(projectToEdit._id, projectData);
        setProjects((prev) =>
          prev.map((p) => (p._id === projectToEdit._id ? response.data : p))
        );
      } else {
        // Create new project
        response = await projectApi.create(projectData);
        setProjects((prev) => [...prev, response.data]);
      }

      setShowModal(false);
      setProjectToEdit(null);

      // Fetch fresh data to ensure we have the latest
      await fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      alert(error.response?.data?.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = (project) => {
    setProjectToEdit(project);
    setShowModal(true);
  };

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your construction projects and sites
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setProjectToEdit(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            {/* Project Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex-shrink-0">
                    <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 break-words">
                      {project.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === "Completed" 
                          ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                          : project.status === "On Hold"
                          ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                          : "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400"
                      }`}>
                        {project.status || "In Progress"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {project.location || "No location"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditProject(project)}
                    className="p-1.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      // Implement delete functionality
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="p-6 space-y-4">
              {/* Timeline */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>Start: {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>End: {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"}</span>
                </div>
              </div>

              {/* Budget */}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                <span>Budget: {project.budget ? new Intl.NumberFormat("rw-RW", {
                  style: "currency",
                  currency: "RWF",
                }).format(project.budget) : "Not set"}</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-gray-500 dark:text-gray-400">{project.progress || 0}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Project Description */}
              {project.description && (
                <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {project.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ProjectModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setProjectToEdit(null);
        }}
        onSubmit={handleProjectSubmit}
        supervisors={supervisors}
        initialData={projectToEdit}
        loading={loading}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Projects;
