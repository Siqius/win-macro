import rebindKey from '../app.js';

console.log(currentShortcut);

function autoclicker() {
    console.log("Hello world!")
}

button = document.getElementById("button");
button.addEventListener("click",(e) => {
    rebindKey()
})