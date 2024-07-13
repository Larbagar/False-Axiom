import {device} from "../device.mjs"
import {rectGeometry, rectGeometryBuffer, rectIndexBuffer} from "../rectBuffers.mjs"
import {transformMatrixBindGroupLayout} from "../transformMatrixBindGroupLayout.mjs"
import {minBrightnessBindGroupLayout} from "./minBrightnessBindGroupLayout.mjs"
import {cameraBindGroupLayout} from "../cameraBindGroupLayout.mjs"

const shaderModule = device.createShaderModule({
    label: "shockwave shader module",
    code: `

@group(0) @binding(0) var<uniform> camera: mat3x3f;

struct VertIn {
    @location(0) geometry: vec2f,
    @location(1) pos: vec2f,
    @location(2) width: f32,
    @location(3) growDist: f32,
    @location(4) intensity: f32,
    @location(5) progress: f32,
}
struct VertOut {
    @builtin(position) screenPos: vec4f,
    @location(0) position: vec2f,
    @location(1) width: f32,
    @location(2) growDist: f32,
    @location(3) intensity: f32,
    @location(4) progress: f32,
}

@vertex
fn vertex(in: VertIn) -> VertOut {
    var out: VertOut;
    out.screenPos = vec4f((camera*vec3f(in.geometry*(in.progress + in.width) + in.pos, 1)).xy, 0, 1);
    out.position = in.geometry*(in.progress + in.width);
    out.width = in.width;
    out.growDist = in.growDist;
    out.intensity = in.intensity;
    out.progress = in.progress;
    
    return out;
}

struct FragIn {
    @location(0) position: vec2f,
    @location(1) width: f32,
    @location(2) growDist: f32,
    @location(3) intensity: f32,
    @location(4) progress: f32,
}

@fragment
fn fragment(in: FragIn) -> @location(0) vec2f {
    let dist = length(in.position);
    
    let wave = step(dist, in.progress + in.width)*in.progress*dist*pow(dist - (in.progress + in.width), 2)/(pow(in.progress, 2) + pow(in.growDist, 2))/(pow(dist - in.progress, 2) + pow(in.width, 2)); 
    
    return -in.intensity*in.position/dist*wave;
}

    `
})

const pipelineLayout = device.createPipelineLayout({
    label: "shockwave pipeline layout",
    bindGroupLayouts: [
        cameraBindGroupLayout,
    ],
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
const descriptionVertexBufferLayout = {
    arrayStride: 5*Float32Array.BYTES_PER_ELEMENT,
    stepMode: "instance",
    attributes: [
        // Position
        {
            shaderLocation: 1,
            format: "float32x2",
            offset: 0*Float32Array.BYTES_PER_ELEMENT,
        },
        // Width
        {
            shaderLocation: 2,
            format: "float32",
            offset: 2*Float32Array.BYTES_PER_ELEMENT,
        },
        // Grow Distance
        {
            shaderLocation: 3,
            format: "float32",
            offset: 3*Float32Array.BYTES_PER_ELEMENT,
        },
        // Intensity
        {
            shaderLocation: 4,
            format: "float32",
            offset: 4*Float32Array.BYTES_PER_ELEMENT,
        },
    ],
}

/** @type {GPUVertexBufferLayout} */
const progressVertexBufferLayout = {
    arrayStride: 1*Float32Array.BYTES_PER_ELEMENT,
    stepMode: "instance",
    attributes: [
        {
            shaderLocation: 5,
            format: "float32",
            offset: 0*Float32Array.BYTES_PER_ELEMENT,
        },
    ],
}

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
    label: "light point pipeline",
    layout: pipelineLayout,
    vertex: {
        module: shaderModule,
        entryPoint: "vertex",
        buffers: [
            geometryVertexBufferLayout,
            descriptionVertexBufferLayout,
            progressVertexBufferLayout,
        ]
    },
    fragment: {
        module: shaderModule,
        entryPoint: "fragment",
        targets: [
            {
                format: "rg16float",
                blend: blendState,
            },
        ]
    }
})

function shockwave(
    encoder,
    out,
    cameraBindGroup,
    descriptionBuffer,
    progressBuffer,
    count = 1,
){
    const pass = encoder.beginRenderPass({
        label: "light point draw pass",
        colorAttachments: [
            {
                view: out,
                loadOp: "load",
                storeOp: "store",
            },
        ],
    })


    pass.setPipeline(pipeline)

    pass.setVertexBuffer(0, rectGeometryBuffer)
    pass.setVertexBuffer(1, descriptionBuffer)
    pass.setVertexBuffer(2, progressBuffer)

    pass.setBindGroup(0, cameraBindGroup)

    pass.setIndexBuffer(rectIndexBuffer, "uint16")

    pass.drawIndexed(6, count)

    pass.end()
}

export {shockwave}