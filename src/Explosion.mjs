import {device} from "./graphics/device.mjs"
import {lightPoint} from "./graphics/light/lightPoint.mjs"
import {identityBindGroup} from "./graphics/transformMatrixBindGroupLayout.mjs"

class Explosion {
    /** @type {number} */
    count
    /** @type {Float32Array} */
    posArr
    /** @type {Float32Array} */
    velArr
    /** @type {Float32Array} */
    colArr
    /** @type {GPUBuffer} */
    posBuffer
    /** @type {GPUBuffer} */
    colBuffer

    changed = true
    /**
     * @param {number} count
     * @param {number} col
     * @param {V2} pos
     * @param {number} avgVel
     */
    constructor(count, col, pos, avgVel) {
        this.count = count
        this.posArr = new Float32Array(2*count)
        this.colArr = new Float32Array(3*count)
        let tot = 0
        for(let i = 0; i < count; i++){
            const brightness = Math.acos(1 - 2*Math.random())/Math.PI
            this.colArr[3*i + 0] = brightness*col[0]
            this.colArr[3*i + 1] = brightness*col[1]
            this.colArr[3*i + 2] = brightness*col[2]
            this.posArr[2*i + 0] = pos.x
            this.posArr[2*i + 1] = pos.y
            const angle = Math.random()*2*Math.PI
            const vel = 2*Math.acos(1 - 2*Math.random())/Math.PI*avgVel
            this.velArr[2*i + 0] = vel*Math.cos(angle)
            this.velArr[2*i + 1] = vel*Math.sin(angle)
            tot += brightness
        }
        for(let i = 0; i < this.colArr.length; i++){
            this.colArr[i] /= tot
        }

        this.posBuffer = device.createBuffer({
            label: "Explosion position buffer",
            size: this.posArr.length,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
        this.colBuffer = device.createBuffer({
            label: "Explosion color buffer",
            size: this.colArr.length,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
    }

    /**
     * @param {number} dt
     */
    move(dt){
        for(let i = 0; i < 2*this.count; i++){
            this.posArr[i] += this.velArr[i] * dt
        }
    }

    /**
     * @param {GPUCommandEncoder} encoder
     * @param {GPUTextureView} lightTex
     * @param {GPUBindGroup} cameraBindGroup
     * @param {GPUBindGroup} minBrightnessBindGroup
     */
    draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup){
        if(this.changed){
            device.queue.writeBuffer(this.posBuffer, 0, this.posArr)
            device.queue.writeBuffer(this.colBuffer, 0, this.colArr)
        }
        lightPoint(encoder, lightTex, cameraBindGroup, identityBindGroup, this.posBuffer, this.colBuffer, minBrightnessBindGroup, this.count)
    }
}

export {Explosion}