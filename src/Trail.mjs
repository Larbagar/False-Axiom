import { device } from "./graphics/device.mjs"
import { lightLine } from "./graphics/light/lightLine.mjs"
import { identityBindGroup } from "./graphics/transformMatrixBindGroupLayout.mjs"

class Trail {
    /** @type {TrailDescription} */
    description
    /** @type {number} */
    fadeTime

    /** @type {Float32Array} */
    posArray
    /** @type {GPUBuffer} */
    posBuffer

    /** @type {Float32Array} */
    velArray

    /** @type {Float32Array} */
    colArray
    /** @type {GPUBuffer} */
    colBuffer

    replaceIndex = 0
    /** @type {V2} */
    lastPos = null
    /** @type {?V2} */
    lastVel = null

    /**
     * @param {number} dimSpeed
     * @param {Object} description
     * @param {number?} description.friction
     */
    constructor(dimSpeed, {
        friction = 1,
    }){
        this.dimSpeed = dimSpeed
        this.friction = friction

        this.fadeTime = Math.ceil(1/this.dimSpeed) + 1

        this.posArray = new Float32Array(this.fadeTime*4)
        this.posBuffer = device.createBuffer({
            label: "thruster position buffer",
            size: this.posArray.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        })

        this.velArray = new Float32Array(this.fadeTime*4)

        this.initColArray = new Float32Array(this.fadeTime*3)
        this.colArray = new Float32Array(this.fadeTime*3)
        this.colBuffer = device.createBuffer({
            label: "thruster color buffer",
            size: this.colArray.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        })
    }

    /**
     * @param {V2} pos
     * @param {V2} vel
     * @param {Array<number>} col
     */
    run(pos, vel, col){
        for(let i = 0; i < this.posArray.length; i++){
            this.posArray[i] += this.velArray[i]
            this.velArray[i] *= this.friction

        }
        for(let i = 0; i < this.fadeTime; i++){
            this.colArray[i*3 + 0] -= this.initColArray[i*3 + 0]*this.dimSpeed
            this.colArray[i*3 + 1] -= this.initColArray[i*3 + 1]*this.dimSpeed
            this.colArray[i*3 + 2] -= this.initColArray[i*3 + 2]*this.dimSpeed
        }

        const newPos = pos.copy()
        const newVel = vel.copy()
        if(this.lastPos) {
            this.colArray[this.replaceIndex * 3 + 0] = col[0]
            this.colArray[this.replaceIndex * 3 + 1] = col[1]
            this.colArray[this.replaceIndex * 3 + 2] = col[2]
            this.initColArray[this.replaceIndex * 3 + 0] = col[0]
            this.initColArray[this.replaceIndex * 3 + 1] = col[1]
            this.initColArray[this.replaceIndex * 3 + 2] = col[2]


            this.posArray[this.replaceIndex * 4 + 0] = this.lastPos.x
            this.posArray[this.replaceIndex * 4 + 1] = this.lastPos.y
            this.posArray[this.replaceIndex * 4 + 2] = newPos.x
            this.posArray[this.replaceIndex * 4 + 3] = newPos.y

            this.velArray[this.replaceIndex * 4 + 0] = this.lastVel.x
            this.velArray[this.replaceIndex * 4 + 1] = this.lastVel.y
            this.velArray[this.replaceIndex * 4 + 2] = newVel.x
            this.velArray[this.replaceIndex * 4 + 3] = newVel.y
        }

        this.lastPos = newPos.add(newVel)
        this.lastVel = newVel.mult(this.friction)

        this.replaceIndex ++
        this.replaceIndex %= this.fadeTime

        device.queue.writeBuffer(this.posBuffer, 0, this.posArray)
        device.queue.writeBuffer(this.colBuffer, 0, this.colArray)
    }

    draw(encoder, cameraBindGroup, lightTex, minBrightnessBindGroup){
        lightLine(encoder, lightTex, cameraBindGroup, identityBindGroup, this.posBuffer, this.colBuffer, minBrightnessBindGroup, this.fadeTime)
    }
}

export {Trail}