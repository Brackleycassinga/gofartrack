import React, { useState } from "react";
import { authApi } from "../services/api";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"; // Assuming you're using Heroicons

const Signup = ({ onSignup, switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authApi.signup(formData);
      onSignup(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Signup failed");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value }))
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={switchToLogin}
            className="text-blue-600 hover:text-blue-800"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
