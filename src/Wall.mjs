import { lightLine } from "./graphics/light/lightLine.mjs"
import { device } from "./graphics/device.mjs"
import { identityBindGroup } from "./graphics/transformMatrixBindGroupLayout.mjs"
import V2 from "./V2.mjs"

class Wall {
    /** @type {V2} */
    pos
    /** @type {number} */
    dir
    /** @type {number} */
    maxLen
    /** @type {number} */
    growSpeed

    initTime = 0

    len = 0

    /** @type {boolean} */
    persists

    constructor(p0, dir, maxLen, growSpeed, col, initTime = 0, persists = false) {
        this.dir = dir
        this.maxLen = maxLen
        this.growSpeed = growSpeed
        this.col = col
        this.initTime = initTime
        this.persists = persists

        this.posArray = new Float32Array(4)
        this.posBuffer = device.createBuffer({
            label: "wall position buffer",
            size: this.posArray.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        })
        this.pos = V2.fromFloat32Array(this.posArray)
        this.pos.xy = p0
        this.p1 = V2.fromFloat32Array(this.posArray, 2)


        this.colArray = new Float32Array(this.col)
        this.colBuffer = device.createBuffer({
            label: "wall color buffer",
            size: this.colArray.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        })
        device.queue.writeBuffer(this.colBuffer, 0, this.colArray)
    }
    move(targetTime){
        const dt = targetTime - this.initTime
        this.initTime = targetTime

        this.len += this.maxLen*this.growSpeed*dt
        this.len = Math.min(this.len, this.maxLen)
        this.p1.xy = V2.fromPolar(this.len, this.dir).add(this.pos)
        device.queue.writeBuffer(this.posBuffer, 0, this.posArray)
    }
    draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup) {
        lightLine(encoder, lightTex, cameraBindGroup, identityBindGroup, this.posBuffer, this.colBuffer, minBrightnessBindGroup)
    }
}

export {Wall}