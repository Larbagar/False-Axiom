import { device } from "../device.mjs"

export const minBrightnessBindGroupLayout = device.createBindGroupLayout({
    label: "min brightness bind group layout",
    entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: {},
    }],
})