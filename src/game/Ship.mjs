import V2 from "../V2.mjs"
import { shipGeometries } from "../shipGeometries.mjs"
import { device } from "../graphics/device.mjs"
import { lightLine } from "../graphics/light/lightLine.mjs"
import { transformMatrixBindGroupLayout } from "../graphics/transformMatrixBindGroupLayout.mjs"
import { Trail } from "../graphics/Trail.mjs"
import M3 from "../M3.mjs"
import { Wall } from "./Wall.mjs"
import { lightPoint } from "../graphics/light/lightPoint.mjs"
import {Explosion} from "../Explosion.mjs"

export class Ship {

  turnSpeed = 0.006
  turnFric = 0.02

  speed = 0.0012
  forwardFric = 0.0012
  sideFric = 0.012

  wallKnockback = 0.0018
  shipKnockback = 0.0006
  blastKnockback = 0.0018

  lowTraction = 0.0006
  lowTractionTime = 8000

  dashTime = 170
  dashBuffer = 80
  dashCooldown = 300
  dashDecay = 1
  dashSpeed = 0.0024

  blastVel = 0.005

  maxHp = 5

  hpShowTime = 2000
  hpFadeTime = 300
  hpHeight = 3
  hpDist = 2

  size = 0.03

  deathFriction = 0.99
  deathSpeed = 0.001
  finalBrightness = 200
  deathExplosionCount = 100
  deathExplosionPow = 0.002


  /** @type {V2} */
  pos
  vel = V2.zero()

  /** @type {number} */
  dir
  angVel = 0


  /** @type {Controller} */
  controller

  /** @type {Array<number>} */
  col



  /** @type {ShipGeometry} */
  geometry
  /** @type {Float32Array} */
  shipColArr
  /** @type {GPUBuffer} */
  shipColBuffer
  /** @type {GPUBuffer} */
  shipTransformBuffer
  /** @type {GPUBindGroup} */
  shipTransformBindGroup
  /** @type {GPUBuffer} */
  hpPosBuffer
  /** @type {Float32Array} */
  hpCol
  /** @type {GPUBuffer} */
  hpColBuffer
  /** @type {GPUBuffer} */
  hpTransformBuffer
  /** @type {GPUBindGroup} */
  hpTransformBindGroup

  lowTractionProgress = this.lowTractionTime

  /** @type {Array<Trail>} */
  trails

  dashProgress = this.dashTime + this.dashBuffer + this.dashCooldown
  /** @type {number} */
  dashDir
  /** @type {Wall} */
  dashWall



  hpDisplayProgress = 0

  hp = this.maxHp

  deathProgress = 0
  /** @type {number} */
  usedSize = this.size

  updateColBuffer = false

  exploded = false


