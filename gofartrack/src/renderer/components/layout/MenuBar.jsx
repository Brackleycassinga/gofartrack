import React, { useEffect } from "react";
import {
  DocumentDuplicateIcon,
  UserIcon,
  ArrowsPointingOutIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ScissorsIcon,
  DocumentDuplicateIcon as CopyIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";

const MenuBar = ({
  menuOpen,
  toggleMenu,
  toggleFullscreen,
  onNewProject,
  onNewEmployee,
}) => {
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest(".menu-container")) {
        toggleMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, toggleMenu]);

  // Handle various menu actions
  const handleNewProject = () => {
    if (onNewProject) onNewProject();
    toggleMenu(null);
  };

  const handleNewEmployee = () => {
    if (onNewEmployee) onNewEmployee();
    toggleMenu(null);
  };

  const handleExportData = () => {
    // Export data implementation
    alert("Export Data functionality will be implemented here");
    toggleMenu(null);
  };

  const handlePrint = () => {
    window.print();
    toggleMenu(null);
  };

  const handleExit = () => {
    // For Electron apps
    if (window.electron) {
      window.electron.app.quit();
    } else {
      // For web apps, just show a message
      if (confirm("Are you sure you want to exit the application?")) {
        window.close();
      }
    }
    toggleMenu(null);
  };

  const handleZoomIn = () => {
    // Implement zoom in functionality
    document.body.style.zoom = (
      parseFloat(document.body.style.zoom || "1") * 1.1
    ).toString();
    toggleMenu(null);
  };

  const handleZoomOut = () => {
    // Implement zoom out functionality
    document.body.style.zoom = (
      parseFloat(document.body.style.zoom || "1") * 0.9
    ).toString();
    toggleMenu(null);
  };

  const handleResetZoom = () => {
    // Reset zoom
    document.body.style.zoom = "1";
    toggleMenu(null);
  };

  const handleRefresh = () => {
    window.location.reload();
    toggleMenu(null);
  };

  const handleAbout = () => {
    alert(
      "Go Far Track - Construction Management System\nVersion 1.2.5\n© 2025 Go Far Solutions"
    );
    toggleMenu(null);
  };

  const menuItems = {
    file: [
      {
        label: "New Project",
        icon: <DocumentDuplicateIcon className="w-4 h-4" />,
        onClick: handleNewProject,
      },
      {
        label: "New Employee",
        icon: <UserIcon className="w-4 h-4" />,
        onClick: handleNewEmployee,
      },
      {
        label: "Export Data...",
        icon: <DocumentArrowDownIcon className="w-4 h-4" />,
        divider: true,
        onClick: handleExportData,
      },
      {
        label: "Print...",
        icon: <PrinterIcon className="w-4 h-4" />,
        onClick: handlePrint,
      },
      {
        label: "Exit",
        icon: <XMarkIcon className="w-4 h-4" />,
        divider: true,
        onClick: handleExit,
      },
    ],
    edit: [
      {
        label: "Undo",
        icon: <ArrowUturnLeftIcon className="w-4 h-4" />,
        onClick: () => {
          document.execCommand("undo");
          toggleMenu(null);
        },
      },
      {
        label: "Redo",
        icon: <ArrowUturnRightIcon className="w-4 h-4" />,
        divider: true,
        onClick: () => {
          document.execCommand("redo");
          toggleMenu(null);
        },
      },
      {
        label: "Cut",
        icon: <ScissorsIcon className="w-4 h-4" />,
        onClick: () => {
          document.execCommand("cut");
          toggleMenu(null);
        },
      },
      {
        label: "Copy",
        icon: <CopyIcon className="w-4 h-4" />,
        onClick: () => {
          document.execCommand("copy");
          toggleMenu(null);
        },
      },
      {
        label: "Paste",
        icon: <ClipboardIcon className="w-4 h-4" />,
        divider: true,
        onClick: () => {
          document.execCommand("paste");
          toggleMenu(null);
        },
      },
      {
        label: "Find...",
        icon: <MagnifyingGlassIcon className="w-4 h-4" />,
        onClick: () => {
          if (window.find) {
            window.find();
          } else {
            alert("Find functionality not available in this browser");
          }
          toggleMenu(null);
        },
      },
    ],
    view: [
      {
        label: "Fullscreen",
        icon: <ArrowsPointingOutIcon className="w-4 h-4" />,
        onClick: () => {
          toggleFullscreen();
          toggleMenu(null);
        },
      },
      {
        label: "Zoom In",
        divider: true,
        onClick: handleZoomIn,
      },
      {
        label: "Zoom Out",
        onClick: handleZoomOut,
      },
      {
        label: "Reset Zoom",
        divider: true,
        onClick: handleResetZoom,
      },
      {
        label: "Refresh",
        icon: <ArrowPathIcon className="w-4 h-4" />,
        onClick: handleRefresh,
      },
    ],
    help: [
      {
        label: "About",
        onClick: handleAbout,
      },
    ],
  };

  const renderMenuItem = (item) => (
    <div
      key={item.label}
      className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors duration-150 ${
        item.divider ? "border-t border-gray-200 mt-1 pt-2" : ""
      }`}
      onClick={item.onClick}
    >
      {item.icon && <span className="mr-3 text-gray-500">{item.icon}</span>}
      <span>{item.label}</span>
    </div>
  );

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center h-12 px-4 space-x-4">
        {Object.entries(menuItems).map(([key, items]) => (
          <div key={key} className="relative menu-container">
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
                menuOpen === key
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => toggleMenu(menuOpen === key ? null : key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
            {menuOpen === key && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {items.map(renderMenuItem)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBar;
