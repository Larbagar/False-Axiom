import {device} from "./graphics/device.mjs"
import {lightLine} from "./graphics/light/lightLine.mjs"
import {identityBindGroup} from "./graphics/transformMatrixBindGroupLayout.mjs"

class RubbleCluster {
    /** @type {Float32Array} */
    pos
    /** @type {GPUBuffer} */
    posBuffer
    /** @type {Float32Array} */
    v

    /** @type {Float32Array} */
    colArr
    /** @type {Array<number>} */
    col
    /** @type {GPUBuffer} */
    colBuffer
    /** @type {Array<number>} */
    fadeSpeeds

    frition

    /** @type {number} */
    count

    changed = true
    /**
     * @param {V2} p0
     * @param {V2} p1
     * @param {Array<V2>} v
     * @param {Array<number>} col
     * @param {Array<number>} fadeSpeeds
     * @param {number} friction
     */
    constructor(p0, p1, v, col, fadeSpeeds, friction = 1) {
        this.count = v.length
        this.pos = new Float32Array(4*this.count)
        for (let i = 0; i < this.count; i++) {
            this.pos[4*i + 0] = p0.x
            this.pos[4*i + 1] = p0.y
            this.pos[4*i + 2] = p1.x
            this.pos[4*i + 3] = p1.y
        }
        this.posBuffer = device.createBuffer({
            label: "Rubble cluster position buffer",
            size: this.pos.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })

        this.v = new Float32Array(2*this.count)
        for (let i = 0; i < this.count; i++){
            this.v[2*i + 0] = v[i].x
            this.v[2*i + 1] = v[i].y
        }

        this.col = col
        this.colArr = new Float32Array(this.col)
        this.colBuffer = device.createBuffer({
            label: "Rubble cluster color buffer",
            size: this.colArr.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
        device.queue.writeBuffer(this.colBuffer, 0, this.colArr)

        this.fadeSpeeds = fadeSpeeds
        this.friction = friction
    }
    update(dt){
        for(let i = 0; i < this.v.length; i++){
            this.v[i] *= this.friction ** dt
        }
    }
    move(dt){
        for (let i = 0; i < this.count; i++){
            this.pos[4*i + 0] += this.v[2*i + 0] * dt
            this.pos[4*i + 1] += this.v[2*i + 1] * dt
            this.pos[4*i + 2] += this.v[2*i + 0] * dt
            this.pos[4*i + 3] += this.v[2*i + 1] * dt
            this.colArr[3*i + 0] -= this.fadeSpeeds[3*i + 0] * dt
            this.colArr[3*i + 1] -= this.fadeSpeeds[3*i + 1] * dt
            this.colArr[3*i + 2] -= this.fadeSpeeds[3*i + 2] * dt
            this.colArr[3*i + 0] = Math.max(0, this.colArr[3*i + 0])
            this.colArr[3*i + 1] = Math.max(0, this.colArr[3*i + 1])
            this.colArr[3*i + 2] = Math.max(0, this.colArr[3*i + 2])
        }
        this.changed = true
    }
    draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup){
        if(this.changed) {
            device.queue.writeBuffer(this.posBuffer, 0, this.pos)
            device.queue.writeBuffer(this.colBuffer, 0, this.colArr)
            this.changed = false
        }
        lightLine(encoder, lightTex, cameraBindGroup, identityBindGroup, this.posBuffer, this.colBuffer, minBrightnessBindGroup, this.count)
    }
}

export {RubbleCluster}