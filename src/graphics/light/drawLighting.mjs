import { linearSamplerBindGroup } from "../samplers/linearSampler.mjs"
import { samplerBindGroupLayout } from "../samplers/samplerBindGroupLayout.mjs"
import { textureBindGroupLayout } from "../textureBindGroupLayout.mjs"
import { device } from "../device.mjs"
import { canvasFormat } from "../textureHandler.mjs"
import {transformMatrixBindGroupLayout} from "../transformMatrixBindGroupLayout.mjs"

const geometry = new Float32Array([
    -1, -1,
    -1, 1,
    1, -1,
    1, 1,
])
const geometryBuffer = device.createBuffer({
    label: "apply lighting geometry buffer",
    size: geometry.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
})
device.queue.writeBuffer(geometryBuffer, 0, geometry)

const indices = new Uint16Array([
    0, 1, 2,
    1, 2, 3,
])
const indexBuffer = device.createBuffer({
    label: "apply lighting index buffer",
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
})
device.queue.writeBuffer(indexBuffer, 0, indices)

const shaderModule = device.createShaderModule({
    label: "apply lighting shader module",
    code: `

@group(0) @binding(0) var linearSampler: sampler;
@group(1) @binding(0) var lighting: texture_2d<f32>;
@group(2) @binding(0) var<uniform> camera: mat3x3<f32>;
@group(3) @binding(0) var distortion: texture_2d<f32>;

struct VertIn {
    @location(0) geometry: vec2f,
}

struct VertOut {
    @builtin(position) screenPos: vec4f,
    @location(0) texPos: vec2f,
}


@vertex
fn vertex(in: VertIn) -> VertOut {
    var out: VertOut;
    out.screenPos = vec4f(in.geometry, 0, 1);
    out.texPos = (in.geometry*vec2f(1, -1) + 1)/2;

    return out;
}

struct fragIn{
    @location(0) texPos: vec2f,
}

fn map(x: vec3f) -> vec3f {
    return x/(x+1);
}

@fragment
fn fragment(in: fragIn) -> @location(0) vec4f {
    let background = vec3f(1);

    let samplePos = ((camera*vec3(textureSample(distortion, linearSampler, in.texPos).rg, 1)).xy*vec2f(1, -1) + 1)/2;
    let brightness = max(vec3(0, 0, 0), textureSample(lighting, linearSampler, samplePos).rgb);
    //return vec4f(step(samplePos.xyy, vec3f(0.9)), 1);
    return vec4f(background*map(brightness), 1);
}
    `
})

const geometryVertexBufferLayout = {
    arrayStride: 2*geometry.BYTES_PER_ELEMENT,
    attributes: [
        {
            shaderLocation: 0,
            format: "float32x2",
            offset: 0,
        },
    ],
}

const pipelineLayout = device.createPipelineLayout({
    label: "apply lighting pipeline layout",
    bindGroupLayouts: [
        // Sampler
        samplerBindGroupLayout,
        // Lighting
        textureBindGroupLayout,
        // Camera
        transformMatrixBindGroupLayout,
        // Distortion
        textureBindGroupLayout,
    ],
})

const pipeline = device.createRenderPipeline({
    label: "apply lighting pipeline",
    layout: pipelineLayout,
    vertex: {
        module: shaderModule,
        entryPoint: "vertex",
        buffers: [
            geometryVertexBufferLayout,
        ],
    },
    fragment: {
        module: shaderModule,
        entryPoint: "fragment",
        targets: [
            {
                format: canvasFormat,
            },
        ],
    },
})

/**
 * @param {GPUCommandEncoder} encoder
 * @param {GPUTextureView} out
 * @param {GPUBindGroup} lighting
 * @param {GPUBindGroup} camera
 * @param {GPUBindGroup} distortion
 */
function drawLighting(encoder, out, lighting, camera, distortion){
    const pass = encoder.beginRenderPass({
        label: "apply lighting draw pass",
        colorAttachments: [
            {
                view: out,
                loadOp: "clear",
                storeOp: "store",
            },
        ],
    })

    pass.setPipeline(pipeline)
    pass.setBindGroup(0, linearSamplerBindGroup)
    pass.setBindGroup(1, lighting)
    pass.setBindGroup(2, camera)
    pass.setBindGroup(3, distortion)
    pass.setVertexBuffer(0, geometryBuffer)
    pass.setIndexBuffer(indexBuffer, "uint16")

    pass.drawIndexed(6, 1)

    pass.end()
}

export {drawLighting}