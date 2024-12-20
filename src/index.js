const fileInput = document.querySelector("#select-file");
const recordKeySpan = document.querySelector("#record-keybind");
const mainKeySpan = document.querySelector("#main-keybind")
var selectedFile = null;

fileInput.onchange = async e => {
  console.log("TRYING");
  updateFile(e.target.files[0].path);
}

async function updateFile(path) {
  if (!path) return;
  if (!path.endsWith(".txt")) {
    error("File must be of .txt type");
    return;
  }
  let repeat = document.querySelector("#repeat-input").value;
  console.log(repeat);
  if (!repeat) {
    error("Fill repeat input.");
    return;
  }
  if (Number.isNaN(repeat)) {
    error("Repeat must be an integer.");
    return;
  }

  let startDelay = document.querySelector("#delay-input").value;
  console.log(startDelay);
  if (!startDelay) {
    error("Fill startdelay input.");
    return;
  }
  console.log(typeof startDelay);
  if (Number.isNaN(startDelay)) {
    error("Startdelay must be an integer.");
    return;
  }

  document.querySelector("#file-name").innerHTML = path.split("\\")[path.split("\\").length - 1];
  console.log(repeat);
  window.electronAPI.updateFilePath({ "filePath": path, "repeat": repeat, "startDelay": startDelay });
}

function error(errmsg) {
  fileInput.value = "";
  console.log(errmsg);
}

function closeError() {

}

function rebindMainKey() {
  document.addEventListener("keydown", rebindKey);
  document.bind = "main";
}

function rebindRecordKey() {
  document.addEventListener("keydown", rebindKey);
  document.bind = "record";
}

function minimizeApp() {
  window.electronAPI.minimize();
}

function closeApp() {
  window.electronAPI.closeApp();
}

function openSettings() {
  window.electronAPI.openSettings();
}

function rebindKey(event, bind) {
  document.removeEventListener("keydown", rebindKey);
  let key = event.key;
  let binary = key.charCodeAt(0);
  if (!((binary >= 48 && binary <= 57) || (binary >= 65 && binary <= 90) || (binary >= 97 && binary <= 122)) || key.length != 1) {
    alert("Bind must be a-z, A-Z, 0-9");
    return;
  }
  if (document.bind === "main") {
    if (recordKeySpan.innerHTML == key) {
      alert("Cannot use the same key as recording keybind");
      return;
    }
    window.electronAPI.rebindMainKey(key)
    mainKeySpan.innerHTML = key;
  }
  else if (document.bind === "record") {
    if (mainKeySpan.innerHTML == key) {
      alert("Cannot use the same key as starting keybind");
      return;
    }
    window.electronAPI.rebindRecordKey(key);
    recordKeySpan.innerHTML = key;
  }
}

function selectFile() {
  fileInput.click();
}

function retrieveSettings() {
  fetch("./../data.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error
          (`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      document.querySelector("#main-keybind").innerHTML = data.bind;
      document.querySelector("#record-keybind").innerHTML = data.record;
      updateFile(data.lastFile);
    }
    )
    .catch((error) =>
      console.error("Unable to fetch data:", error));
}

retrieveSettings();

window.addEventListener('DOMContentLoaded', () => {
  window.electronAPI.onMessage((event, message) => {
    error(message.message);
  });
});