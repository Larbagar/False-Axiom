import {device} from "./graphics/device.mjs"
import {lightLine} from "./graphics/light/lightLine.mjs"
import {identityBindGroup} from "./graphics/transformMatrixBindGroupLayout.mjs"

class LineGroup {
    /** @type {number} */
    count
    /** @type {Float32Array} */
    pos
    /** @type {GPUBuffer} */
    posBuffer
    /** @type {Float32Array} */
    col
    /** @type {GPUBuffer} */
    colBuffer

    posChanged = false
    colChanged = false

    constructor(count) {
        this.count = count
        this.pos = new Float32Array(4*this.count)
        this.posBuffer = device.createBuffer({
            label: "line group position buffer",
            size: this.pos.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
        this.col = new Float32Array(3*this.count)
        this.colBuffer = device.createBuffer({
            label: "line group color buffer",
            size: this.col.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
    }
    updatePosBuffer(){
        device.queue.writeBuffer(this.posBuffer, 0, this.pos)
    }
    updateColBuffer(){
        device.queue.writeBuffer(this.colBuffer, 0, this.col)
    }
    draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup){
        if(this.posChanged){
            this.updatePosBuffer()
            this.posChanged = false
        }
        if(this.colChanged){
            this.updateColBuffer()
            this.colChanged = false
        }
        lightLine(encoder, lightTex, cameraBindGroup, identityBindGroup, this.posBuffer, this.colBuffer, minBrightnessBindGroup, this.count)
    }
}

export {LineGroup}