import {device} from "./graphics/device.mjs"
import {context, distortionTex, lightTex} from "./graphics/textureHandler.mjs"
import M3 from "./M3.mjs"
import {clear} from "./graphics/clear.mjs"
import {resetDistortion} from "./graphics/light/resetDistortion.mjs"
import {drawLighting} from "./graphics/light/drawLighting.mjs"
import {LineGroup} from "./graphics/LineGroup.mjs"
import {minBrightnessBindGroup} from "./minBrightness.mjs"
import {Camera} from "./Camera.mjs"
import {controlEditor} from "./controlEditor.mjs"
import {noFullscreen} from "./flags.mjs"
import {states} from "./states.mjs"
import {currentState, setCurrentState} from "./appState.mjs"
import {setLoopFn} from "./loop.mjs"

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

function titleLoopFn(){
    const encoder = device.createCommandEncoder()

    const canvasView = context.getCurrentTexture().createView()

    camera.set(M3.scaleV(Math.min(innerHeight/innerWidth, 1), Math.min(innerWidth/innerHeight, 1)))

    clear(encoder, lightTex.view, [0, 0, 0, 1])

    lightGroup.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)

    resetDistortion(encoder, distortionTex.view, camera.bindGroup)

    drawLighting(encoder, canvasView, lightTex.bindGroup, camera.bindGroup, distortionTex.bindGroup)

    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])
}

function touchStart(){
}

function touchEnd(){
    if(!noFullscreen){
        document.body.requestFullscreen()
    }
    history.pushState(states.CONFIG, "",)
    document.title = "False Axiom - Config"
    removeTitleListeners()
    controlEditor()
}

function addTitleListeners(){
    addEventListener("touchstart", touchStart)
    addEventListener("touchend", touchEnd)
}
function removeTitleListeners(){
    removeEventListener("touchstart", touchStart)
    removeEventListener("touchend", touchEnd)
}

function title(){
    setCurrentState(states.TITLE)
    setLoopFn(titleLoopFn)
    addTitleListeners()
}

export {title, removeTitleListeners}