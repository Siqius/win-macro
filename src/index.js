const fileInput = document.querySelector("#select-file");
const recordKeySpan = document.querySelector("#record-keybind");
const mainKeySpan = document.querySelector("#main-keybind")
var selectedFile = null;

fileInput.onchange = e => {
  let file = e.target.files[0];
  if (!file.name.endsWith(".js")) {
    error("File must be of .js type");
    return;
  }
  selectedFile = file.path;
  document.querySelector("#file-name").innerHTML = file.name;
}

function error(errmsg) {

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
  fetch("./../settings.json")
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
    }
    )
    .catch((error) =>
      console.error("Unable to fetch data:", error));
}

retrieveSettings();