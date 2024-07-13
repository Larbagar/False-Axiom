import {device} from "./device.mjs"

const cameraBindGroupLayout = device.createBindGroupLayout({
    label: "camera bind group layout",
    entries: [
        {
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: {},
        },
        {
            binding: 1,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: {},
        }
    ]
})

export {cameraBindGroupLayout}