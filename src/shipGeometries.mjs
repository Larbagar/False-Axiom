import { device } from "./graphics/device.mjs"
import V2 from "./V2.mjs"

class ShipGeometry {
    /** @type {Array<TrailDescription>} */
    trailDescriptions

    /**
     * @param {Array<number>} geometry
     * @param {Array<TrailDescription>} thrusters
     * @param {number} scale
     */
    constructor(geometry, thrusters = [], scale = 1) {
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

        this.trailDescriptions = []
        for(const thruster of thrusters){
            this.trailDescriptions.push(new TrailDescription(thruster.location.copy().multNum(scale), thruster.col, thruster.dimSpeed, thruster.v0.copy().multNum(scale), thruster.friction))
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

const shipGeometries = [
    new ShipGeometry([
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
    ], 1/2),
    new ShipGeometry([
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
    ], 1/2),
    new ShipGeometry([
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
    ], 1/2),
    new ShipGeometry([
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
    ], 1/2),
    new ShipGeometry([
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
    ], 1/2),
    new ShipGeometry([
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
    ], 1/2),
    new ShipGeometry([
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
    ], 1/2),
    new ShipGeometry([
        0, 0,
        2, 1,
        -1, 2,
        -2, 0,
        -1, -2,
        2, -1,
        0, 0,
    ], [
        new TrailDescription(V2.fromVals(-2, 0), [0.0005, 0.00025, 0.002], 0.01),
    ], 1/2),
    new ShipGeometry([
        2, 0,
        0, 3,
        -1, 1,
        -3, 0,
        -1, -1,
        0, -3,
        2, 0,
    ], [
        new TrailDescription(V2.fromVals(-3, 0), [0.0005, 0.00025, 0.002], 0.01),
    ], 1/2),
    new ShipGeometry([
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
    ], 1/2),
]

export {shipGeometries}