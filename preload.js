const { contextBridge, ipcRenderer } = require("electron");

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
  contextBridge.exposeInMainWorld('electronAPI', {
    rebindMainKey: (title) => ipcRenderer.send('rebindMainKey', title),
    rebindRecordKey: (title) => ipcRenderer.send('rebindRecordKey', title),
    minimize: (title) => ipcRenderer.send("minimize", title),
    closeApp: (title) => ipcRenderer.send("closeApp", title),
    closeWindow: (title) => ipcRenderer.send("closeWindow", title),
    openSettings: (title) => ipcRenderer.send("openSettings", title),
    updateFilePath: (title) => ipcRenderer.send("updateFilePath", title),

    onMessage: (callback) => ipcRenderer.on("error-message", callback)
  })
})