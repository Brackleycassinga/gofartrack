import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

console.log("Starting application initialization...");

document.addEventListener("DOMContentLoaded", () => {
  try {
    const container = document.getElementById("root");
    if (!container) {
      throw new Error("Root element not found");
    }

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("Application rendered successfully");
  } catch (error) {
    console.error("Failed to initialize application:", error);
    // Show error on page
    document.body.innerHTML = `
      <div style="padding: 20px; color: red;">
        Error loading application: ${error.message}
      </div>
    `;
  }
});
