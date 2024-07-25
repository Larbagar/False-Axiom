import {setupTexutres} from "./graphics/textureHandler.mjs"
import {controlEditor} from "./controlEditor.mjs"
import {title} from "./title.mjs"
import {disableTouchBehavior} from "./disableTouchBehavior.mjs"
import {states} from "./states.mjs"
import {handleHistory} from "./historyHandler.mjs"

setupTexutres()

disableTouchBehavior()

handleHistory()

addEventListener("touchcancel", _ => alert('asdf'))

history.replaceState(states.TITLE, "",)
document.title = "False Axiom - Title"

// let deferredPrompt
// addEventListener('beforeinstallprompt', (e) => {
//     e.preventDefault()
//     deferredPrompt = e
//     addEventListener("touchstart", _ => deferredPrompt.prompt())
// })
// setupServiceWorker()

navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
        registration.unregister();
    }
})

title()