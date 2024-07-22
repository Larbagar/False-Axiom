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
import {EditorTouch} from "./EditorTouch.mjs"
import {startGame} from "./gameLoop.mjs"

setupTexutres()


/** @type {Set<Player>} */
const players = new Set()




const camera = new Camera()


function controlEditorLoop(){
    const encoder = device.createCommandEncoder()

    const canvasView = context.getCurrentTexture().createView()

    camera.set(M3.scaleV(Math.min(innerHeight/innerWidth, 1), Math.min(innerWidth/innerHeight, 1)))

    clear(encoder, lightTex.view, [0, 0, 0, 1])

    let ready = true
    for(const player of players){
        player.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)
        if(!player.lefts.size || !player.rights.size){
            ready = false
        }
    }

    resetDistortion(encoder, distortionTex.view, camera.bindGroup)

    drawLighting(encoder, canvasView, lightTex.bindGroup, camera.bindGroup, distortionTex.bindGroup)

    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])


    if(ready && players.size >= 2){
        startGame(players)
    }else {
        requestAnimationFrame(controlEditorLoop)
    }
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

/** @type {Map<number, EditorTouch>} */
const touches = new Map()
function touchStart(e){
    const smallerDimension = Math.min(innerWidth, innerHeight)
    for(const newTouchRaw of e.changedTouches){
        const newTouch = new EditorTouch(2*newTouchRaw.clientX/innerWidth - 1, 1 - 2*newTouchRaw.clientY/innerHeight)

        let closestDist = 0.5
        let closestAvailable = null
        for(const [id, touch] of touches){
            if(!touch.delegated){
                const dist = Math.sqrt(((newTouch.pos.x - touch.pos.x)*innerWidth) ** 2 + ((newTouch.pos.y - touch.pos.y)*innerHeight) ** 2) / smallerDimension
                if(dist < closestDist){
                    closestAvailable = touch
                    closestDist = dist
                }
            }
        }
        closestDist = Math.min(0.1, closestDist)
        let closestA = null
        let closestB = null
        for(const player of players){
            {
                const dist = Math.sqrt(((newTouch.pos.x - player.posA.x) * innerWidth) ** 2 + ((newTouch.pos.y - player.posA.y) * innerHeight) ** 2) / smallerDimension
                if (dist < closestDist) {
                    closestA = player
                    closestB = null
                    closestAvailable = null
                    closestDist = dist
                }
            }
            {
                const dist = Math.sqrt(((newTouch.pos.x - player.posB.x)*innerWidth) ** 2 + ((newTouch.pos.y - player.posB.y)*innerHeight) ** 2) / smallerDimension
                if (dist < closestDist) {
                    closestB = player
                    closestA = null
                    closestAvailable = null
                    closestDist = dist
                }
            }
        }
        if(closestAvailable){
            closestAvailable.delegated = true
            if(closestAvailable.player && closestAvailable.side < 0){
                closestAvailable.player.lefts.delete(closestAvailable)
            }else if(closestAvailable.player && closestAvailable.side > 0){
                closestAvailable.player.rights.delete(closestAvailable)
            }
            newTouch.delegated = true

            const player = new Player(newTouch.pos, closestAvailable.pos)
            player.setColIndex(Math.floor(Math.random()*colors.length))
            players.add(player)
        }else if(closestA) {
            newTouch.delegated = true
            closestA.posA = newTouch.pos
        }else if(closestB){
            newTouch.delegated = true
            closestB.posB = newTouch.pos
        }else{
            let closestPlayer = null
            let closestDist = Infinity
            for(const player of players){
                const dist = (
                    Math.sqrt(
                        ((newTouch.pos.x - player.posA.x)*innerWidth) ** 2 +
                        ((newTouch.pos.y - player.posA.y)*innerHeight) ** 2
                    ) + Math.sqrt(
                        ((newTouch.pos.x - player.posB.x)*innerWidth) ** 2 +
                        ((newTouch.pos.y - player.posB.y)*innerHeight) ** 2
                    ) - Math.sqrt(
                        ((player.posA.x - player.posB.x)*innerWidth) ** 2 +
                        ((player.posA.y - player.posB.y)*innerHeight) ** 2
                    )
                ) / smallerDimension
                if(dist < closestDist){
                    closestPlayer = player
                    closestDist = dist
                }
            }
            if(closestPlayer) {
                newTouch.player = closestPlayer
                const diff = closestPlayer.posB.xy.sub(closestPlayer.posA)
                const mag = diff.mag
                newTouch.side =
                    (diff.normalize().dot(newTouch.pos.xy.sub(closestPlayer.posA)) / mag * 2 - 1) *
                    Math.sign(diff.cross(closestPlayer.posA.xy.mult(-1)))
                if(newTouch.side < 0){
                    newTouch.player.lefts.add(newTouch)
                }else if(newTouch.side > 0){
                    newTouch.player.rights.add(newTouch)
                }
            }
        }

        touches.set(newTouchRaw.identifier, newTouch)
    }
}
function touchMove(e) {
    for(const movedTouch of e.changedTouches){
        touches.get(movedTouch.identifier).pos.set(2*movedTouch.clientX/innerWidth - 1, 1 - 2*movedTouch.clientY/innerHeight)
    }
}
function touchEnd(e) {
    for(const removedTouch of e.changedTouches){
        const touch = touches.get(removedTouch.identifier)
        touch.pos.set(V2.fromVals(2*removedTouch.clientX/innerWidth - 1, 1 - 2*removedTouch.clientY/innerHeight))
        touches.delete(removedTouch.identifier)
        if(touch.player && touch.side < 0){
            touch.player.lefts.delete(touch)
        }else if(touch.player && touch.side > 0){
            touch.player.rights.delete(touch)
        }
        if(!touch.delegated && touch.player){
            if(touch.side < 0){
                touch.player.setColIndex((touch.player.colIndex + 1) % colors.length)
            }else if(touch.side > 0){
                touch.player.setColIndex((touch.player.colIndex + colors.length - 1) % colors.length)
            }
        }
    }
}

function controlEditor(){
    setupControlEditorListeners()
    requestAnimationFrame(controlEditorLoop)
}

export {controlEditor}