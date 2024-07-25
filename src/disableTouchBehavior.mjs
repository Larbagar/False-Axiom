import {canvas} from "./graphics/textureHandler.mjs"

function disableTouchBehavior() {
    canvas.addEventListener("touchstart", e => {
        e.preventDefault()
    })
    addEventListener("contextmenu", e => {
        e.preventDefault()
    })
    addEventListener("touchend", e => {
        e.preventDefault()
    })
}

export {disableTouchBehavior}