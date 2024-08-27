import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mouse } from "nutjs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function rebindKey(event, key) {
  globalShortcut.unregisterAll();
  let shortcut = `CommandOrControl+${key.toUpperCase()}`
  globalShortcut.register(shortcut, () => {
    mouse.leftClick();
});
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.loadFile('./src/index.html');
}

app.whenReady().then(() => {

  ipcMain.on("rebind-key", rebindKey);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
  })
})

app.on('window-all-closed', () => {
  app.quit();
})