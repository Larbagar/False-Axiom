import { device } from "../device.mjs"

const samplerBindGroupLayout = device.createBindGroupLayout({
    label: "sampler bind group layout",
    entries: [
        {
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {},
        },
    ]
})

export {samplerBindGroupLayout}