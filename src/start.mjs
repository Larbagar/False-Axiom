import {setupTexutres} from "./graphics/textureHandler.mjs"
import {controlEditor} from "./controlEditor.mjs"
import {mainMenu} from "./mainMenu.mjs"
import {disableTouchBehavior} from "./disableTouchBehavior.mjs"
import {states} from "./states.mjs"

setupTexutres()

disableTouchBehavior()

history.replaceState(states.TITLE, "",)
document.title = "False Axiom - Title"

// let deferredPrompt
// addEventListener('beforeinstallprompt', (e) => {
//     e.preventDefault()
//     deferredPrompt = e
//     addEventListener("touchstart", _ => deferredPrompt.prompt())
// })
// setupServiceWorker()

mainMenu()