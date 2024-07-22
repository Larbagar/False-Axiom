import {setupTexutres} from "./graphics/textureHandler.mjs"
import {controlEditor} from "./controlEditor.mjs"

setupTexutres()

// let deferredPrompt
// addEventListener('beforeinstallprompt', (e) => {
//     e.preventDefault()
//     deferredPrompt = e
//     addEventListener("touchstart", _ => deferredPrompt.prompt())
// })
// setupServiceWorker()

controlEditor()