import V2 from "./V2.mjs"
import { shipGeometries } from "./shipGeometries.mjs"
import { device } from "./graphics/device.mjs"
import { lightLine } from "./graphics/light/lightLine.mjs"
import { transformMatrixBindGroupLayout } from "./graphics/transformMatrixBindGroupLayout.mjs"
import { Trail } from "./Trail.mjs"
import M3 from "./M3.mjs"
import { Wall } from "./Wall.mjs"
import { lightPoint } from "./graphics/light/lightPoint.mjs"

export class Ship {
  /** @type {V2} */
  pos
  vel = V2.zero()

  time = 0

  /** @type {number} */
  dir
  angVel = 0

  /** @type {Controller} */
  controller

  /** @type {Iterable<number>} */
  col

  /*
  turnSpeed = 0.1
  turnFric = 0.3

  speed = 0.02
  forwardFric = 0.02
  sideFric = 0.2

  wallKnockback = 0.03
  playerKnockback = 0.01

  lowTraction = 0.01
  lowTractionTime = 500

  dashTime = 10
  dashBuffer = 5
  dashCooldown = 20

  dashSpeed = 0.04

  hpShowTime = 120
  hpFadeTime = 20
   */

  turnSpeed = 0.006
  turnFric = 0.02

  speed = 0.0012
  forwardFric = 0.0012
  sideFric = 0.012

  wallKnockback = 0.0018
  playerKnockback = 0.0006

  lowTraction = 0.0006
  lowTractionTime = 8000

  dashTime = 170
  dashBuffer = 80
  dashCooldown = 300

  dashSpeed = 0.0024

  hpShowTime = 2000
  hpFadeTime = 300

  size = 0.03


  /** @type {ShipGeometry} */
  geometry
  /** @type {GPUBuffer} */
  shipColBuffer

  lowTractionProgress = this.lowTractionTime

  /** @type {Array<Trail>} */
  trails

  dashProgress = this.dashTime + this.dashBuffer + this.dashCooldown
  /** @type {number} */
  dashDir
  /** @type {Wall} */
  dashWall


  dashDecay = 1

  nextVel = V2.zero()

  hpHeight = 3
  hpDist = 2

  hpDisplayProgress = 0

  maxHp = 5
  hp = this.maxHp


  /**
   * @param {V2} pos
   * @param {number} dir
   * @param {Controller} controller
   * @param {Iterable<number>} col
   */
  constructor(pos, dir, controller, col) {
    this.pos = pos
    this.dir = dir
    this.controller = controller
    this.col = col

    this.geometry = shipGeometries[0]

    const shipCol = new Float32Array(Array.from({length: this.geometry.edgeCount}, _ => this.col).flat())

    this.shipColBuffer = device.createBuffer({
      label: "light col buffer",
      size: shipCol.byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
    })
    device.queue.writeBuffer(this.shipColBuffer, 0, shipCol)

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

    /** @type {Array<Trail>} */
    this.trails = []
    for(const description of this.geometry.trailDescriptions){
      this.trails.push(new Trail(description.dimSpeed, {col: description.col, friction: description.friction}))
    }
  }

  update(dt, simulation) {
    if(this.dashProgress < this.dashTime && this.dashTime <= this.dashProgress + dt){
      // End the dash
      this.controller.dashEnd()
      this.vel.mult(this.dashDecay)
    }else if(
        this.controller.dash &&
        this.dashTime + this.dashBuffer + this.dashCooldown <= this.dashProgress + dt
    ){
      // Start the dash
      this.dashProgress = 0
      this.dashDir = this.dir
      this.dashWall = new Wall(V2.fromPolar(-this.size, this.dir).add(this.pos), this.dir, this.dashSpeed * this.dashTime, 1/this.dashTime, this.col, this.time)
      simulation.walls.add(this.dashWall)
      this.vel.xy = V2.fromPolar(this.dashSpeed, this.dashDir)
    }
    if(this.dashProgress + dt < this.dashTime){

      // Dashing

      this.angVel += (this.turnSpeed * this.controller.turn - this.angVel) * (1 - (1 - this.turnFric)**dt)

    }else{

      // Normal movement

      this.angVel += (this.turnSpeed * this.controller.turn - this.angVel) * (1 - (1 - this.turnFric)**dt)


      this.vel.rotate(-this.dir)

      let traction = Math.min(1, this.lowTractionProgress / this.lowTractionTime)

      let sideFric = (this.sideFric * traction + this.lowTraction * (1 - traction))
      let fric

      if (this.vel.x >= 0) {
        fric = this.forwardFric
      } else {
        fric = sideFric
      }
      this.vel.x += (this.speed * this.controller.forward - this.vel.x) * (1 - (1 - fric)**dt)
      this.vel.y -= this.vel.y * (1 - (1 - sideFric)**dt)
      this.vel.rotate(this.dir)
    }
    this.dashProgress += dt
    this.lowTractionProgress += dt
    this.hpDisplayProgress += dt
  }