  /**
   * @param {V2} pos
   * @param {number} dir
   * @param {Controller} controller
   * @param {Array<number>} col
   * @param {ShipGeometry} geometry
   */
  constructor(pos, dir, controller, col, geometry) {
    this.pos = pos
    this.dir = dir
    this.controller = controller
    this.col = col

    this.geometry = geometry

    this.shipColArr = new Float32Array(new Array(this.geometry.edgeCount).fill(this.col).flat())

    this.shipColBuffer = device.createBuffer({
      label: "light col buffer",
      size: this.shipColArr.byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
    })
    device.queue.writeBuffer(this.shipColBuffer, 0, this.shipColArr)

    this.shipTransformBuffer = device.createBuffer({
      label: "ship transform buffer",
      size: M3.BYTE_LENGTH,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    })
    this.shipTransformBindGroup = device.createBindGroup({
      label: "ship transform bind group",
      layout: transformMatrixBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.shipTransformBuffer,
          },
        },
      ],
    })

    const hpPos = new Float32Array(2*this.maxHp)
    for(let i = 0; i < this.maxHp; i++) {
      hpPos[2*i + 0] = i - (this.maxHp - 1)/2
      hpPos[2*i + 1] = 0
    }
    this.hpPosBuffer = device.createBuffer({
      label: "hp pos buffer",
      size: hpPos.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    })
    device.queue.writeBuffer(this.hpPosBuffer, 0, hpPos)

    this.hpCol = new Float32Array(this.maxHp*3)
    this.hpColBuffer = device.createBuffer({
      label: "hp col buffer",
      size: this.hpCol.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    })

    this.hpTransformBuffer = device.createBuffer({
      label: "ship hp transform buffer",
      size: M3.BYTE_LENGTH,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
    this.hpTransformBindGroup = device.createBindGroup({
      label: "ship hp transform bind group",
      layout: transformMatrixBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.hpTransformBuffer,
          },
        },
      ],
    })

    this.trails = []
    for(const description of this.geometry.trailDescriptions){
      this.trails.push(new Trail(description.dimSpeed))
    }
  }

  update(dt, game) {
    if(this.hp > 0) {
      if (this.dashProgress < this.dashTime && this.dashTime <= this.dashProgress + dt) {
        // End the dash
        this.vel.mult(this.dashDecay)
      } else if (
          this.controller.dash &&
          this.dashTime + this.dashBuffer + this.dashCooldown <= this.dashProgress + dt
      ) {
        // Start the dash
        this.dashProgress = 0
        this.dashDir = this.dir
        this.dashWall = new Wall(V2.fromPolar(-this.size, this.dir).add(this.pos), this.dir, this.dashSpeed * this.dashTime, 1 / this.dashTime, this.col)
        game.walls.add(this.dashWall)
        this.controller.startDash()
        this.lowTractionProgress = this.lowTractionTime
        this.vel.xy = V2.fromPolar(this.dashSpeed, this.dashDir)
      }
      if (this.dashProgress + dt < this.dashTime) {

        // Dashing

        this.angVel += (this.turnSpeed * this.controller.turn - this.angVel) * (1 - (1 - this.turnFric) ** dt)

      } else {

        // Normal movement

        this.angVel += (this.turnSpeed * this.controller.turn - this.angVel) * (1 - (1 - this.turnFric) ** dt)


        this.vel.rotate(-this.dir)

        let traction = Math.min(1, this.lowTractionProgress / this.lowTractionTime)

        let sideFric = (this.sideFric * traction + this.lowTraction * (1 - traction))
        let fric

        if (this.vel.x >= 0) {
          fric = this.forwardFric
        } else {
          fric = sideFric
        }
        this.vel.x += (this.speed * this.controller.forward - this.vel.x) * (1 - (1 - fric) ** dt)
        this.vel.y -= this.vel.y * (1 - (1 - sideFric) ** dt)
        this.vel.rotate(this.dir)
      }
      this.dashProgress += dt
      this.lowTractionProgress += dt
      this.hpDisplayProgress += dt
    }else if(this.deathProgress >= 1 && !this.exploded){
      /** @type {Array<number>} */
      const finalCol = this.col.map(x => {return x*this.finalBrightness*this.size})
      game.explosions.add(new Explosion(this.deathExplosionCount, finalCol, this.pos, this.deathExplosionPow, this.vel, 0.0002))
      this.exploded = true
      game.ships.splice(game.ships.indexOf(this), 1)
    }else{
      this.vel.mult(this.deathFriction)
    }
  }

  move(dt) {
    this.pos.add(this.vel.copy().mult(dt))
    this.dir += this.angVel * dt

    if(this.hp <= 0){
      this.deathProgress += this.deathSpeed * dt
      this.deathProgress = Math.min(1, this.deathProgress)
      this.usedSize = this.size * (1 - this.deathProgress)

      this.updateColBuffer = true
    }

    // #TODO should not be called on move
    const brightness = 0.2*(this.deathProgress === 0)*this.controller.forward*(this.dashProgress >= this.dashTime)
    for(let i = 0; i < this.geometry.trailDescriptions.length; i++){
      this.trails[i].run(
          this.geometry.trailDescriptions[i].location.copy().mult(this.size).rotate(this.dir).add(this.pos),
          this.col.map(x => brightness*x),
      )
    }
  }

  draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup) {
    if(this.updateColBuffer){
      const currentCol = this.col.map(x => Math.max(0, x*(1 - this.deathProgress + this.deathProgress*this.finalBrightness/this.geometry.totalLength)/(1 - this.deathProgress)))
      this.shipColArr = new Float32Array(new Float32Array(new Array(this.geometry.edgeCount).fill(currentCol).flat()))
      device.queue.writeBuffer(this.shipColBuffer, 0, this.shipColArr)
    }

    const shipTransform = M3.identity().rotate(this.dir).scaleS(this.usedSize).translate(this.pos)
    device.queue.writeBuffer(this.shipTransformBuffer, 0, shipTransform.arr)
    lightLine(encoder, lightTex, cameraBindGroup, this.shipTransformBindGroup, this.geometry.buffer, this.shipColBuffer, minBrightnessBindGroup, this.geometry.edgeCount)
    for(const trail of this.trails){
      trail.draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup)
    }


    for(let i = 0; i < this.maxHp; i++){
      const show = i < this.hp
      const brightness = show*this.size*Math.min(1, 1 - (this.hpDisplayProgress - this.hpShowTime)/this.hpFadeTime)
      this.hpCol[3*i + 0] = brightness*this.col[0]
      this.hpCol[3*i + 1] = brightness*this.col[1]
      this.hpCol[3*i + 2] = brightness*this.col[2]
    }
    device.queue.writeBuffer(this.hpColBuffer, 0, this.hpCol)

    const hpTransform = M3.identity().scaleS(this.hpDist).translateV(0, this.hpHeight).scaleS(this.size).translate(this.pos)
    device.queue.writeBuffer(this.hpTransformBuffer, 0, hpTransform.arr)
    lightPoint(encoder, lightTex, cameraBindGroup, this.hpTransformBindGroup, this.hpPosBuffer, this.hpColBuffer, minBrightnessBindGroup, this.maxHp)
  }
}