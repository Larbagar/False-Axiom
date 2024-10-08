import {Event} from "./Event.mjs"
import {move} from "./mover.mjs"
import {recalculateShipEvents} from "./eventHelpers.mjs"
import {ParticleCluster} from "../ParticleCluster.mjs"

class BlastCollision extends Event {
    /** @type {Simulation} */
    sim
    /** @type {Game} */
    game
    /** @type {Ship} */
    ship
    /** @type {Blast} */
    blast

    /** @type {V2} */
    perp
    /** @type {number} */
    perpVel

    constructor(time, sim, game, ship, blast, perp, perpVel) {
        super(time)
        this.sim = sim
        this.game = game
        this.ship = ship
        this.blast = blast
        this.perp = perp
        this.perpVel = perpVel
    }

    trigger(){
        move(this.game, this.sim.time)
        navigator.vibrate(100)
        this.ship.vel.xy = this.blast.vel.xy.normalize().mult(this.ship.blastKnockback)
        this.ship.lowTractionProgress = 0
        this.ship.hp--
        this.ship.hpDisplayProgress = 0
        this.blast.shipsHit.add(this.ship)
        this.game.particleClusters.add(new ParticleCluster({
            count: 10,
            col: this.ship.col.map(x => 0.2*x),
            pos: this.ship.pos,
            outVel: this.ship.blastKnockback*0.3,
            fadeSpeed: 0.001,
            avgAngle: this.blast.vel.dir,
            friction: 0.998,
            angSpread: Math.PI/2
        }))
        recalculateShipEvents(this.sim, this.game, this.ship)
    }
}

/**
 * @param {Simulation} sim
 * @param {Game} game
 * @param {Ship} ship
 * @param {Blast} blast
 */
function checkBlastCollision(sim, game, ship, blast){
    const
        diff = ship.pos.xy.sub(blast.p0),
        lenVec = blast.p1.xy.sub(blast.p0),
        tan = lenVec.xy.normalize(),
        perp = tan.xy.perp(),
        dist = perp.dot(diff),
        perpVel = perp.dot(ship.vel.xy.sub(blast.vel)),
        dt = -dist / perpVel - ship.size / Math.abs(perpVel),
        time = sim.time + dt,
        len = lenVec.mag,
        tanDist = tan.dot(diff.xy.add(ship.vel.xy.mult(dt)))
    if (0 < tanDist && tanDist < len && !blast.shipsHit.has(ship)) {
        sim.events.add(new BlastCollision(time, sim, game, ship, blast, perp, perpVel))
    }
}

export {BlastCollision, checkBlastCollision}