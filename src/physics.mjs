import {shipGeometries} from "./shipGeometries.mjs";

class Event{
    /** @type {number} */
    time
    run(){}
    constructor(time) {
        this.time = time
    }
}

class ShipCollision extends Event{
    /** @type {Ship} */
    shipA

    /** @type {Ship} */
    shipB

    /** @type {Simulation} */
    sim

    constructor(time, shipA, shipB, sim) {
        super(time)
        this.shipA = shipA
        this.shipB = shipB
        this.sim = sim
    }

    run() {
        this.shipA.move(this.time)
        this.shipB.move(this.time)

        const aDashing = this.shipA.dashProgress < this.shipA.dashTime + this.shipA.dashBuffer
        const bDashing = this.shipB.dashProgress < this.shipB.dashTime + this.shipB.dashBuffer

        navigator.vibrate(100)
        const diff = this.shipB.vel.xy.sub(this.shipA.vel)
        const normalized = diff.xy.normalize()

        if(aDashing && bDashing){
            this.shipA.vel.add(diff.xy.mult(1/2)).add(normalized.xy.mult(this.shipA.playerKnockback))
            this.shipA.lowTractionProgress = 0
            this.sim.walls.delete(this.shipB.dashWall)
            this.shipB.dashProgress = this.shipB.dashTime

            this.shipB.vel.sub(diff.xy.mult(1/2)).sub(normalized.xy.mult(this.shipB.playerKnockback))
            this.shipB.lowTractionProgress = 0
            this.sim.walls.delete(this.shipA.dashWall)
            this.shipA.dashProgress = this.shipA.dashTime
        }else if(aDashing){
            this.shipB.vel.sub(diff.xy.mult(1)).sub(normalized.xy.mult(this.shipB.playerKnockback))
            this.shipB.lowTractionProgress = 0
            this.sim.walls.delete(this.shipA.dashWall)
            this.shipA.dashProgress = this.shipA.dashTime


            this.shipA.vel.add(diff.xy.mult(0)).add(normalized.xy.mult(this.shipA.playerKnockback))
            this.shipB.hp --
            this.shipB.hpDisplayProgress = 0
        }else if(bDashing){
            this.shipA.vel.add(diff.xy.mult(1)).add(normalized.xy.mult(this.shipA.playerKnockback))
            this.shipA.lowTractionProgress = 0
            this.sim.walls.delete(this.shipB.dashWall)
            this.shipB.dashProgress = this.shipB.dashTime

            this.shipB.vel.sub(diff.xy.mult(0)).sub(normalized.xy.mult(this.shipB.playerKnockback))
            this.shipA.hp --
            this.shipA.hpDisplayProgress = 0
        }else{
            this.shipA.vel.add(diff.xy.mult(1/2)).add(normalized.xy.mult(this.shipA.playerKnockback))
            this.shipA.lowTractionProgress = 0
            this.shipB.vel.sub(diff.xy.mult(1/2)).sub(normalized.xy.mult(this.shipB.playerKnockback))
            this.shipB.lowTractionProgress = 0
        }

        this.sim.recalculateShip(this.shipA)
        this.sim.recalculateShip(this.shipB)
    }
}

class WallCollision extends Event{
    /** @type {Ship} */
    ship

    /** @type {Wall} */
    wall

    constructor(time, ship, wall, perp, perpVel, sim) {
        super(time)
        this.ship = ship
        this.wall = wall
        this.perp = perp
        this.perpVel = perpVel
        this.sim = sim
    }

    run(){
        this.ship.move(this.time)
        this.wall.move(this.time)

        const dashing = this.ship.dashProgress < this.ship.dashTime + this.ship.dashBuffer

        navigator.vibrate(100)

        if(!this.wall.persists){
            this.sim.walls.delete(this.wall)
            this.sim.removeWall(this.wall)
        }

        if(this.wall.persists || !dashing) {
            this.ship.vel.add(this.perp.mult(-this.ship.wallKnockback * Math.sign(this.perpVel) - this.perpVel))
            this.ship.lowTractionProgress = 0
        }

        if(dashing){
            this.sim.walls.delete(this.ship.dashWall)
            this.sim.removeWall(this.ship.dashWall)
            this.ship.dashProgress = this.ship.dashTime
        }else{
            this.ship.hp --
            this.ship.hpDisplayProgress = 0
        }

        this.sim.recalculateShip(this.ship)
    }
}

class UpdateEvent extends Event{
    /** @type {Simulation} */
    simulation

    constructor(time, simulation) {
        super(time)
        this.simulation = simulation
    }
    run() {
        simulation.moveAll(this.time)
        simulation.update()
    }
}

/**
 * @param {Set<Event>} events
 * @param {Ship} shipA
 * @param {Ship} shipB
 */
function shipCollision(events, shipA, shipB){
}

/**
 * @param {Array<Ship>} ships
 * @param {Set<Wall>} walls
 * @param {number} time
 */
function runPhysics(ships, walls, time){
    /** @type {Set<Event>} */
    const events = new Set()

}

export {Event, ShipCollision, WallCollision, UpdateEvent, shipCollision, runPhysics}