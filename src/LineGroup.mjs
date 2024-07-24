import {device} from "./graphics/device.mjs"
import {lightLine} from "./graphics/light/lightLine.mjs"
import {identityBindGroup, transformMatrixBindGroupLayout} from "./graphics/transformMatrixBindGroupLayout.mjs"
import M3 from "./M3.mjs"

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

    /** @type {boolean} */
    useTransform = false
    /** @type {M3} */
    transform = null
    /** @type {GPUBuffer} */
    transformBuffer = null
    /** @type {GPUBindGroup} */
    transformBindGroup

    posChanged = false
    colChanged = false
    transformChanged = false

    constructor(count, useTransform = false) {
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
        if(useTransform){
            this.useTransform = true
            this.transformBuffer = device.createBuffer({
                label: "line group transform matrix buffer",
                size: M3.BYTE_LENGTH,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            })
            this.transformBindGroup = device.createBindGroup({
                label: "line group transform matrix bind group",
                layout: transformMatrixBindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: this.transformBuffer
                        },
                    },
                ],
            })
        }else{
            this.transformBindGroup = identityBindGroup
        }
    }
    updatePosBuffer(){
        device.queue.writeBuffer(this.posBuffer, 0, this.pos)
    }
    updateColBuffer(){
        device.queue.writeBuffer(this.colBuffer, 0, this.col)
    }
    updateTransformBuffer(){
        device.queue.writeBuffer(this.transformBuffer, 0, this.transform.arr)
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
        if(this.transformChanged){
            this.updateTransformBuffer()
            this.transformChanged = false
        }
        lightLine(encoder, lightTex, cameraBindGroup, this.transformBindGroup, this.posBuffer, this.colBuffer, minBrightnessBindGroup, this.count)
    }
}

export {LineGroup}