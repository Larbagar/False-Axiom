import {device} from "./device.mjs"
import {context, distortionTex, lightTex} from "./textureHandler.mjs"
import M3 from "../M3.mjs"
import {clear} from "./clear.mjs"
import {drawLighting} from "./light/drawLighting.mjs"
import {minBrightnessBindGroupLayout} from "./light/minBrightnessBindGroupLayout.mjs"
import {resetDistortion} from "./light/resetDistortion.mjs"
import {cameraBindGroupLayout} from "./cameraBindGroupLayout.mjs"


const minBrightness = new Float32Array([0.002]) // Max 0.002
const minBrightnessBuffer = device.createBuffer({
    label: "min brightness buffer",
    size: minBrightness.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
})
device.queue.writeBuffer(minBrightnessBuffer, 0, minBrightness)

const minBrightnessBindGroup = device.createBindGroup({
    label: "min brightness bind group",
    layout: minBrightnessBindGroupLayout,
    entries: [
        {
            binding: 0,
            resource: {
                buffer: minBrightnessBuffer
            },
        },
    ],
})


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

// pos, width, growDist, intensity
const shockwaveDescription = new Float32Array([0, 0, 0.2, 0.1, 0.1])
const shockwaveDescriptionBuffer = device.createBuffer({
    label: "shockwave description buffer",
    size: shockwaveDescription.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
})

device.queue.writeBuffer(shockwaveDescriptionBuffer, 0, shockwaveDescription)
const shockwaveProgress = new Float32Array([0.8])
const shockwaveProgressBuffer = device.createBuffer({
    label: "shockwave progress buffer",
    size: shockwaveProgress.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
})
device.queue.writeBuffer(shockwaveProgressBuffer, 0, shockwaveProgress)

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
    for(const explosion of game.explosions){
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