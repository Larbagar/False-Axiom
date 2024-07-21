import {device} from "./device.mjs"
import {context, distortionTex, lightTex} from "./textureHandler.mjs"
import M3 from "../M3.mjs"
import {clear} from "./clear.mjs"
import {drawLighting} from "./light/drawLighting.mjs"
import {minBrightnessBindGroupLayout} from "./light/minBrightnessBindGroupLayout.mjs"
import {resetDistortion} from "./light/resetDistortion.mjs"
import {cameraBindGroupLayout} from "./cameraBindGroupLayout.mjs"
import {minBrightnessBindGroup} from "../minBrightness.mjs"




const cameraBuffer = device.createBuffer({
    label: "camera buffer",
    size: M3.BYTE_LENGTH,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
})
const inverseCameraBuffer = device.createBuffer({
    label: "inverse camera buffer",
    size: M3.BYTE_LENGTH,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
})
const cameraBindGroup = device.createBindGroup({
    label: "camera bind group",
    layout: cameraBindGroupLayout,
    entries: [
        {
            binding: 0,
            resource: {
                buffer: cameraBuffer,
            },
        },
        {
            binding: 1,
            resource: {
                buffer: inverseCameraBuffer,
            },
        },
    ],
})

/**
 * @param {Game} game
 */
function draw(game){
    const encoder = device.createCommandEncoder()

    const canvasView = context.getCurrentTexture().createView()


    const camera = M3.scaleV(Math.min(1, innerHeight/innerWidth), Math.min(1, innerWidth/innerHeight))
    device.queue.writeBuffer(cameraBuffer, 0, camera.arr)
    const inverseCamera = camera.inverse()
    device.queue.writeBuffer(inverseCameraBuffer, 0, inverseCamera.arr)

    clear(encoder, lightTex.view, [0, 0, 0, 1])
    for(const ship of game.ships){
        ship.draw(encoder, lightTex.view, cameraBindGroup, minBrightnessBindGroup)
    }
    for(const wall of game.walls){
        wall.draw(encoder, lightTex.view, cameraBindGroup, minBrightnessBindGroup)
    }
    for(const blast of game.blasts){
        blast.draw(encoder, lightTex.view, cameraBindGroup, minBrightnessBindGroup)
    }
    for(const rubbleCluster of game.rubbleClusters){
        rubbleCluster.draw(encoder, lightTex.view, cameraBindGroup, minBrightnessBindGroup)
    }
    for(const explosion of game.particleClusters){
        explosion.draw(encoder, lightTex.view, cameraBindGroup, minBrightnessBindGroup)
    }

    resetDistortion(encoder, distortionTex.view, cameraBindGroup)
    for(const shockwave of game.shockwaves){
        shockwave.draw(encoder, distortionTex.view, cameraBindGroup)
    }

    drawLighting(encoder, canvasView, lightTex.bindGroup, cameraBindGroup, distortionTex.bindGroup)

    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])
}

export {draw}