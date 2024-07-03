
function setupServiceWorker(){
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./sw.js")
    }
}

export {setupServiceWorker}