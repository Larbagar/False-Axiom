import {device} from "./graphics/device.mjs"
import {shockwave} from "./graphics/light/shockwave.mjs"

class Shockwave {
    pos = new Float32Array([0])
    /** @type {number} */
    moveSpeed
    /** @type {GPUBuffer} */
    descriptionBuffer

    changed = false



    /**
     * @param {V2} pos
     * @param {number} width
     * @param {number} growDist
     * @param {number} intensity
     * @param {number} moveSpeed
     */
    constructor(pos, width, growDist, intensity, moveSpeed) {
        const description = new Float32Array([...pos, width, growDist, intensity])
        this.descriptionBuffer = device.createBuffer({
            label: "shockwave description buffer",
            size: description.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
        device.queue.writeBuffer(this.descriptionBuffer, 0, description)

        this.posBuffer = device.createBuffer({
            label: "shockwave position buffer",
            size: this.pos.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })

        this.moveSpeed = moveSpeed
    }

    /**
     * @param {number} dt
     */
    move(dt){
        this.pos[0] += this.moveSpeed * dt
        this.changed = true
    }

    draw(encoder, distortionTex, cameraBindGroup){
        if(this.changed){
            device.queue.writeBuffer(this.posBuffer, 0, this.pos)
        }
        shockwave(encoder, distortionTex, cameraBindGroup, this.descriptionBuffer, this.posBuffer)
    }
}

export {Shockwave}