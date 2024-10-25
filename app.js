import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import { start, stop } from "windows-input-controller";
import path from "node:path";
import { fileURLToPath } from "node:url";
import data from "./settings.json" assert { type: "json" };
import macro from "./macro.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var startBind = data.bind;
var recordBind = data.record;

function rebindKey() {
  globalShortcut.unregisterAll();
  globalShortcut.register(`CommandOrControl+${startBind.toUpperCase()}`, () => {
    stop();
    start(macro);
  });
  globalShortcut.register(`CommandOrControl+${recordBind.toUpperCase()}`, () => {
    //start/stop record
  });
  let toWrite = {
    "bind": startBind,
    "record": recordBind
  };
  fs.writeFile("settings.json", JSON.stringify(toWrite), (error) => {
    if (error) {
      console.error(error);
      throw error;
    }
    console.log("data.json written correctly");
  });
}

function rebindMainKey(trash, key) {
  console.log(key);
  console.log("hello");
  return;
  rebindKey(key);
}

function rebindRecordKey(key) {
  console.log(key);
  return;
  rebindKey(key);
}

function minimizeApp() {
  BrowserWindow.getFocusedWindow().minimize();
}

function closeApp() {
  app.quit();
}

function closeWindow() {
  BrowserWindow.getFocusedWindow().close();
}

function openSettings() {
  createSettingsWindow();
}

const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    title: "main",
    width: 350,
    height: 400,
    maximizable: false,
    autoHideMenuBar: true,
    frame: false,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.loadFile('./src/index.html');

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  })
  app.disableHardwareAcceleration();
}

const createSettingsWindow = async () => {
  const settingsWindow = new BrowserWindow({
    width: 200,
    height: 300,
    maximizable: false,
    autoHideMenuBar: true,
    frame: false,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  settingsWindow.loadFile('./src/settings.html');

  settingsWindow.once("ready-to-show", () => {
    settingsWindow.show();
  })
}

app.whenReady().then(() => {

  ipcMain.on("rebindMainKey", rebindMainKey);
  ipcMain.on("rebindRecordKey", rebindRecordKey);
  ipcMain.on("minimize", minimizeApp);
  ipcMain.on("closeApp", closeApp);
  ipcMain.on("closeWindow", closeWindow);
  ipcMain.on("openSettings", openSettings);

  rebindKey();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  })
})

app.on('window-all-closed', () => {
  app.quit();
})