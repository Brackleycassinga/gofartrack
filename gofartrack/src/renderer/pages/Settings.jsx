import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  PlusIcon,
  XMarkIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { userApi } from "../services/api"; // Make sure to import the userApi

const Settings = ({ currentUser, onLogout }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const isAdmin = currentUser?.user?.role === "admin";

  // State for user management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState({
    userId: null,
    status: null,
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });
  const [addUserError, setAddUserError] = useState(null);
  const [addUserLoading, setAddUserLoading] = useState(false);

  // Admin verification states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationPhone, setVerificationPhone] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [pendingRoleChange, setPendingRoleChange] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.getAll();
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle role change request
  const handleRoleChangeRequest = (userId, currentRole) => {
    // If demoting from admin to user, no verification needed
    if (currentRole === "admin") {
      toggleUserRole(userId, currentRole);
      return;
    }

    // If promoting to admin, require verification
    setPendingRoleChange({ userId, currentRole });
    setVerificationPhone("");
    setVerificationError("");
    setShowVerificationModal(true);
  };

  // Function to verify admin phone
  const verifyAdminPhone = () => {
    // Check against hardcoded phone number
    if (verificationPhone === "0791240041") {
      // Verification successful, proceed with role change
      toggleUserRole(pendingRoleChange.userId, pendingRoleChange.currentRole);
      setShowVerificationModal(false);
      setPendingRoleChange(null);
    } else {
      // Verification failed
      setVerificationError("Invalid verification code. Please try again.");
    }
  };

  // Function to toggle user role
  const toggleUserRole = async (userId, currentRole) => {
    setUpdateStatus({ userId, status: "pending" });
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      const response = await userApi.updateRole(userId, newRole);

      // If we get a successful response, update the local state with the response data
      if (response && response.data) {
        setUsers(
          users.map((user) => {
            if (user._id === userId || user.id === userId) {
              // Return the updated user from the API response
              return {
                ...user,
                ...response.data, // Merge the response data
                id: user.id || user._id, // Ensure we maintain the ID for local reference
                _id: user._id || user.id,
              };
            }
            return user;
          })
        );
      } else {
        // Fallback to local update if API doesn't return updated user
        setUsers(
          users.map((user) => {
            if (user._id === userId || user.id === userId) {
              return { ...user, role: newRole };
            }
            return user;
          })
        );
      }

      setUpdateStatus({ userId, status: "success" });

      // Clear status after 3 seconds
      setTimeout(() => {
        setUpdateStatus({ userId: null, status: null });
      }, 3000);
    } catch (err) {
      console.error("Error updating user role:", err);
      setUpdateStatus({ userId, status: "error" });

      // Clear error status after 3 seconds
      setTimeout(() => {
        setUpdateStatus({ userId: null, status: null });
      }, 3000);
    }
  };

  // Function to handle add user form input changes
  const handleAddUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // Function to handle adding a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserLoading(true);
    setAddUserError(null);

    try {
      // Validate form
      if (
        !newUser.name ||
        !newUser.email ||
        !newUser.phone ||
        !newUser.password
      ) {
        setAddUserError("All fields are required");
        setAddUserLoading(false);
        return;
      }

      // If user is being created as admin, verify admin phone
      if (newUser.role === "admin") {
        if (verificationPhone !== "0791240041") {
          setAddUserError(
            "Admin validation failed. Please enter the correct verification code."
          );
          setAddUserLoading(false);
          return;
        }
      }

      // Call API to create user
      const response = await userApi.create(newUser);

      // Add new user to state
      if (response && response.data) {
        setUsers((prev) => [...prev, response.data]);

        // Reset form and close modal
        setNewUser({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "user",
        });
        setShowAddUserModal(false);
      }
    } catch (err) {
      console.error("Error adding user:", err);
      setAddUserError(err.response?.data?.message || "Failed to add user");
    } finally {
      setAddUserLoading(false);
    }
  };

  const accountDetails = [
    {
      title: "Personal Information",
      icon: UserCircleIcon,
      fields: [
        { label: "Full Name", value: currentUser?.user?.name || "N/A" },
        { label: "Email", value: currentUser?.user?.email || "N/A" },
        { label: "Phone", value: currentUser?.user?.phone || "N/A" },
        { label: "Role", value: currentUser?.user?.role || "N/A" },
      ],
    },
    {
      title: "Security",
      icon: ShieldCheckIcon,
      fields: [
        {
          label: "Last Login",
          value: new Date(
            currentUser?.user?.lastLogin || Date.now()
          ).toLocaleString(),
        },
        { label: "Account Status", value: "Active" },
        { label: "Two-Factor Auth", value: "Disabled" },
      ],
    },
  ];

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isDarkMode ? (
              <MoonIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            ) : (
              <SunIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Theme
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Switch between light and dark mode
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200 dark:bg-blue-600"
          >
            <span
              className={`${
                isDarkMode ? "translate-x-5" : "translate-x-0"
              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
          </button>
        </div>
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accountDetails.map((section, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <section.icon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {section.title}
              </h3>
            </div>
            <div className="space-y-4">
              {section.fields.map((field, fieldIndex) => (
                <div
                  key={fieldIndex}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {field.label}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Management - Only visible to admin users */}
      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <UserGroupIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                User Management
              </h3>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add User
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Manage user roles and permissions
          </p>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 mb-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </span>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="py-4 text-center text-gray-500 dark:text-gray-400">
              Loading users...
            </div>
          ) : (
            <div className="overflow-x-auto">
              {users.length === 0 ? (
                <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                  No users found.
                </p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Phone
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user._id || user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {/* Don't allow users to demote themselves */}
                            {currentUser?.user?.id === (user._id || user.id) &&
                            user.role === "admin" ? (
                              <span className="text-sm text-gray-500">
                                Cannot change own role
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    handleRoleChangeRequest(
                                      user._id || user.id,
                                      user.role
                                    )
                                  }
                                  disabled={
                                    updateStatus.userId ===
                                      (user._id || user.id) &&
                                    updateStatus.status === "pending"
                                  }
                                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    user.role === "admin"
                                      ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                      : "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                                  } ${
                                    updateStatus.userId ===
                                      (user._id || user.id) &&
                                    updateStatus.status === "pending"
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  {updateStatus.userId ===
                                    (user._id || user.id) &&
                                  updateStatus.status === "pending"
                                    ? "Updating..."
                                    : user.role === "admin"
                                    ? "Set as User"
                                    : "Set as Admin"}
                                </button>

                                {/* Status indicators */}
                                {updateStatus.userId ===
                                  (user._id || user.id) &&
                                  updateStatus.status === "success" && (
                                    <span className="text-green-600 dark:text-green-400 text-xs">
                                      Updated!
                                    </span>
                                  )}
                                {updateStatus.userId ===
                                  (user._id || user.id) &&
                                  updateStatus.status === "error" && (
                                    <span className="text-red-600 dark:text-red-400 text-xs">
                                      Failed
                                    </span>
                                  )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Additional Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Additional Settings
        </h3>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <BellIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span>Notifications</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <KeyIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span>Change Password</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>Logout</span>
          </div>
          <span className="text-red-400">→</span>
        </button>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Add New User
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {addUserError && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 mb-4 rounded-lg text-sm text-red-600 dark:text-red-400">
                {addUserError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newUser.name}
                  onChange={handleAddUserInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Full Name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleAddUserInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Email Address"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={newUser.phone}
                  onChange={handleAddUserInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Phone Number"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleAddUserInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Password"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleAddUserInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Admin verification field - only shown when role is admin */}
              {newUser.role === "admin" && (
                <div>
                  <label
                    htmlFor="verificationCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    <div className="flex items-center">
                      <LockClosedIcon className="w-4 h-4 mr-1 text-red-500" />
                      <span>Admin Verification Code</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationPhone}
                    onChange={(e) => setVerificationPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter phone verification code"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required to create admin users
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addUserLoading}
                  className={`px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    addUserLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {addUserLoading ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                <div className="flex items-center">
                  <LockClosedIcon className="w-5 h-5 mr-2 text-red-500" />
                  Admin Verification Required
                </div>
              </h3>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setPendingRoleChange(null);
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Promoting a user to admin requires verification. Please enter the
              admin verification code.
            </p>

            {verificationError && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 mb-4 rounded-lg text-sm text-red-600 dark:text-red-400">
                {verificationError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="adminPhone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="adminPhone"
                  value={verificationPhone}
                  onChange={(e) => setVerificationPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter verification code"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setPendingRoleChange(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={verifyAdminPhone}
                  className="px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
