import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import { start, stop, jsonToText, textToJson } from "win-macro";
import EventEmitter from 'node:events';
import path from "node:path";
import { fileURLToPath } from "node:url";
import data from "./data.json" with { type: "json" };
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventEmitter = new EventEmitter();

var mainWindow;

var startBind = data.bind;
var recordBind = data.record;
var lastFile = "";

var pathToMacro;
var macro;
var macroRunning = false;

function rebindKey() {
  globalShortcut.unregisterAll();
  globalShortcut.register(`CommandOrControl+${startBind.toUpperCase()}`, async () => {
    if (macroRunning) {
      stopMacro();
    } else {
      startMacro();
    }
  });

  globalShortcut.register(`CommandOrControl+${recordBind.toUpperCase()}`, () => {
    // record
  });
  updateDataFile();
}

function updateDataFile() {
  let toWrite = {
    "bind": startBind,
    "record": recordBind,
    "lastFile": lastFile
  };
  fs.writeFile("data.json", JSON.stringify(toWrite), (error) => {
    if (error) {
      console.error(error);
      throw error;
    }
    console.log("data.json written correctly");
  });
}

function startMacro() {
  start(macro, eventEmitter); // macroRunning = false when done
  macroRunning = true;
}

function stopMacro() {
  stop();
  macroRunning = false;
}

function rebindMainKey(_, key) {
  startBind = recordBind == key ? startBind : key;
  rebindKey();
}

function rebindRecordKey(_, key) {
  recordBind = startBind == key ? recordBind : key;
  rebindKey();
}

function closeApp() {
  updateDataFile();
  app.quit();
}

function minimizeApp() { BrowserWindow.getFocusedWindow().minimize(); }

function closeWindow() { BrowserWindow.getFocusedWindow().close(); }

function openSettings() { createSettingsWindow(); }

function updateFilePath(_, param) {
  pathToMacro = param.filePath;
  fs.readFile(pathToMacro, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    try {
      let macroText = `${param.repeat};${param.startDelay};${data}`;
      console.log(macroText);
      macro = textToJson(macroText);
      console.log(macro);
      lastFile = param.filePath;
      updateDataFile();
    } catch (e) {
      mainWindow.webContents.send('error-message', { 'message': e.message });
    }
  })
}

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
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
    contextIsolation: true,
    enableRemoteModule: false, // Optional, depending on your setup
    nodeIntegration: false,
    vibrancy: {
      theme: 'light', // (default) or 'dark' or '#rrggbbaa'
      effect: 'blur', // (default) or 'blur'
      disableOnBlur: true, // (default)
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.loadFile('./src/index.html');

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    eventEmitter.on("Worker-finished", () => {
      console.log("Macro finished!");
      macroRunning = false;
    })

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