import {device} from "../device.mjs"
import {rectGeometry, rectGeometryBuffer, rectIndexBuffer} from "../rectBuffers.mjs"
import {transformMatrixBindGroupLayout} from "../transformMatrixBindGroupLayout.mjs"
import {cameraBindGroupLayout} from "../cameraBindGroupLayout.mjs"

const shaderModule = device.createShaderModule({
    label: "clear distortion shader module",
    code: `
@group(0) @binding(1) var<uniform> inverseCamera: mat3x3f;

struct VertIn {
    @location(0) geometry: vec2f,
}

struct VertOut {
    @builtin(position) screenPos: vec4f,
    @location(0) pos: vec2f,
}

@vertex
fn vertex(in: VertIn) -> VertOut {
    var out: VertOut;
    out.screenPos = vec4f(in.geometry, 0, 1);
    out.pos = (inverseCamera*vec3(in.geometry, 1)).xy;
    
    return out;
}

struct FragIn {
    @location(0) pos: vec2f,
}

@fragment
fn fragment(in: FragIn) -> @location(0) vec2f {
    return in.pos;
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

const pipelineLayout = device.createPipelineLayout({
    label: "light point pipeline layout",
    bindGroupLayouts: [
        // Inverse camera
        cameraBindGroupLayout,
    ],
})

const pipeline = device.createRenderPipeline({
    label: "reset distortion pipeline",
    layout: pipelineLayout,
    vertex: {
        module: shaderModule,
        entryPoint: "vertex",
        buffers: [
            geometryVertexBufferLayout,
        ]
    },
    fragment: {
        module: shaderModule,
        entryPoint: "fragment",
        targets: [
            {
                format: "rg16float",
            },
        ]
    }
})

function resetDistortion(
    encoder,
    out,
    cameraBindGroup,
){
    const pass = encoder.beginRenderPass({
        label: "",
        colorAttachments: [
            {
                view: out,
                loadOp: "clear",
                storeOp: "store",
            },
        ],
    })

    pass.setPipeline(pipeline)

    pass.setVertexBuffer(0, rectGeometryBuffer)

    pass.setBindGroup(0, cameraBindGroup)

    pass.setIndexBuffer(rectIndexBuffer, "uint16")

    pass.drawIndexed(6)

    pass.end()
}

export {resetDistortion}