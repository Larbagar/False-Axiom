import {device} from "./graphics/device.mjs"
import {context, distortionTex, lightTex} from "./graphics/textureHandler.mjs"
import M3 from "./M3.mjs"
import {clear} from "./graphics/clear.mjs"
import {resetDistortion} from "./graphics/light/resetDistortion.mjs"
import {drawLighting} from "./graphics/light/drawLighting.mjs"
import {LineGroup} from "./LineGroup.mjs"
import {minBrightnessBindGroup} from "./minBrightness.mjs"
import {Camera} from "./Camera.mjs"
import {controlEditor} from "./controlEditor.mjs"
import {noFullscreen} from "./noFullscreen.mjs"
import {states} from "./states.mjs"

const lightGroup = new LineGroup(2, true)
lightGroup.pos.set([
    -1/2, -1, 1/2, 0,
    -1/2, 1, 1/2, 0,
])
lightGroup.col.set([
    0.1, 0.1, 0.1,
    0.1, 0.1, 0.1,
])
lightGroup.transform = M3.scaleS(0.5)
lightGroup.updatePosBuffer()
lightGroup.updateColBuffer()
lightGroup.updateTransformBuffer()



const camera = new Camera()

let doLoop = false

function mainMenuLoop(){
    const encoder = device.createCommandEncoder()

    const canvasView = context.getCurrentTexture().createView()

    camera.set(M3.scaleV(Math.min(innerHeight/innerWidth, 1), Math.min(innerWidth/innerHeight, 1)))

    clear(encoder, lightTex.view, [0, 0, 0, 1])

    lightGroup.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)

    resetDistortion(encoder, distortionTex.view, camera.bindGroup)

    drawLighting(encoder, canvasView, lightTex.bindGroup, camera.bindGroup, distortionTex.bindGroup)

    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])

    if(doLoop) {
        requestAnimationFrame(mainMenuLoop)
    }
}

function touchStart(){
}

function touchEnd(){
    if(!noFullscreen){
        document.body.requestFullscreen()
    }
    history.pushState(states.CONFIG, "",)
    document.title = "False Axiom - Config"
    doLoop = false
    removeMainMenuListeners()
    controlEditor()
}

function addMainMenuListeners(){
    addEventListener("touchstart", touchStart)
    addEventListener("touchend", touchEnd)
}
function removeMainMenuListeners(){
    removeEventListener("touchstart", touchStart)
    removeEventListener("touchend", touchEnd)
}

function mainMenu(){
    doLoop = true
    addMainMenuListeners()
    requestAnimationFrame(mainMenuLoop)
}

export {mainMenu}