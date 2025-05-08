import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  MapPinIcon,
  UserIcon,
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { projectApi } from "../services/api";
import SiteModal from "../components/modals/SiteModal";

const Sites = ({ currentUser }) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [projects, setProjects] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const isAdmin = currentUser?.user?.role === "admin";

  const fetchSites = async () => {
    try {
      setLoading(true);

      // First, fetch all projects to get project names
      const projectResponse = await projectApi.getAll();
      const projectsData = projectResponse.data;
      setProjects(projectsData);

      console.log("Projects data:", projectsData);

      // Create a map of project IDs to names for easy lookup
      const projectMap = {};
      projectsData.forEach((project) => {
        projectMap[project._id] = project.name;
      });

      // Fetch all sites directly from the top-level site endpoint
      const sitesResponse = await projectApi.getSites();
      console.log("Sites response:", sitesResponse);

      if (sitesResponse.data && Array.isArray(sitesResponse.data)) {
        // Add project name to each site
        const sitesWithProjectNames = sitesResponse.data.map((site) => ({
          ...site,
          projectName:
            site.project?.name || projectMap[site.project] || "Unknown Project",
        }));

        console.log("Sites with project names:", sitesWithProjectNames);
        setSites(sitesWithProjectNames);
      } else {
        console.warn("Unexpected sites response format:", sitesResponse.data);
        setSites([]);
      }

      setError(null);
    } catch (error) {
      console.error("Error in fetchSites:", error);
      setError("Failed to load sites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleSiteSubmit = async (formData) => {
    console.log("Form submitted with data:", formData);
    setSubmitError(null);

    try {
      setLoading(true);

      // Make sure we have a project ID as a string
      const projectId = String(formData.project);

      // Log the request details
      console.log("API Request details:", {
        method: selectedSite ? "PUT" : "POST",
        projectId,
        siteId: selectedSite?._id,
        formData,
      });

      let createdSite = null;

      if (selectedSite) {
        // For update, ensure we have the site ID
        if (!selectedSite._id) {
          throw new Error("Missing site ID for update");
        }

        // Make a copy of the formData without the projectName property
        const { projectName, ...siteDataForUpdate } = formData;

        console.log(
          `Updating site ${selectedSite._id} in project ${projectId}`
        );
        const result = await projectApi.updateSite(
          projectId,
          selectedSite._id,
          siteDataForUpdate
        );
        console.log("Update result:", result);
        createdSite = result.data;
      } else {
        // For creation, ensure we have the project ID
        if (!projectId) {
          throw new Error("Project is required");
        }

        // Clone formData and remove any properties that might cause issues
        const { projectName, _id, ...siteDataForCreate } = formData;

        console.log(`Creating new site for project ${projectId}`);
        try {
          const result = await projectApi.createSite(
            projectId,
            siteDataForCreate
          );
          console.log("Creation result:", result);
          createdSite = result.data;

          // Manually add the new site to our sites array with the project name
          if (createdSite) {
            const projectName =
              projects.find((p) => p._id === projectId)?.name || "";
            const newSite = {
              ...createdSite,
              projectName,
            };
            console.log("Adding new site to the list:", newSite);
            setSites((prevSites) => [...prevSites, newSite]);
          }
        } catch (apiError) {
          console.error("API Error Details:", apiError.response || apiError);
          throw apiError;
        }
      }

      // If we reach here, the operation was successful
      setShowSiteModal(false);
      setSelectedSite(null);

      // Display success message
      setSuccessMessage(
        selectedSite
          ? "Site updated successfully!"
          : "Site created successfully!"
      );
      setTimeout(() => setSuccessMessage(null), 3000); // Clear message after 3 seconds

      // Fetch updated site list (as a backup, since we already manually added the site)
      await fetchSites();
    } catch (error) {
      console.error("Error saving site:", error);

      // Enhanced error logging
      if (error.response) {
        console.error("Server response:", {
          status: error.response.status,
          data: error.response.data,
        });
      }

      // Set a more user-friendly error message
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Failed to save site. Please try again."
      );

      // Don't close the modal on error
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSite = (site) => {
    console.log("Editing site:", site);
    setSelectedSite(site);
    setShowSiteModal(true);
  };

  const handleDeleteSite = async (siteId) => {
    if (!window.confirm("Are you sure you want to delete this site?")) {
      return;
    }

    try {
      setLoading(true);
      await projectApi.deleteSite(siteId);
      setSuccessMessage("Site deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Update the sites state by filtering out the deleted site
      setSites((prevSites) => prevSites.filter((site) => site._id !== siteId));
    } catch (error) {
      console.error("Error deleting site:", error);
      setError("Failed to delete site");
    } finally {
      setLoading(false);
    }
  };

  if (loading && sites.length === 0) {
    return <div className="p-6 text-center">Loading sites...</div>;
  }

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sites</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your construction sites and their details
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setSelectedSite(null);
              setSubmitError(null);
              setShowSiteModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Site
          </button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {sites.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500">
          No construction sites found. Click "New Site" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div
              key={site._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <BuildingOfficeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {site.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {site.projectName}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSite(site);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSite(site._id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  {site.location}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  {site.employeeCount || 0} workers
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {new Date(site.startDate).toLocaleDateString()} - {new Date(site.endDate).toLocaleDateString()}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    site.status === "Active"
                      ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                      : site.status === "On Hold"
                      ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                      : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                  }`}
                >
                  {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <SiteModal
        isOpen={showSiteModal}
        onClose={() => {
          setShowSiteModal(false);
          setSelectedSite(null);
          setSubmitError(null);
        }}
        onSubmit={handleSiteSubmit}
        projects={projects}
        initialData={selectedSite}
      />

      {/* Error Toast */}
      {submitError && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <div className="flex">
            <div className="py-1">
              <svg
                className="h-6 w-6 text-red-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{submitError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sites;
