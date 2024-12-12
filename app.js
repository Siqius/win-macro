import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import { start, stop, jsonToText, textToJson } from "win-macro";
import path from "node:path";
import { fileURLToPath } from "node:url";
import data from "./settings.json" with { type: "json" };
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var startBind = data.bind;
var recordBind = data.record;

var macroRunning = false;

var pathToMacro;
var macro;

function rebindKey() {
  globalShortcut.unregisterAll();
  globalShortcut.register(`CommandOrControl+${startBind.toUpperCase()}`, () => {
    if (macroRunning) {
      stop();
      macroRunning = false;
      return;
    }
    start(macro);
    macroRunning = true;
    return;
  });

  globalShortcut.register(`CommandOrControl+${recordBind.toUpperCase()}`, () => {
    // record
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

function rebindMainKey(_, key) {
  startBind = recordBind == key ? startBind : key;
  rebindKey();
}

function rebindRecordKey(_, key) {
  recordBind = startBind == key ? recordBind : key;
  rebindKey();
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

function updateFilePath(_, filePath) {
  pathToMacro = filePath;
  try {
    fs.readFile(pathToMacro, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      macro = textToJson(data)

      console.log(macro);
    })
  } catch (e) {
    console.log(e);
  }
}

const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    title: "main",
    width: 350,
    height: 450,
    maximizable: false,
    autoHideMenuBar: true,
    frame: false,
    resizable: false,
    show: false,
    opacity: 0.9,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.loadFile('./src/index.html');

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  })
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
  ipcMain.on("updateFilePath", updateFilePath);

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