  /**
   * @param {Set<Wall>} walls
   * @param {Array<Ship>} ships
   */
  collide(walls, ships) {
    let restart = true
    let dashing = this.dashProgress < this.dashTime + this.dashBuffer
    while(restart) {
      restart = false
      for(const ship of ships){
        if(ship != this){
          if(this.pos.copy().add(this.vel).distance(ship.pos.copy().add(ship.vel)) < this.size + ship.size){
            navigator.vibrate(100)
            const diff = this.vel.copy().sub(ship.vel)
            const normalized = diff.copy().normalize()
            const shipDashing = ship.dashProgress < ship.dashTime + ship.dashBuffer
            if(dashing){
            }
            if(dashing && shipDashing){
              this.vel.sub(diff.copy().mult(1/2)).sub(normalized.copy().mult(this.playerKnockback))
              this.lowTractionProgress = 0
              walls.delete(ship.dashWall)
              ship.dashProgress = ship.dashTime + ship.dashBuffer

              ship.vel.add(diff.copy().mult(1/2)).add(normalized.copy().mult(ship.playerKnockback))
              ship.lowTractionProgress = 0
              walls.delete(this.dashWall)
              this.dashProgress = this.dashTime + this.dashBuffer
            }else if(dashing){
              walls.delete(this.dashWall)
              this.dashProgress = this.dashTime + this.dashBuffer
              ship.vel.add(diff).add(normalized.copy().mult(ship.playerKnockback))
              ship.lowTractionProgress = 0
              ship.hp --
              ship.hpDisplayProgress = 0
            }else if(shipDashing){
              walls.delete(ship.dashWall)
              ship.dashProgress = ship.dashTime + ship.dashBuffer
              this.vel.sub(diff).sub(normalized.copy().mult(this.playerKnockback))
              this.lowTractionProgress = 0
              this.hp --
              this.hpDisplayProgress = 0
            }else{
              this.vel.sub(diff.copy().mult(1/2)).sub(normalized.copy().mult(this.playerKnockback))
              this.lowTractionProgress = 0
              ship.vel.add(diff.copy().mult(1/2)).add(normalized.copy().mult(ship.playerKnockback))
              ship.lowTractionProgress = 0
            }
          }
        }
      }
    }
  }

  move(targetTime) {
    const dt = targetTime - this.time
    this.time = targetTime

    this.pos.add(this.vel.copy().mult(dt))
    this.dir += this.angVel * dt

    const brightness = 0.2*this.controller.forward*(this.dashProgress >= this.dashTime)
    for(let i = 0; i < this.geometry.trailDescriptions.length; i++){
      this.trails[i].run(
          this.geometry.trailDescriptions[i].location.copy().mult(this.size).rotate(this.dir).add(this.pos),
          this.geometry.trailDescriptions[i].v0.copy().rotate(this.dir),
          this.col.map(x => brightness*x),
      )
    }
  }

  draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup) {
    const shipTransform = M3.identity().rotate(this.dir).scaleS(this.size).translate(this.pos)
    device.queue.writeBuffer(this.shipTransformBuffer, 0, shipTransform.arr)
    lightLine(encoder, lightTex, cameraBindGroup, this.shipTransformBindGroup, this.geometry.buffer, this.shipColBuffer, minBrightnessBindGroup, this.geometry.edgeCount)
    for(const trail of this.trails){
      trail.draw(encoder, cameraBindGroup, lightTex, minBrightnessBindGroup)
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