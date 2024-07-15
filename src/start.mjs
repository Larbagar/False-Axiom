import {canvas, setupTexutres} from "./graphics/textureHandler.mjs"
import V2 from "./V2.mjs"

setupTexutres()

/** @type {Set<Player>} */
const players = new Set()

function controlEditor(){
    for(const player of players){

    }

    requestAnimationFrame(controlEditor)
}

canvas.addEventListener("touchstart", e => {
    e.preventDefault()
})
addEventListener("contextmenu", e => {
    e.preventDefault()
})
addEventListener("touchend", e => {
    e.preventDefault()
})

function setupControlEditorListeners(){
    addEventListener("touchstart", touchStart)
    addEventListener("touchstart", touchMove)
    addEventListener("touchend", touchEnd)
}
/** @type {Set<V2>} */
const availableTouches = new Set()
/** @type {Map<number, V2>} */
const touches = new Map()
function touchStart(e){
    const smallerDimension = Math.min(innerWidth, innerHeight)
    for(const newTouchRaw of e.changedTouches){
        const newTouch = V2.fromVals(newTouchRaw.clientX/innerWidth, newTouchRaw.clientY/innerHeight)

        let closestDist = 0.1
        let closest = null
        for(const [id, touch] of availableTouches){
            let dist = Math.sqrt(((newTouch.x - touch.x)*innerWidth) ** 2 + ((newTouch.y - touch.y)*innerHeight) ** 2) / smallerDimension
            if(dist < closestDist){
                closest = touch
            }
        }
        if(closest){
            availableTouches.delete(closest)

            const player = new Player()
            player.touchA = newTouch
            player.touchB = closest
            players.add(new Player())

            console.log(availableTouches)
        }else{
            availableTouches.add(newTouch)
            console.log(availableTouches)
        }

        touches.set(newTouchRaw.identifier, newTouch)
    }
}
function touchMove(e) {
    for(const movedTouch of e.changedTouches){
        touches.get(movedTouch.identifier).set(movedTouch.clientX/innerWidth, movedTouch.clientY/innerHeight)
    }
}
function touchEnd(e) {
    for(const removedTouch of e.changedTouches){
        touches.get(removedTouch.identifier).set(removedTouch.clientX/innerWidth, removedTouch.clientY/innerHeight)
        touches.delete(removedTouch.identifier)
    }
}

setupControlEditorListeners()
requestAnimationFrame(controlEditor)