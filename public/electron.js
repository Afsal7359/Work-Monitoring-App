const { app, BrowserWindow, ipcMain } = require('electron');
const psList = require('ps-list');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Optional, for security
      nodeIntegration: true, // Enable Node.js integration in the renderer process
      contextIsolation: false // Allow communication between main and renderer
    }
  });

  mainWindow.loadURL('http://localhost:3000'); // Or your React app URL
}

// Event to handle fetching process list
ipcMain.handle('get-process-list', async () => {
  try {
    const processList = await psList();
    return processList;
  } catch (error) {
    console.error('Error fetching process list:', error);
    return [];
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
