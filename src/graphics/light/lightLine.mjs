import { rectGeometry, rectGeometryBuffer, rectIndexBuffer } from '../rectBuffers.mjs'
import { device } from '../device.mjs'
import { transformMatrixBindGroupLayout } from "../transformMatrixBindGroupLayout.mjs"
import { minBrightnessBindGroupLayout } from "./minBrightnessBindGroupLayout.mjs"
import {cameraBindGroupLayout} from "../cameraBindGroupLayout.mjs"
import {profileView} from "../../noFullscreen.mjs"


const shaderModule = device.createShaderModule({
  label: "light line shader module",
  code: `
@group(0) @binding(0) var<uniform> camera: mat3x3f;
@group(1) @binding(0) var<uniform> transform: mat3x3f;
@group(2) @binding(0) var<uniform> minBrightness: f32;

struct VertIn {
    @location(0) geometry: vec2f,
    @location(1) a: vec2f,
    @location(2) b: vec2f,
    @location(3) col: vec3f,
}

struct VertOut {
    @builtin(position) screenPos: vec4f,
    @location(0) pos: vec2f,
    @location(1) len: f32,
    @location(2) col: vec3f,
    @location(3) minBrightnessCoeff: f32,
}

@vertex
fn vertex(in: VertIn) -> VertOut {
    let a = (transform*vec3f(in.a, 1)).xy;
    let b = (transform*vec3f(in.b, 1)).xy;
    
    let diff = b - a;
    let len = length(diff);
    let dir = diff / len;
    let perp = vec2f(-dir.y, dir.x);
    
    let minBrightnessCoeff = minBrightness / max(max(abs(in.col.r), abs(in.col.g)), abs(in.col.b));
    
    let padding = vec2f((sqrt(len * len + 4 * len / minBrightnessCoeff) - len) / 2, sqrt(len / minBrightnessCoeff));
    let pos = vec2f(len*(in.geometry.x + 1)/2, 0) + padding*in.geometry;
    
    
    var out: VertOut;
    out.screenPos = vec4f((camera*vec3(a + pos.x*dir + pos.y*perp, 1)).xy, 0, 1);
    out.pos = pos;
    out.len = len;
    out.col = in.col;
    out.minBrightnessCoeff = minBrightnessCoeff;
    
    return out;
}

struct FragIn {
    @location(0) pos: vec2f,
    @location(1) len: f32,
    @location(2) col: vec3f,
    @location(3) minBrightnessCoeff: f32,
}

@fragment
fn fragment(in: FragIn) -> @location(0) vec4f {
    let x = in.pos.x;
    let y = in.pos.y;
    let brightness = (atan((in.len - x) / y) + atan(x / y))/y - in.minBrightnessCoeff;
    ${profileView ? "" : "//"}return vec4f(brightness*max(max(in.col.r, in.col.g), in.col.b), step(max(0, brightness), 0), 1, 1);
    ${profileView ? "//" : ""}return vec4f(brightness*in.col, 1);
}

  `,
})


/** @type {GPUVertexBufferLayout} */
const geometryVertexBufferLayout = {
  arrayStride: 2*rectGeometry.BYTES_PER_ELEMENT,
  attributes: [
    {
      shaderLocation: 0,
      format: "float32x2",
      offset: 0*rectGeometry.BYTES_PER_ELEMENT,
    },
  ],
}

/** @type {GPUVertexBufferLayout} */
const posVertexBufferLayout = {
  arrayStride: 4*Float32Array.BYTES_PER_ELEMENT,
  stepMode: "instance",
  attributes: [
    {
      shaderLocation: 1,
      format: "float32x2",
      offset: 0*Float32Array.BYTES_PER_ELEMENT,
    },
    {
      shaderLocation: 2,
      format: "float32x2",
      offset: 2*Float32Array.BYTES_PER_ELEMENT,
    },
  ],
}

/** @type {GPUVertexBufferLayout} */
const colVertexBufferLayout = {
  arrayStride: 3*Float32Array.BYTES_PER_ELEMENT,
  stepMode: "instance",
  attributes: [
    {
      shaderLocation: 3,
      format: "float32x3",
      offset: 0*Float32Array.BYTES_PER_ELEMENT,
    },
  ],
}

const pipelineLayout = device.createPipelineLayout({
  label: "light line pipeline layout",
  bindGroupLayouts: [
    cameraBindGroupLayout,
    transformMatrixBindGroupLayout,
    minBrightnessBindGroupLayout,
  ],
})

/** @type {GPUBlendState} */
const blendState = {
  color: {
    operation: "add",
    srcFactor: "one",
    dstFactor: "one",
  },
  alpha: {
    operation: "add",
    srcFactor: "one",
    dstFactor: "one",
  },
}

const pipeline = device.createRenderPipeline({
  label: "light line pipeline",
  layout: pipelineLayout,
  vertex: {
    module: shaderModule,
    entryPoint: "vertex",
    buffers: [
      geometryVertexBufferLayout,
      posVertexBufferLayout,
      colVertexBufferLayout,
    ]
  },
  fragment: {
    module: shaderModule,
    entryPoint: "fragment",
    targets: [
      {
        format: "rgba16float",
        blend: blendState,
      },
    ]
  }
})

/**
 * @param {GPUCommandEncoder} encoder
 * @param {GPUTextureView} out
 * @param {GPUBindGroup} cameraBindGroup
 * @param {GPUBindGroup} transformBindGroup
 * @param {GPUBuffer} posBuffer
 * @param {GPUBuffer} colBuffer
 * @param {GPUBindGroup} minBrightnessBindGroup
 * @param {number} count
 */
function lightLine(
    encoder,
    out,
    cameraBindGroup,
    transformBindGroup,
    posBuffer,
    colBuffer,
    minBrightnessBindGroup,
    count = 1,
){
  const pass = encoder.beginRenderPass({
    label: "light line draw pass",
    colorAttachments: [
      {
        view: out,
        loadOp: "load",
        storeOp: "store",
      }
    ],
  })

  pass.setPipeline(pipeline)

  pass.setVertexBuffer(0, rectGeometryBuffer)
  pass.setVertexBuffer(1, posBuffer)
  pass.setVertexBuffer(2, colBuffer)

  pass.setBindGroup(0, cameraBindGroup)
  pass.setBindGroup(1, transformBindGroup)
  pass.setBindGroup(2, minBrightnessBindGroup)

  pass.setIndexBuffer(rectIndexBuffer, "uint16")

  pass.drawIndexed(6, count)

  pass.end()
}

export { lightLine }