const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const isDev = process.env.NODE_ENV === "development";

if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Always open DevTools for debugging
  mainWindow.webContents.openDevTools();

  // Enable hot reload in development
  if (isDev) {
    require("electron-reload")(__dirname, {
      electron: path.join(__dirname, "..", "node_modules", ".bin", "electron"),
    });
  }

  // Add error handling
  mainWindow.webContents.on("crashed", () => {
    console.error("Window crashed!");
  });

  mainWindow.on("unresponsive", () => {
    console.error("Window became unresponsive!");
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
