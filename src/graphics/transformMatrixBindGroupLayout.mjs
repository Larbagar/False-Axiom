import { device } from './device.mjs'

const transformMatrixBindGroupLayout = device.createBindGroupLayout({
  label: "transform matrix bind group layout",
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.VERTEX,
      buffer: {},
    }
  ]
})

export {transformMatrixBindGroupLayout}