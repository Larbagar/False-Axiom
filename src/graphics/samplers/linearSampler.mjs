import { samplerBindGroupLayout } from "./samplerBindGroupLayout.mjs"
import { device } from "../device.mjs"

const linearSampler = device.createSampler()

const linearSamplerBindGroup = device.createBindGroup({
    layout: samplerBindGroupLayout,
    entries: [
        {
            binding: 0,
            resource: linearSampler
        },
    ],
})

export {linearSampler, linearSamplerBindGroup}