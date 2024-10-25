const fileInput = document.querySelector("#select-file");
const recordKeySpan = document.querySelector("#record-button-keybind-key");

fileInput.onchange = e => {
  let file = e.target.files[0];
  console.log(file);
  document.querySelector("#file-name").innerHTML = file.name;
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
    window.electronAPI.rebindMainKey(key)
  }
  else if (document.bind === "record") {
    window.electronAPI.rebindRecordKey(key);
    recordKeySpan.innerHTML = key;
  }
}

function selectFile() {
  fileInput.click();
}