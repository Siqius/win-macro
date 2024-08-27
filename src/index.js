function autoclicker() {
    console.log("Hello world!")
}

button = document.querySelector("button");
button.addEventListener("click", (e) => {
    let key = document.querySelector("#key").value;
    console.log(key);
    window.electronAPI.rebindKey(key);
})