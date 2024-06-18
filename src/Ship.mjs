import V2 from "./V2.mjs"
import { shipGeometries } from "./shipGeometries.mjs"
import { device } from "./graphics/device.mjs"
import { lightLine } from "./graphics/light/lightLine.mjs"
import { transformMatrixBindGroupLayout } from "./graphics/transformMatrixBindGroupLayout.mjs"

export class Ship {
  /** @type {V2} */
  pos
  vel = V2.zero()

  /** @type {number} */
  dir
  angVel = 0

  /** @type {Controller} */
  controller

  accel = 0.001
  angAccel = 0.01

  sideFric = 0.9
  forwardFric = 0.98
  angFric = 0.9

  size = 0.03

  /** @type {ShipGeometry} */
  geometry
  /** @type {GPUBuffer} */
  lightColBuffer

  /**
   * @param {V2} pos
   * @param {number} dir
   * @param {Controller} controller
   */
  constructor(pos, dir, controller) {
    this.pos = pos
    this.dir = dir
    this.controller = controller

    this.geometry = shipGeometries[0]

    const lightCol = new Float32Array(Array.from({length: this.geometry.edgeCount}, _ => [0.002, 0.001, 0.008,]).flat())
    this.lightColBuffer = device.createBuffer({
      label: "light col buffer",
      size: lightCol.byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
    })
    device.queue.writeBuffer(this.lightColBuffer, 0, lightCol)

    this.transformBuffer = device.createBuffer({
      label: "ship transform buffer",
      size: M3.BYTE_LENGTH,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    })
    this.transformBindGroup = device.createBindGroup({
      label: "ship transform bind group",
      layout: transformMatrixBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.transformBuffer,
          },
        },
      ],
    })

    this.worldTransform = M3.identity()
  }

  update() {
    this.angVel *= this.sideFric
    this.angVel += this.angAccel*this.controller.turn

    this.vel.rotate(-this.dir)
    if(this.vel.x > 0) {
      this.vel.x *= this.forwardFric
    }else{
      this.vel.x *= this.sideFric
    }
    this.vel.x += this.accel*this.controller.forward
    this.vel.y *= this.sideFric
    this.vel.rotate(this.dir)
  }

  collide() {

  }

  move() {
    this.pos.add(this.vel)
    this.dir += this.angVel
  }

  draw(encoder, lightTex, minBrightnessBindGroup, cameraBindGroup) {
    const transform = M3.identity().rotate(this.dir).scaleS(this.size).translate(this.pos)
    device.queue.writeBuffer(this.transformBuffer, 0, transform.arr)
    lightLine(encoder, lightTex.view, this.geometry.buffer, this.lightColBuffer, cameraBindGroup, this.transformBindGroup, minBrightnessBindGroup, this.geometry.edgeCount)
    
  }
}