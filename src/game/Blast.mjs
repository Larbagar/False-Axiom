import {device} from "../graphics/device.mjs"
import V2 from "../V2.mjs"
import {lightLine} from "../graphics/light/lightLine.mjs"
import {identityBindGroup} from "../graphics/transformMatrixBindGroupLayout.mjs"
import {Trail} from "../graphics/Trail.mjs"

class Blast {
    /** @type {V2} */
    p0
    /** @type {V2} */
    p1

    /** @type {V2} */
    vel

    moved = true

    /** @type {Set<Ship>} */
    playersHit = new Set()

    trail0 = new Trail(0.01)
    trail1 = new Trail(0.01)

    constructor(p0, p1, vel, col) {
        this.vel = vel

        this.posArray = new Float32Array(4)
        this.posBuffer = device.createBuffer({
            label: "wall position buffer",
            size: this.posArray.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        })
        this.p0 = V2.fromFloat32Array(this.posArray)
        this.p0.xy = p0
        this.p1 = V2.fromFloat32Array(this.posArray, 2)
        this.p1.xy = p1


        this.colArray = new Float32Array(col)
        this.colBuffer = device.createBuffer({
            label: "wall color buffer",
            size: this.colArray.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        })
        device.queue.writeBuffer(this.colBuffer, 0, this.colArray)
    }
    update(game){
        // #TODO temporary deletion mechanism
        if(this.p0.mag > 10){
            game.blasts.delete(this)
        }
    }
    move(dt){
        const diff = this.vel.copy().mult(dt)
        this.p0.add(diff)
        this.p1.add(diff)
        this.moved = true

        this.trail0.run(this.p0, this.colArray)
        this.trail1.run(this.p1, this.colArray)
    }
    draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup) {
        if(this.moved) {
            device.queue.writeBuffer(this.posBuffer, 0, this.posArray)
            this.moved = false
        }
        lightLine(encoder, lightTex, cameraBindGroup, identityBindGroup, this.posBuffer, this.colBuffer, minBrightnessBindGroup)

        this.trail0.draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup)
        this.trail1.draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup)
    }
}

export {Blast}