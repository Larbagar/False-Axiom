import { lightLine } from "../graphics/light/lightLine.mjs"
import { device } from "../graphics/device.mjs"
import { identityBindGroup } from "../graphics/transformMatrixBindGroupLayout.mjs"
import V2 from "../V2.mjs"

class Wall {
    /** @type {V2} */
    p0
    /** @type {V2} */
    p1
    /** @type {number} */
    dir
    /** @type {number} */
    maxLen
    /** @type {number} */
    growSpeed

    len = 0

    /** @type {boolean} */
    persists

    /** @type {boolean} */
    moved = false

    constructor(p0, dir, maxLen, growSpeed, col, persists = false) {
        this.dir = dir
        this.maxLen = maxLen
        this.growSpeed = growSpeed
        this.persists = persists

        this.posArray = new Float32Array(4)
        this.posBuffer = device.createBuffer({
            label: "wall position buffer",
            size: this.posArray.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        })
        this.p0 = V2.fromFloat32Array(this.posArray)
        this.p0.xy = p0
        this.p1 = V2.fromFloat32Array(this.posArray, 2)


        this.colArray = new Float32Array(col)
        this.colBuffer = device.createBuffer({
            label: "wall color buffer",
            size: this.colArray.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        })
        device.queue.writeBuffer(this.colBuffer, 0, this.colArray)
    }
    move(dt){
        if(this.len < this.maxLen) {
            this.len += this.maxLen * this.growSpeed * dt
            this.len = Math.min(this.len, this.maxLen)
            this.p1.xy = V2.fromPolar(this.len, this.dir).add(this.p0)
            this.moved = true
        }
    }
    draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup) {
        if(this.moved){
            device.queue.writeBuffer(this.posBuffer, 0, this.posArray)
            this.moved = false
        }
        lightLine(encoder, lightTex, cameraBindGroup, identityBindGroup, this.posBuffer, this.colBuffer, minBrightnessBindGroup)
    }
}

export {Wall}