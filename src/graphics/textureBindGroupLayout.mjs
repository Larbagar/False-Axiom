import { device } from "./device.mjs"

const textureBindGroupLayout = device.createBindGroupLayout({
    label: "texture bind group layout",
    entries: [
        {
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            texture: {},
        },
    ],
})

export {textureBindGroupLayout}