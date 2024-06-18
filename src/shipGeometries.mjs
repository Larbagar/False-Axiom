import { device } from "./graphics/device.mjs"
import M3 from "./M3.mjs"
import V2 from "./V2.mjs"

class ShipGeometry {
    /**
     * @param {Array<number>} geometry
     * @param {number} scale
     */
    constructor(geometry, scale = 1) {
        this.geometry = geometry
        this.edgeCount = this.geometry.length/2 - 1
        this.arr = new Float32Array(this.edgeCount*4)
        for(let i = 0; i < this.edgeCount; i ++){
            this.arr[4*i + 0] = this.geometry[i*2 + 0]*scale
            this.arr[4*i + 1] = this.geometry[i*2 + 1]*scale
            this.arr[4*i + 2] = this.geometry[i*2 + 2]*scale
            this.arr[4*i + 3] = this.geometry[i*2 + 3]*scale
        }
        this.buffer = device.createBuffer({
            label: "light pos buffer",
            size: this.arr.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        })
        device.queue.writeBuffer(this.buffer, 0, this.arr)
    }
}

const shipGeometries = [
    new ShipGeometry([
        3, 0,
        -1, -3,
        -3, -2,
        -1, 0,
        -3, 2,
        -1, 3,
        3, 0,
    ], 1/2),
]

export {shipGeometries}