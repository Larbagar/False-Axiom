import {device} from "./graphics/device.mjs"
import {lightPoint} from "./graphics/light/lightPoint.mjs"
import {identityBindGroup} from "./graphics/transformMatrixBindGroupLayout.mjs"
import V2 from "./V2.mjs"

class ParticleCluster {
    /** @type {number} */
    count
    /** @type {Float32Array} */
    posArr
    /** @type {Array<number>} */
    fadeSpeed
    /** @type {Array<number>} */
    col
    /** @type {Float32Array} */
    velArr
    /** @type {Float32Array} */
    colArr
    /** @type {GPUBuffer} */
    posBuffer
    /** @type {GPUBuffer} */
    colBuffer
    /** @type {number} */
    friction

    changed = true
    /**
     * @param {Object} descriptor
     * @param {number} descriptor.count
     * @param {Array<number>=} descriptor.col
     * @param {V2} descriptor.pos
     * @param {number} descriptor.outVel
     * @param {number=} descriptor.spread
     * @param {number} descriptor.fadeSpeed
     * @param {V2=} descriptor.avgVel
     * @param {number=} descriptor.avgAngle
     * @param {number=} descriptor.angSpread
     */
    constructor({
        count,
        col = [1, 1, 1],
        pos,
        outVel,
        spread = outVel,
        fadeSpeed,
        avgVel = V2.zero(),
        avgAngle,
        angSpread = 1,
        friction = 1,
    }){
        this.count = count
        this.col = col
        this.friction = friction
        this.fadeSpeed = col.map(x => x*fadeSpeed/this.count)
        this.posArr = new Float32Array(2*count)
        this.velArr = new Float32Array(2*count)
        this.colArr = new Float32Array(3*count)
        let tot = 0
        for(let i = 0; i < count; i++){
            const brightness = 2*Math.acos(1 - 2*Math.random())/Math.PI
            this.colArr[3*i + 0] = brightness*this.col[0]
            this.colArr[3*i + 1] = brightness*this.col[1]
            this.colArr[3*i + 2] = brightness*this.col[2]
            this.posArr[2*i + 0] = pos.x
            this.posArr[2*i + 1] = pos.y


            const angle = avgAngle ? avgAngle + angSpread*(2*Math.acos(1 - 2*Math.random())/Math.PI - 1) : Math.random()*2*Math.PI
            const vel = spread*(2*Math.acos(1 - 2*Math.random())/Math.PI - 1) + outVel
            this.velArr[2*i + 0] = avgVel.x + vel*Math.cos(angle)
            this.velArr[2*i + 1] = avgVel.y + vel*Math.sin(angle)
            tot += brightness
        }
        for(let i = 0; i < this.colArr.length; i++){
            this.colArr[i] /= tot
        }

        this.posBuffer = device.createBuffer({
            label: "Explosion position buffer",
            size: this.posArr.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
        this.colBuffer = device.createBuffer({
            label: "Explosion color buffer",
            size: this.colArr.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
    }

    /**
     * @param {number} dt
     */
    update(dt) {
        if(this.friction !== 1) {
            for (let i = 0; i < this.velArr.length; i++) {
                this.velArr[i] *= this.friction ** dt
            }
        }
    }

    /**
     * @param {number} dt
     */
    move(dt){
        for(let i = 0; i < this.count; i++){
            this.posArr[2*i + 0] += this.velArr[2*i + 0] * dt
            this.posArr[2*i + 1] += this.velArr[2*i + 1] * dt
            this.colArr[3*i + 0] -= this.fadeSpeed[0] * dt
            this.colArr[3*i + 1] -= this.fadeSpeed[1] * dt
            this.colArr[3*i + 2] -= this.fadeSpeed[2] * dt
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

export {ParticleCluster}