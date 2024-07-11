import {device} from "./device.mjs";
import {canvas, context, lightTex} from "./textureHandler.mjs";
import M3 from "../M3.mjs";
import {clear} from "./clear.mjs";
import {drawLighting} from "./light/drawLighting.mjs";
import {LightTex} from "./light/LightTex.mjs";
import V2 from "../V2.mjs";
import {minBrightnessBindGroupLayout} from "./light/minBrightnessBindGroupLayout.mjs";
import {transformMatrixBindGroupLayout} from "./transformMatrixBindGroupLayout.mjs";


const minBrightness = new Float32Array([0.0002]) // Max 0.002
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
    label: "ship transform buffer",
    size: M3.BYTE_LENGTH,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
})
const cameraBindGroup = device.createBindGroup({
    label: "ship transform bind group",
    layout: transformMatrixBindGroupLayout,
    entries: [
        {
            binding: 0,
            resource: {
                buffer: cameraBuffer,
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
    drawLighting(encoder, canvasView, lightTex.bindGroup)

    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])
}

export {draw}