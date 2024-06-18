import { device } from './device.mjs'

const canvas = document.getElementById("canvas")


const canvasFormat = navigator.gpu.getPreferredCanvasFormat()

const context = canvas.getContext("webgpu")
context.configure({
  device: device,
  format: canvasFormat,
})

export {canvas, context, canvasFormat}