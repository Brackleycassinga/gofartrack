const { app, BrowserWindow } = require("electron");
const path = require("path");

// ...existing code...

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "../images/logo.png"), // Add this line
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // ...existing code...
}

// ...existing code...
