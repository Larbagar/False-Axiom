import {Event} from "./Event.mjs"
import {recalculateShipEvents} from "./eventHelpers.mjs"
import {move} from "./mover.mjs"

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
            this.shipA.vel.add(diff.xy.mult(1/2)).add(normalized.xy.mult(this.shipA.playerKnockback))
            this.shipA.lowTractionProgress = 0
            this.game.walls.delete(this.shipB.dashWall)
            this.shipB.dashProgress = this.shipB.dashTime

            this.shipB.vel.sub(diff.xy.mult(1/2)).sub(normalized.xy.mult(this.shipB.playerKnockback))
            this.shipB.lowTractionProgress = 0
            this.game.walls.delete(this.shipA.dashWall)
            this.shipA.dashProgress = this.shipA.dashTime
        }else if(aDashing){
            this.shipB.vel.sub(diff.xy.mult(1)).sub(normalized.xy.mult(this.shipB.playerKnockback))
            this.shipB.lowTractionProgress = 0
            this.game.walls.delete(this.shipA.dashWall)
            this.shipA.dashProgress = this.shipA.dashTime


            this.shipA.vel.add(diff.xy.mult(0)).add(normalized.xy.mult(this.shipA.playerKnockback))
            this.shipB.hp --
            this.shipB.hpDisplayProgress = 0
            if(this.shipB.hp <= 0){
                const index = this.game.ships.indexOf(this.shipB);
                if (index > -1) {
                    this.game.ships.splice(index, 1);
                }
            }
        }else if(bDashing){
            this.shipA.vel.add(diff.xy.mult(1)).add(normalized.xy.mult(this.shipA.playerKnockback))
            this.shipA.lowTractionProgress = 0
            this.game.walls.delete(this.shipB.dashWall)
            this.shipB.dashProgress = this.shipB.dashTime

            this.shipB.vel.sub(diff.xy.mult(0)).sub(normalized.xy.mult(this.shipB.playerKnockback))
            this.shipA.hp --
            this.shipA.hpDisplayProgress = 0
            if(this.shipA.hp <= 0){
                const index = this.game.ships.indexOf(this.shipA);
                if (index > -1) {
                    this.game.ships.splice(index, 1);
                }
            }
        }else{
            this.shipA.vel.add(diff.xy.mult(1/2)).add(normalized.xy.mult(this.shipA.playerKnockback))
            this.shipA.lowTractionProgress = 0
            this.shipB.vel.sub(diff.xy.mult(1/2)).sub(normalized.xy.mult(this.shipB.playerKnockback))
            this.shipB.lowTractionProgress = 0
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