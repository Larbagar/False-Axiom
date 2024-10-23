import {setupTexutres} from "./graphics/textureHandler.mjs"
import {title} from "./title.mjs"
import {disableTouchBehavior} from "./disableTouchBehavior.mjs"
import {states} from "./states.mjs"
import {handleHistory} from "./historyHandler.mjs"
import {loop} from "./loop.mjs"

setupTexutres()

disableTouchBehavior()

handleHistory()

// playConfigSoundtrack()

alert(`\
This game only works on touchscreens.
To enter game setup, press the white play button.
In game setup, create a player by tapping two fingers and spreading them apart. The line that appears is your control zone. Create one control zone for each player.
The game begins when all players have indicated that they are ready by pressing two fingers on either side of their control zone (but not touching the line).

Once the game has started, players can steer their ships by tapping on the right or left side of their control zone (now hidden).
Players can dash by tapping on both sides of the control zone simultaneously.
Each player's health is indicated with dots above their ship. Collisions will inflict damage.
The goal is to be the last player standing!\
`)

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

loop()