import { device } from "./device.mjs"
import { lightLine } from "./light/lightLine.mjs"
import { identityBindGroup } from "./transformMatrixBindGroupLayout.mjs"

class Trail {
    /** @type {TrailDescription} */
    description
    /** @type {number} */
    fadeTime

    /** @type {Float32Array} */
    pos
    /** @type {GPUBuffer} */
    posBuffer


    /** @type {Float32Array} */
    colArray
    /** @type {GPUBuffer} */
    colBuffer

    replaceIndex = 0
    /** @type {V2} */
    lastPos = null

    changed = true

    /**
     * @param {number} dimSpeed
     */
    constructor(dimSpeed){
        this.dimSpeed = dimSpeed

        this.fadeTime = Math.ceil(1/this.dimSpeed)

        this.pos = new Float32Array(this.fadeTime*4)
        this.posBuffer = device.createBuffer({
            label: "thruster position buffer",
            size: this.pos.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        })

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
     * @param {Array<number> | Float32Array} col
     */
    run(pos, col){
        for(let i = 0; i < this.fadeTime; i++){
            this.colArray[i*3 + 0] -= this.initColArray[i*3 + 0]*this.dimSpeed
            this.colArray[i*3 + 1] -= this.initColArray[i*3 + 1]*this.dimSpeed
            this.colArray[i*3 + 2] -= this.initColArray[i*3 + 2]*this.dimSpeed
        }

        const newPos = pos.copy()

        if(this.lastPos) {
            // console.log(`Removed at brightness ${this.colArray[this.replaceIndex * 3 + 0]}, ${this.colArray[this.replaceIndex * 3 + 1]}, ${this.colArray[this.replaceIndex * 3 + 2]}`)
            this.colArray[this.replaceIndex * 3 + 0] = col[0]
            this.colArray[this.replaceIndex * 3 + 1] = col[1]
            this.colArray[this.replaceIndex * 3 + 2] = col[2]
            this.initColArray[this.replaceIndex * 3 + 0] = col[0]
            this.initColArray[this.replaceIndex * 3 + 1] = col[1]
            this.initColArray[this.replaceIndex * 3 + 2] = col[2]


            this.pos[this.replaceIndex * 4 + 0] = this.lastPos.x
            this.pos[this.replaceIndex * 4 + 1] = this.lastPos.y
            this.pos[this.replaceIndex * 4 + 2] = newPos.x
            this.pos[this.replaceIndex * 4 + 3] = newPos.y
        }

        this.lastPos = newPos

        this.replaceIndex ++
        this.replaceIndex %= this.fadeTime

        this.changed = true
    }

    draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup){
        if(this.changed){
            device.queue.writeBuffer(this.posBuffer, 0, this.pos)
            device.queue.writeBuffer(this.colBuffer, 0, this.colArray)
        }
        lightLine(encoder, lightTex, cameraBindGroup, identityBindGroup, this.posBuffer, this.colBuffer, minBrightnessBindGroup, this.fadeTime)
    }
}

export {Trail}