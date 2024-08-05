import { device } from "./graphics/device.mjs"
import V2 from "./V2.mjs"

class ShipGeometry {
    /** @type {number[]} */
    geometry
    /** @type {number} */
    edgeCount
    /** @type {Float32Array} */
    arr
    /** @type {GPUBuffer} */
    buffer
    /** @type {Array<TrailDescription>} */
    trailDescriptions
    /** @type {number} */
    totalLength


    /**
     * @param {Array<number>} geometry
     * @param {Array<TrailDescription>} trailDescriptions
     * @param {number} scale
     */
    constructor(geometry, trailDescriptions = [], scale = 1) {
        this.geometry = geometry
        this.edgeCount = this.geometry.length/2 - 1
        this.arr = new Float32Array(this.edgeCount*4)
        this.totalLength = 0
        for(let i = 0; i < this.edgeCount; i ++){
            this.arr[4*i + 0] = this.geometry[i*2 + 0]*scale
            this.arr[4*i + 1] = this.geometry[i*2 + 1]*scale
            this.arr[4*i + 2] = this.geometry[i*2 + 2]*scale
            this.arr[4*i + 3] = this.geometry[i*2 + 3]*scale
            this.totalLength +=
                (
                    (this.geometry[2*i + 2] - this.geometry[2*i + 0])**2 +
                    (this.geometry[2*i + 3] - this.geometry[2*i + 1])**2
                )**0.5
        }
        this.totalLength *= scale

        this.buffer = device.createBuffer({
            label: "light pos buffer",
            size: this.arr.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        })
        device.queue.writeBuffer(this.buffer, 0, this.arr)

        this.trailDescriptions = []
        for(const trailDescription of trailDescriptions){
            this.trailDescriptions.push(new TrailDescription(trailDescription.location.copy().multNum(scale), trailDescription.col, trailDescription.dimSpeed, trailDescription.v0.copy().multNum(scale), trailDescription.friction))
        }
    }
}

class TrailDescription {
    /** @type {V2} */
    location
    /** @type {V2} */
    v0
    /** @type {Array<number>} */
    col
    /** @type {number} */
    dimSpeed
    /** @type {number} */
    friction

    /**
     * @param {V2} location
     * @param {Array<number>} col
     * @param {number} dimSpeed
     * @param {V2} v0
     * @param {number} friction
     */
    constructor(location, col, dimSpeed, v0 = V2.zero(), friction = 1){
        this.location = location
        this.v0 = v0
        this.col = col
        this.dimSpeed = dimSpeed
        this.friction = friction
    }
}

// Initial velocity of 0.02 and friction of 0.8 looks kinda good

const bat = new ShipGeometry([
    1, 0,
    2, 2,
    -2, 4,
    -1, 0,
    -2, -4,
    2, -2,
    1, 0,
], [
    new TrailDescription(V2.fromVals(-2, 4), [0.0005, 0.00025, 0.002], 0.01),
    new TrailDescription(V2.fromVals(-2, -4), [0.0005, 0.00025, 0.002], 0.01),
], 1/2)

const butterfly = new ShipGeometry([
    2, 0,
    -1, 3,
    -2, 1,
    0, 0,
    -2, -1,
    -1, -3,
    2, 0,
], [
    new TrailDescription(V2.fromVals(-1, 3), [0.0005, 0.00025, 0.002], 0.01),
    new TrailDescription(V2.fromVals(-1, -3), [0.0005, 0.00025, 0.002], 0.01),
], 1/2)

const doubleTip = new ShipGeometry([
    0, 0,
    2, 1,
    -1, 2,
    -2, 0,
    -1, -2,
    2, -1,
    0, 0,
], [
    new TrailDescription(V2.fromVals(-2, 0), [0.0005, 0.00025, 0.002], 0.01),
], 1/2)

const bomber = new ShipGeometry([
    1, 2,
    -2, 4,
    -1, 1,
    -1, -1,
    -2, -4,
    1, -2,
    1, 2,
], [
    new TrailDescription(V2.fromVals(-2, 4), [0.0005, 0.00025, 0.002], 0.01),
    new TrailDescription(V2.fromVals(-2, -4), [0.0005, 0.00025, 0.002], 0.01),
], 1/2)

const hammer = new ShipGeometry([
    2, 0,
    0, 3,
    -1, 1,
    -3, 0,
    -1, -1,
    0, -3,
    2, 0,
], [
    new TrailDescription(V2.fromVals(-3, 0), [0.0005, 0.00025, 0.002], 0.01),
], 1/2)
const triple = new ShipGeometry([
    3, 0,
    -1, 3,
    0, 1,
    -2, 0,
    0, -1,
    -1, -3,
    3, 0,
], [
    new TrailDescription(V2.fromVals(-2, 0), [0.0005, 0.00025, 0.002], 0.01),
    new TrailDescription(V2.fromVals(-1, 3), [0.0005, 0.00025, 0.002], 0.01),
    new TrailDescription(V2.fromVals(-1, -3), [0.0005, 0.00025, 0.002], 0.01),
], 1/2)
const narrow = new ShipGeometry([
    2, 0,
    1, 1,
    -2, 2,
    0, 0,
    -2, -2,
    1, -1,
    2, 0,
], [
    new TrailDescription(V2.fromVals(-2, 2), [0.0005, 0.00025, 0.002], 0.01),
    new TrailDescription(V2.fromVals(-2, -2), [0.0005, 0.00025, 0.002], 0.01),
], 1/2)

const archLinux = new ShipGeometry([
    3, 0,
    -2, 3,
    -1, 1,
    1, 0,
    -1, -1,
    -2, -3,
    3, 0,
], [
    new TrailDescription(V2.fromVals(-1, 1), [0.0005, 0.00025, 0.002], 0.01),
    new TrailDescription(V2.fromVals(-1, -1), [0.0005, 0.00025, 0.002], 0.01),
], 1/2)

const original = new ShipGeometry([
    3, 0,
    -1, 3,
    -3, 2,
    -1, 0,
    -3, -2,
    -1, -3,
    3, 0,
], [
    new TrailDescription(V2.fromVals(-3, 2), [0.0005, 0.00025, 0.002], 0.01),
    new TrailDescription(V2.fromVals(-3, -2), [0.0005, 0.00025, 0.002], 0.01),
], 1/2)

const jules = new ShipGeometry([
    -1, 0,
    -2, 3,
    0, 1,
    2, 0,
    0, -1,
    -2, -3,
    -1, 0,
], [
    new TrailDescription(V2.fromVals(-2, 3), [0.0005, 0.00025, 0.002], 0.01),
    new TrailDescription(V2.fromVals(-2, -3), [0.0005, 0.00025, 0.002], 0.01),
], 1/2)

const shipGeometries = [
    doubleTip,
    butterfly,
    jules,
    triple,
    bomber,
    narrow,
    bat,
    archLinux,
    original,
    hammer,
]

export {shipGeometries}