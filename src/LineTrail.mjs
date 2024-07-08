import {device} from "./graphics/device.mjs"
import {lightLine} from "./graphics/light/lightLine.mjs"
import {identityBindGroup} from "./graphics/transformMatrixBindGroupLayout.mjs"

class LineTrail {
    /** @type {number} */
    spacing
    /** @type {number} */
    dimSpeed
    /** @type {number} */
    fadeTime
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
    /** @type {Float32Array} */
    vel

    timeToRun = 0
    replaceIndex = 0

    onUpdate

    constructor(spacing, lifespan, onUpdate = (i, dt, pos, vel, col) => {}) {
        this.spacing = spacing

        this.lifespan = lifespan
        this.count = Math.ceil(this.lifespan/this.spacing)

        this.onUpdate = onUpdate

        this.pos = new Float32Array(this.count*4)
        this.posBuffer = device.createBuffer({
            label: "Line trail position buffer",
            size: this.pos.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })

        this.col = new Float32Array(this.count*3)
        this.colBuffer = device.createBuffer({
            label: "Line trail color buffer",
            size: this.col.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })

        this.vel = new Float32Array(this.count*2)
    }
    move(dt){
        for(let i = 0; i < this.count; i ++){
            this.pos[4*i + 0] += this.vel[2*i + 0] * dt
            this.pos[4*i + 1] += this.vel[2*i + 1] * dt
            this.pos[4*i + 2] += this.vel[2*i + 0] * dt
            this.pos[4*i + 3] += this.vel[2*i + 1] * dt
        }
        this.changed = true
    }
    update(p0, p1, v, col, dt){
        for(let i = 0; i < this.count; i ++) {
            this.onUpdate(i, dt, this.pos, this.vel, this.col)
        }
        this.timeToRun += dt
        while(this.timeToRun > 0){
            this.pos[4*this.replaceIndex + 0] = p0.x
            this.pos[4*this.replaceIndex + 1] = p0.y
            this.pos[4*this.replaceIndex + 2] = p1.x
            this.pos[4*this.replaceIndex + 3] = p1.y

            this.vel[2*this.replaceIndex + 0] = v.x
            this.vel[2*this.replaceIndex + 1] = v.y

            this.col[3*this.replaceIndex + 0] = col[0]
            this.col[3*this.replaceIndex + 1] = col[1]
            this.col[3*this.replaceIndex + 2] = col[2]

            this.replaceIndex ++
            this.replaceIndex %= this.count

            this.timeToRun -= this.spacing

            this.changed = true
        }

    }
    draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup) {
        if (this.changed) {
            device.queue.writeBuffer(this.posBuffer, 0, this.pos)
            device.queue.writeBuffer(this.colBuffer, 0, this.col)
        }
        lightLine(encoder, lightTex, cameraBindGroup, identityBindGroup, this.posBuffer, this.colBuffer, minBrightnessBindGroup, this.count)
    }
}

export {LineTrail}