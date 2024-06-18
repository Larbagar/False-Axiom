import { device } from "./graphics/device.mjs"
import { canvas, context } from "./graphics/canvasSetup.mjs"
import { LightTex } from "./graphics/light/LightTex.mjs"
import { lightLine, minBrightnessBindGroupLayout } from "./graphics/light/lightLine.mjs"
import { drawLighting } from "./graphics/light/drawLighting.mjs"
import V2 from "./V2.mjs"
import { shipGeometries } from "./shipGeometries.mjs"
import { clear } from "./graphics/clear.mjs"
import { Ship } from "./Ship.mjs"
import { KeyboardController } from "./KeyboardController.mjs"
import { transformMatrixBindGroupLayout } from "./graphics/transformMatrixBindGroupLayout.mjs"

function resize() {
    canvas.width = innerWidth
    canvas.height = innerHeight
}
addEventListener("resize", resize)
resize()

const minBrightness = new Float32Array([0.0002]) // 0.002
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

let lightTex = new LightTex(V2.fromVals(innerWidth, innerHeight))

addEventListener("resize", _ => {
    lightTex = new LightTex(V2.fromVals(innerWidth, innerHeight))
})

const controller = new KeyboardController()
addEventListener("keydown", e => controller.keydown(e.code))
addEventListener("keyup", e => controller.keyup(e.code))
addEventListener("blur", _ => controller.blur())
const ship = new Ship(V2.fromVals(0, 0), 0, controller)

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

function render() {
    const encoder = device.createCommandEncoder()

    const canvasView = context.getCurrentTexture().createView()


    ship.update()
    ship.move()


    const camera = M3.identity()
    device.queue.writeBuffer(cameraBuffer, 0, camera.arr)

    // clear(encoder, lightTex.view, [0, 0, 0, 1])
    ship.draw(encoder, lightTex, minBrightnessBindGroup, cameraBindGroup)
    drawLighting(encoder, canvasView, lightTex.bindGroup)

    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])
    requestAnimationFrame(render)
}

requestAnimationFrame(render)