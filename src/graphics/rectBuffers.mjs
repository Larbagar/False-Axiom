import { device } from './device.mjs'

const rectGeometry = new Float32Array([
  -1, -1,
  -1, 1,
  1, 1,
  1, -1,
])
const rectGeometryBuffer = device.createBuffer({
  label: "rect geometry buffer",
  size: rectGeometry.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
})
device.queue.writeBuffer(rectGeometryBuffer, 0, rectGeometry)


const rectIndices = new Uint16Array([
  0, 1, 2,
  1, 2, 3,
])
const rectIndexBuffer = device.createBuffer({
  label: "rect index buffer",
  size: rectIndices.byteLength,
  usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
})
device.queue.writeBuffer(rectIndexBuffer, 0, rectIndices)

export {
  rectGeometry,
  rectGeometryBuffer,

  rectIndices,
  rectIndexBuffer,
}