import {device} from "./graphics/device.mjs"
import {minBrightnessBindGroupLayout} from "./graphics/light/minBrightnessBindGroupLayout.mjs"
import {highGraphics} from "./flags.mjs"

const minBrightness = new Float32Array([highGraphics ? 0.002 : 0.005]) // Max 0.002
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

export {minBrightnessBindGroup}