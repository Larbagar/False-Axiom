import {Event} from "./Event.mjs"
import {recalculateShipEvents} from "./eventHelpers.mjs"
import {move} from "./mover.mjs"
import {ParticleCluster} from "../ParticleCluster.mjs"

class ShipCollision extends Event{
    /** @type {Ship} */
    shipA

    /** @type {Ship} */
    shipB

    /** @type {Simulation} */
    sim

    /** @type {Game} */
    game

    constructor(time, shipA, shipB, sim, game) {
        super(time)
        this.shipA = shipA
        this.shipB = shipB
        this.sim = sim
        this.game = game
    }

    trigger() {
        move(this.game, this.sim.time)

        const aDashing = this.shipA.dashProgress < this.shipA.dashTime + this.shipA.dashBuffer
        const bDashing = this.shipB.dashProgress < this.shipB.dashTime + this.shipB.dashBuffer

        navigator.vibrate(100)
        const diff = this.shipB.vel.xy.sub(this.shipA.vel)
        const normalized = diff.xy.normalize()

        if(aDashing && bDashing){
            this.shipA.vel.add(diff.xy.mult(0.75)).add(normalized.xy.mult(this.shipA.shipKnockback))
            this.shipA.lowTractionProgress = 0
            this.game.walls.delete(this.shipB.dashWall)
            this.shipB.dashProgress = this.shipB.dashTime
            // this.game.particleClusters.add(new ParticleCluster({
            //     count: 20,
            //     col: this.shipA.col.map(x => 0.4*x),
            //     pos: this.shipA.pos,
            //     outVel: this.shipA.wallKnockback*0.3,
            //     fadeSpeed: 0.001,
            //     avgAngle: diff.dir,
            //     friction: 0.998,
            //     angSpread: Math.PI/2
            // }))

            this.shipB.vel.sub(diff.xy.mult(0.75)).sub(normalized.xy.mult(this.shipB.shipKnockback))
            this.shipB.lowTractionProgress = 0
            this.game.walls.delete(this.shipA.dashWall)
            this.shipA.dashProgress = this.shipA.dashTime
            // this.game.particleClusters.add(new ParticleCluster({
            //     count: 20,
            //     col: this.shipB.col.map(x => 0.4*x),
            //     pos: this.shipB.pos,
            //     outVel: this.shipB.wallKnockback*0.3,
            //     fadeSpeed: 0.001,
            //     avgAngle: diff.dir + Math.PI,
            //     friction: 0.998,
            //     angSpread: Math.PI/2
            // }))
        }else if(aDashing){
            this.shipB.vel.sub(diff.xy.mult(0.75)).sub(normalized.xy.mult(this.shipB.shipKnockback))
            this.shipB.lowTractionProgress = 0
            this.game.walls.delete(this.shipA.dashWall)
            this.shipA.dashProgress = this.shipA.dashTime


            this.shipA.vel.add(diff.xy.mult(0.25)).add(normalized.xy.mult(this.shipA.shipKnockback))
            this.shipB.hp --
            this.shipB.hpDisplayProgress = 0
            this.shipB.dashProgress = this.shipB.dashTime + this.shipB.dashBuffer
            this.game.particleClusters.add(new ParticleCluster({
                count: 10,
                col: this.shipB.col.map(x => 0.2*x),
                pos: this.shipB.pos,
                outVel: this.shipB.shipKnockback*0.3,
                fadeSpeed: 0.001,
                avgAngle: diff.dir + Math.PI,
                friction: 0.998,
                angSpread: Math.PI/2
            }))
        }else if(bDashing){
            this.shipA.vel.add(diff.xy.mult(0.75)).add(normalized.xy.mult(this.shipA.shipKnockback))
            this.shipA.lowTractionProgress = 0
            this.game.walls.delete(this.shipB.dashWall)
            this.shipB.dashProgress = this.shipB.dashTime

            this.shipB.vel.sub(diff.xy.mult(0.25)).sub(normalized.xy.mult(this.shipB.shipKnockback))
            this.shipA.hp --
            this.shipA.hpDisplayProgress = 0
            this.shipA.dashProgress = this.shipA.dashTime + this.shipA.dashBuffer
            this.game.particleClusters.add(new ParticleCluster({
                count: 10,
                col: this.shipA.col.map(x => 0.2*x),
                pos: this.shipA.pos,
                outVel: this.shipA.wallKnockback*0.3,
                fadeSpeed: 0.001,
                avgAngle: diff.dir,
                friction: 0.998,
                angSpread: Math.PI/2
            }))
        }else{
            this.shipA.vel.add(diff.xy.mult(0.5)).add(normalized.xy.mult(this.shipA.shipKnockback))
            this.shipA.lowTractionProgress = 0
            // this.game.particleClusters.add(new ParticleCluster({
            //     count: 2,
            //     col: this.shipA.col.map(x => 0.04*x),
            //     pos: this.shipA.pos,
            //     outVel: this.shipA.wallKnockback*0.3,
            //     fadeSpeed: 0.001,
            //     avgAngle: diff.dir,
            //     friction: 0.998,
            //     angSpread: Math.PI/2
            // }))
            this.shipB.vel.sub(diff.xy.mult(0.5)).sub(normalized.xy.mult(this.shipB.shipKnockback))
            this.shipB.lowTractionProgress = 0
            // this.game.particleClusters.add(new ParticleCluster({
            //     count: 2,
            //     col: this.shipB.col.map(x => 0.04*x),
            //     pos: this.shipB.pos,
            //     outVel: this.shipB.wallKnockback*0.3,
            //     fadeSpeed: 0.001,
            //     avgAngle: diff.dir + Math.PI,
            //     friction: 0.998,
            //     angSpread: Math.PI/2
            // }))
        }

        recalculateShipEvents(this.sim, this.game, this.shipA)
        recalculateShipEvents(this.sim, this.game, this.shipB)
    }
}

/**
 * @param {Simulation} sim
 * @param {Game} game
 * @param {Ship} shipA
 * @param {Ship} shipB
 */
function checkShipCollision(sim, game, shipA, shipB){
    const
        ap = shipA.pos.xy,
        bp = shipB.pos.xy,
        dp = bp.xy.sub(ap),
        dv = shipB.vel.xy.sub(shipA.vel),
        discriminant = (dv.x**2 + dv.y**2)*(shipA.size + shipB.size)**2 - (dv.y*dp.x - dv.x*dp.y)**2,
        dt = -(dp.x*dv.x + dp.y*dv.y + Math.sqrt(discriminant))/(dv.x**2+dv.y**2)
    if(discriminant > 0){
        sim.events.add(new ShipCollision(
            sim.time + dt,
            shipA,
            shipB,
            sim,
            game,
        ))
    }
}

export {ShipCollision, checkShipCollision}