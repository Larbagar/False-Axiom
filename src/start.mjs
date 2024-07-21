import {canvas, context, distortionTex, lightTex, setupTexutres} from "./graphics/textureHandler.mjs"
import V2 from "./V2.mjs"
import {Player} from "./Player.mjs"
import {Camera} from "./Camera.mjs"
import {device} from "./graphics/device.mjs"
import M3 from "./M3.mjs"
import {clear} from "./graphics/clear.mjs"
import {resetDistortion} from "./graphics/light/resetDistortion.mjs"
import {drawLighting} from "./graphics/light/drawLighting.mjs"
import {minBrightnessBindGroup} from "./minBrightness.mjs"
import {colors} from "./colors.mjs"

setupTexutres()


/** @type {Set<Player>} */
const players = new Set()




const camera = new Camera()

function controlEditor(){
    const encoder = device.createCommandEncoder()

    const canvasView = context.getCurrentTexture().createView()

    camera.set(M3.scaleV(Math.min(innerHeight/innerWidth, 1), Math.min(innerWidth/innerHeight, 1)))

    clear(encoder, lightTex.view, [0, 0, 0, 1])

    for(const player of players){
        player.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)
    }

    resetDistortion(encoder, distortionTex.view, camera.bindGroup)

    drawLighting(encoder, canvasView, lightTex.bindGroup, camera.bindGroup, distortionTex.bindGroup)

    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])

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
    addEventListener("touchmove", touchMove)
    addEventListener("touchend", touchEnd)
}

/** @type {Set<V2>} */
const availableTouches = new Set()
/** @type {Map<number, V2>} */
const touches = new Map()
function touchStart(e){
    const smallerDimension = Math.min(innerWidth, innerHeight)
    for(const newTouchRaw of e.changedTouches){
        const newTouch = V2.fromVals(2*newTouchRaw.clientX/innerWidth - 1, 1 - 2*newTouchRaw.clientY/innerHeight)

        let closestDist = 0.5
        let closestAvailable = null
        for(const touch of availableTouches){
            const dist = Math.sqrt(((newTouch.x - touch.x)*innerWidth) ** 2 + ((newTouch.y - touch.y)*innerHeight) ** 2) / smallerDimension
            if(dist < closestDist){
                closestAvailable = touch
                closestDist = dist
            }
        }
        let closestA = null
        let closestB = null
        for(const player of players){
            {
                const dist = Math.sqrt(((newTouch.x - player.touchA.x) * innerWidth) ** 2 + ((newTouch.y - player.touchA.y) * innerHeight) ** 2) / smallerDimension
                if (dist < closestDist) {
                    closestA = player
                    closestB = null
                    closestAvailable = null
                    closestDist = dist
                }
            }
            {
                const dist = Math.sqrt(((newTouch.x - player.touchB.x)*innerWidth) ** 2 + ((newTouch.y - player.touchB.y)*innerHeight) ** 2) / smallerDimension
                if (dist < closestDist) {
                    closestB = player
                    closestA = null
                    closestAvailable = null
                    closestDist = dist
                }
            }
        }
        if(closestAvailable){
            availableTouches.delete(closestAvailable)

            const player = new Player(newTouch, closestAvailable)
            player.setColIndex(Math.floor(Math.random()*colors.length))
            players.add(player)
        }else if(closestA) {
            closestA.touchA = newTouch
        }else if(closestB){
            closestB.touchB = newTouch
        }else{
            availableTouches.add(newTouch)
        }

        touches.set(newTouchRaw.identifier, newTouch)
    }
}
function touchMove(e) {
    for(const movedTouch of e.changedTouches){
        touches.get(movedTouch.identifier).set(2*movedTouch.clientX/innerWidth - 1, 1 - 2*movedTouch.clientY/innerHeight)
    }
}
function touchEnd(e) {
    for(const removedTouch of e.changedTouches){
        const touch = touches.get(removedTouch.identifier)
        touch.set(2*removedTouch.clientX/innerWidth - 1, 1 - 2*removedTouch.clientY/innerHeight)
        touches.delete(removedTouch.identifier)
        availableTouches.delete(touch)
    }
}

setupControlEditorListeners()
requestAnimationFrame(controlEditor)