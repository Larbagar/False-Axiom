import {device} from "./graphics/device.mjs";
import {canvas, context, lightTex} from "./graphics/textureHandler.mjs";
import M3 from "./M3.mjs";
import {clear} from "./graphics/clear.mjs";
import {drawLighting} from "./graphics/light/drawLighting.mjs";
import {LightTex} from "./graphics/light/LightTex.mjs";
import V2 from "./V2.mjs";
import {minBrightnessBindGroupLayout} from "./graphics/light/minBrightnessBindGroupLayout.mjs";
import {transformMatrixBindGroupLayout} from "./graphics/transformMatrixBindGroupLayout.mjs";


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
 * @param {Simulation} simulation
 */
function render(simulation){
    const encoder = device.createCommandEncoder()

    const canvasView = context.getCurrentTexture().createView()


    const camera = M3.scaleV(Math.min(1, innerHeight/innerWidth), Math.min(1, innerWidth/innerHeight))
    device.queue.writeBuffer(cameraBuffer, 0, camera.arr)

    clear(encoder, lightTex.view, [0, 0, 0, 1])

    for(const ship of simulation.ships){
        ship.draw(encoder, lightTex.view, cameraBindGroup, minBrightnessBindGroup)
    }
    for(const wall of simulation.walls){
        wall.draw(encoder, lightTex.view, cameraBindGroup, minBrightnessBindGroup)
    }
    drawLighting(encoder, canvasView, lightTex.bindGroup)

    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])
}

export {render}