import axios from "axios";

// Configure base URL WITHOUT /api prefix to match your server's route registration
const API_URL = "http://localhost:5001";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add request logger
api.interceptors.request.use(
  (request) => {
    console.log("API Request:", {
      url: request.url,
      method: request.method,
      data: request.data,
      headers: request.headers,
    });
    return request;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response logger
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// User management API
export const userApi = {
  getAll: async () => {
    try {
      console.log("Fetching all users");
      const response = await api.get("/users");
      console.log("Users response:", response.data);
      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  updateRole: async (userId, role) => {
    try {
      console.log(`Updating user ${userId} role to ${role}`);
      const response = await api.patch(`/users/${userId}/role`, { role });
      console.log("Role update response:", response.data);
      return response;
    } catch (error) {
      console.error(`Error updating user role:`, error);
      throw error;
    }
  },

  create: async (userData) => {
    try {
      console.log("Creating new user:", userData);
      const response = await api.post("/users", userData);
      console.log("User creation response:", response.data);
      return response;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  update: async (userId, userData) => {
    try {
      console.log(`Updating user ${userId}:`, userData);
      const response = await api.put(`/users/${userId}`, userData);
      console.log("User update response:", response.data);
      return response;
    } catch (error) {
      console.error(`Error updating user:`, error);
      throw error;
    }
  },

  delete: async (userId) => {
    try {
      console.log(`Deleting user ${userId}`);
      const response = await api.delete(`/users/${userId}`);
      console.log("User deletion response:", response.data);
      return response;
    } catch (error) {
      console.error(`Error deleting user:`, error);
      throw error;
    }
  },
};

export const reportApi = {
  getAll: async () => {
    try {
      const response = await api.get("/reports");
      return response;
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  },

  getByProject: async (projectId) => {
    try {
      const response = await api.get(`/reports/project/${projectId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching reports for project ${projectId}:`, error);
      throw error;
    }
  },

  getByDate: async (date) => {
    try {
      const response = await api.get(`/reports/date/${date}`);
      return response;
    } catch (error) {
      console.error(`Error fetching reports for date ${date}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/reports", data);
      return response;
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/reports/${id}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating report ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/reports/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting report ${id}:`, error);
      throw error;
    }
  },
};

export const employeeApi = {
  getAll: async () => {
    try {
      const response = await api.get("/employees");
      return response;
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      const response = await api.post("/employees", data);
      return response;
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.put(`/employees/${id}`, data);
      return response;
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }
  },
  updateAttendance: async (id, data) => {
    try {
      const response = await api.patch(`/employees/${id}/attendance`, data);
      return response;
    } catch (error) {
      console.error("Error updating attendance:", error);
      throw error;
    }
  },
};

export const authApi = {
  login: async (credentials) => {
    try {
      console.log("Login attempt with:", credentials);
      const response = await api.post("/auth/login", credentials);
      console.log("Login response:", response.data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response;
    } catch (error) {
      console.error("Login error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        requestBody: error.config?.data,
      });
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      console.log("Signup request:", userData);
      const response = await api.post("/auth/signup", userData);
      console.log("Signup response:", response.data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response;
    } catch (error) {
      console.error("Signup error:", error.response || error);
      throw error;
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export const projectApi = {
  getAll: async () => {
    try {
      const response = await api.get("/projects");
      return response;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      const response = await api.post("/projects", data);
      return response;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.put(`/projects/${id}`, data);
      return response;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },

  // Updated Site methods
  createSite: async (projectId, siteData) => {
    try {
      // Send projectId in the request body along with site data
      const response = await api.post("/sites", {
        projectId,
        ...siteData,
      });
      return response;
    } catch (error) {
      console.error("Error creating site:", error);
      throw error;
    }
  },

  getSites: async () => {
    try {
      // Get all sites from the top-level endpoint
      const response = await api.get("/sites");
      return response;
    } catch (error) {
      console.error("Error fetching sites:", error);
      throw error;
    }
  },

  getAllSites: async () => {
    try {
      const response = await api.get("/sites");
      console.log("All sites response:", response.data);
      return response;
    } catch (error) {
      console.error("Error fetching all sites:", error);
      throw error;
    }
  },

  getSitesByProject: async (projectId) => {
    try {
      console.log("Fetching sites for project:", projectId);
      const response = await api.get(`/sites?project=${projectId}`);

      // Add more detailed logging to help debug
      console.log(`Project sites response for ${projectId}:`, {
        count: response.data.length,
        data: response.data,
      });

      return response;
    } catch (error) {
      console.error(`Error fetching sites for project ${projectId}:`, error);
      throw error;
    }
  },

  updateSite: async (projectId, siteId, data) => {
    try {
      // Update site at the top-level endpoint
      // Include projectId in the request body if your backend needs it
      const response = await api.put(`/sites/${siteId}`, {
        projectId,
        ...data,
      });
      return response;
    } catch (error) {
      console.error("Error updating site:", error);
      throw error;
    }
  },

  deleteSite: async (siteId) => {
    try {
      // Delete site at the top-level endpoint
      const response = await api.delete(`/sites/${siteId}`);
      return response;
    } catch (error) {
      console.error("Error deleting site:", error);
      throw error;
    }
  },
};

export const paymentApi = {
  getAll: async () => {
    try {
      const response = await api.get("/payments");
      return response;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      const response = await api.post("/payments", data);
      return response;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },
  getStatistics: async () => {
    try {
      const response = await api.get("/payments/statistics");
      return response;
    } catch (error) {
      console.error("Error fetching payment statistics:", error);
      throw error;
    }
  },
};

export const supplierApi = {
  getAll: async () => {
    try {
      const response = await api.get("/suppliers");
      return response;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      if (error.response?.status === 404) {
        throw new Error("Supplier service is not available");
      }
      throw error;
    }
  },
  create: async (data) => {
    try {
      const response = await api.post("/suppliers", data);
      return response;
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.put(`/suppliers/${id}`, data);
      return response;
    } catch (error) {
      console.error("Error updating supplier:", error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/suppliers/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting supplier:", error);
      throw error;
    }
  },
};

export const contractorApi = {
  getAll: async () => {
    try {
      const response = await api.get("/contractors");
      return response;
    } catch (error) {
      console.error("Error fetching contractors:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/contractors", data);
      return response;
    } catch (error) {
      console.error("Error creating contractor:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/contractors/${id}`, data);
      return response;
    } catch (error) {
      console.error("Error updating contractor:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/contractors/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting contractor:", error);
      throw error;
    }
  },
};

export default api;
