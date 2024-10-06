import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import { start, stop } from "./WIC/index.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import data from "data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function rebindKey(event, key) {
  globalShortcut.unregisterAll();
  let shortcut = `CommandOrControl+${key.toUpperCase()}`
  globalShortcut.register(shortcut, () => {
    /*
    stop();
    start();
    */
});
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 36,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.loadFile('./src/index.html');
}

app.whenReady().then(() => {

  ipcMain.on("rebind-key", rebindKey);
  rebindKey(null, data.bind);
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