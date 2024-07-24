import {device} from "./graphics/device.mjs"
import {context, distortionTex, lightTex} from "./graphics/textureHandler.mjs"
import M3 from "./M3.mjs"
import {clear} from "./graphics/clear.mjs"
import {resetDistortion} from "./graphics/light/resetDistortion.mjs"
import {drawLighting} from "./graphics/light/drawLighting.mjs"
import {LineGroup} from "./LineGroup.mjs"
import {minBrightnessBindGroup} from "./minBrightness.mjs"
import {Camera} from "./Camera.mjs"

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

function mainMenu(){
    const encoder = device.createCommandEncoder()

    const canvasView = context.getCurrentTexture().createView()

    camera.set(M3.scaleV(Math.min(innerHeight/innerWidth, 1), Math.min(innerWidth/innerHeight, 1)))

    clear(encoder, lightTex.view, [0, 0, 0, 1])

    lightGroup.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)

    resetDistortion(encoder, distortionTex.view, camera.bindGroup)

    drawLighting(encoder, canvasView, lightTex.bindGroup, camera.bindGroup, distortionTex.bindGroup)

    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])

    requestAnimationFrame(mainMenu)
}

export {mainMenu}