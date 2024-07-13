import {device} from "../device.mjs"
import {rectGeometry} from "../rectBuffers.mjs"

const shaderModule = device.createShaderModule({
    label: "shockwave shader module",
    code: `

@group(0) @binding(0) camera;

struct VertIn {
    @location(0) geometry: vec2f,
    @location(1) progress: f32,
    @location(2) pos: vec2f,
    @location(3) size: f32,
    @location(4) intensity: f32,
}
struct VertOut {
    @builtin(position) screenPos: vec4f,
    @location(0) position: vec2f,
    @location(1) progress: f32,
    @location(2) intensity: f32,
}

@vertex
fn vertex(in: VertIn) -> VertOut {
    var out: VertOut;
    out.screenPos = (camera*vec3f(in.geometry*in.size*progress + in.pos, 0)).xy;
    out.position = in.geometry;
    out.progress = in.progress;
    out.intensity = in.intensity*in.size;
    
    return out;
}

struct fragIn {
    @location(0) position: vec2f,
    @location(1) progress: f32,
}

@fragment
fn fragment(in: FragIn) -> @location(0) vec2f {
    let dist = len(in.position);
    
    return in.position;
}

    `
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
    arrayStride: 2*Float32Array.BYTES_PER_ELEMENT,
    stepMode: "instance",
    attributes: [
        {
            shaderLocation: 1,
            format: "float32x2",
            offset: 0*Float32Array.BYTES_PER_ELEMENT,
        },
    ],
}