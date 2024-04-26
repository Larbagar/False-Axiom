import { rectGeometry, rectGeometryBuffer, rectIndexBuffer } from './rectBuffers.mjs'
import { device } from './device.mjs'


const shaderModule = device.createShaderModule({
  label: "light line shader module",
  code: `
@group(0) @binding(0) var<uniform> minBrightness: f32;

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
}

@vertex
fn vertex(in: VertIn) -> VertOut {
    let diff = b - a;
    let len = length(diff);
    let dir = diff / len;
    let perp = vec2f(-dir.y, dir.x);
    
    let relPos = vec2f((len-sqrt(len*len + 4*len/minBrightness))/2, )
    let pos = (a + b + geometry.x * diff) / 2 + (geometry.x * dir + geometry.y * perp) / minBrightness;
    
    
    let out: VertOut;
    out.pos = pos
    out.screenPos = 
    
}

struct FragIn {
    @location(0) pos: vec2f,
    @location(1) col: vec3f,
}

@fragment
fn fragment(in: FragIn) -> @location(0) vec4f {
    // TODO
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
      shaderLocation: 1,
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

const minBrightnessBindGroupLayout = device.createBindGroupLayout({
  label: "min brightness bind group layout",
  entries: [{
    binding: 0,
    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
    buffer: {},
  }],
})

const pipelineLayout = device.createPipelineLayout({
  label: "radial light pipeline layout",
  bindGroupLayouts: [
    minBrightnessBindGroupLayout
    // transformMatrixBindGroupLayout,
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
 * @param {GPUTextureView} view
 * @param {GPUBuffer} posBuffer
 * @param {GPUBuffer} colBuffer
 * @param {number} count
 */
function drawLightLine(
  encoder,
  view,
  posBuffer,
  colBuffer,
  // camera,
  // minBrightness,
  count = 1,
){
  const pass = encoder.beginRenderPass({
    label: "light line render pass",
    colorAttachments: [
      {
        view: view,
        loadOp: "load",
        storeOp: "store",
      }
    ],
  })

  pass.setPipeline(pipeline)

  pass.setVertexBuffer(0, rectGeometryBuffer)
  pass.setVertexBuffer(1, posBuffer)
  pass.setVertexBuffer(2, colBuffer)

  pass.setIndexBuffer(rectIndexBuffer, "uint16")

  pass.drawIndexed(6, count)
}