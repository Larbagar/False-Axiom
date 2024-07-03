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

const identity = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
])
const identityBuffer = device.createBuffer({
  label: "identity buffer",
  size: identity.byteLength,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
})
device.queue.writeBuffer(identityBuffer, 0, identity)
const identityBindGroup = device.createBindGroup({
  label: "identity bind group layout",
  layout: transformMatrixBindGroupLayout,
  entries: [
    {
      binding: 0,
      resource: {
        buffer: identityBuffer,
      },
    },
  ],
})

export {transformMatrixBindGroupLayout, identityBindGroup}