import React, { useState, useEffect } from "react";
import { authApi } from "../services/api";
import logo from "../../images/logo.png";

const Login = ({ onLogin, switchToSignup }) => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Entrance animation
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login(formData);
      onLogin(response.data);
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div
        className={`max-w-md w-full space-y-8 transform transition-all duration-700 ease-out ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="text-center">
          <img
            className="mx-auto h-80 w-auto transform transition-all duration-700 hover:scale-110"
            src={logo}
            alt="Go Far Track"
          />
          <h2
            className={`mt-6 text-center text-3xl font-extrabold text-gray-900 transition-all duration-700 delay-300 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            Sign in to <span className="text-black-600">GoFarTrack</span>
          </h2>
        </div>

        <div
          className={`bg-white rounded-lg shadow-xl p-8 transition-all duration-700 delay-500 transform ${
            mounted
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-95"
          }`}
        >
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-3 animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <div
                className={`relative transition duration-300 ${
                  focusedField === "phone" ? "transform scale-105" : ""
                }`}
              >
                <input
                  id="phone"
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="0788123456"
                  className={`block w-full px-3 py-2 border rounded-md text-sm transition-all duration-300 outline-none ${
                    focusedField === "phone"
                      ? "border-blue-500 ring-2 ring-blue-200 shadow-sm"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div
                className={`relative transition duration-300 ${
                  focusedField === "password" ? "transform scale-105" : ""
                }`}
              >
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="password123"
                  className={`block w-full px-3 py-2 border rounded-md text-sm transition-all duration-300 outline-none ${
                    focusedField === "password"
                      ? "border-blue-500 ring-2 ring-blue-200 shadow-sm"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 transition-all duration-300 hover:shadow-sm"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm text-blue-600 hover:text-blue-800 transition-all duration-300 hover:underline cursor-pointer">
                Forgot password?
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 transition-all duration-300 transform ${
                loading
                  ? "bg-blue-400"
                  : "hover:bg-blue-700 hover:shadow-md active:scale-95"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={switchToSignup}
            className="text-blue-600 hover:text-blue-800"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
