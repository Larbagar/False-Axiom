import V2 from "../V2.mjs"
import {Event} from "./Event.mjs"
import {move} from "./mover.mjs"
import {recalculateShipEvents, removeWallEvents} from "./eventHelpers.mjs"
import {Blast} from "./Blast.mjs"
import {RubbleCluster} from "../RubbleCluster.mjs"
import {ParticleCluster} from "../ParticleCluster.mjs"

class WallCollision extends Event {
    /** @type {Simulation} */
    sim
    /** @type {Game} */
    game
    /** @type {Ship} */
    ship
    /** @type {Wall} */
    wall

    /** @type {V2} */
    perp
    /** @type {number} */
    perpVel


    constructor(time, sim, game, ship, wall, perp, perpVel) {
        super(time)
        this.sim = sim
        this.game = game
        this.ship = ship
        this.wall = wall
        this.perp = perp
        this.perpVel = perpVel
    }

    trigger() {
        move(this.game, this.sim.time)

        const dashing = this.ship.dashProgress < this.ship.dashTime + this.ship.dashBuffer

        navigator.vibrate(100)

        if (!this.wall.persists) {
            this.game.walls.delete(this.wall)
            removeWallEvents(this.sim, this.wall)
        }

        if(!this.wall.persists && !dashing){
            const perp = this.wall.p1.xy.sub(this.wall.p0).mult(this.perpVel).perp().normalize()

            const brightness = []
            const velocities = []
            const fadeSpeeds = []
            for(let i = 0; i < 10; i++){
                brightness[3*i + 0] = this.wall.colArray[0]*(i + 1)
                brightness[3*i + 1] = this.wall.colArray[1]*(i + 1)
                brightness[3*i + 2] = this.wall.colArray[2]*(i + 1)
                velocities[i] = perp.xy.mult(0.0002*i)
                fadeSpeeds[3*i + 0] = this.wall.colArray[0]*0.02
                fadeSpeeds[3*i + 1] = this.wall.colArray[1]*0.02
                fadeSpeeds[3*i + 2] = this.wall.colArray[2]*0.02
            }
            const tot = [0, 0, 0]
            for(let i = 0; i < 10; i++){
                tot[0] += brightness[3*i + 0]
                tot[1] += brightness[3*i + 1]
                tot[2] += brightness[3*i + 2]
            }
            const scale = 10
            for(let i = 0; i < 10; i++){
                brightness[3*i + 0] *= scale*this.wall.colArray[0]/tot[0]
                brightness[3*i + 1] *= scale*this.wall.colArray[1]/tot[1]
                brightness[3*i + 2] *= scale*this.wall.colArray[2]/tot[2]
                fadeSpeeds[3*i + 0] *= scale*this.wall.colArray[0]/tot[0]
                fadeSpeeds[3*i + 1] *= scale*this.wall.colArray[1]/tot[1]
                fadeSpeeds[3*i + 2] *= scale*this.wall.colArray[2]/tot[2]
            }


            this.game.rubbleClusters.add(new RubbleCluster(
                this.wall.p0,
                this.wall.p1,
                velocities,
                brightness,
                fadeSpeeds,
                0.995,
            ))
        }

        if (this.wall.persists || !dashing) {
            this.ship.vel.add(this.perp.xy.mult(-this.ship.wallKnockback * Math.sign(this.perpVel) - this.perpVel))
            this.ship.lowTractionProgress = 0
        }

        if (dashing) {
            this.game.walls.delete(this.ship.dashWall)
            removeWallEvents(this.sim, this.ship.dashWall)
            this.ship.dashProgress = this.ship.dashTime
        } else {
            this.ship.hp--
            this.ship.hpDisplayProgress = 0
            this.ship.dashProgress = this.ship.dashTime + this.ship.dashBuffer
            this.game.particleClusters.add(new ParticleCluster({
                count: 10,
                col: this.ship.col.map(x => 0.2*x),
                pos: this.ship.pos,
                outVel: this.ship.wallKnockback*0.3,
                fadeSpeed: 0.001,
                avgAngle: this.perp.xy.mult(Math.sign(-this.perpVel)).dir,
                friction: 0.998,
                angSpread: Math.PI/2
            }))
        }

        if (dashing && !this.wall.persists) {
            const vel = this.wall.p1.copy().sub(this.wall.p0).perp()
            vel.mag = this.ship.blastVel * Math.sign(this.perpVel)
            const newBlast = new Blast(this.wall.p0.copy(), this.wall.p1.copy(), vel, this.wall.colArray)
            this.game.blasts.add(newBlast)
        }

        recalculateShipEvents(this.sim, this.game, this.ship)
    }
}

/**
 * @param {Simulation} sim
 * @param {Game} game
 * @param {Ship} ship
 * @param {Wall} wall
 */
function checkWallCollision(sim, game, ship, wall) {
    const
        diff = ship.pos.xy.sub(wall.p0),
        tan = V2.fromPolar(1, wall.dir),
        perp = tan.xy.perp(),
        dist = perp.dot(diff),
        perpVel = perp.dot(ship.vel),
        dt = -dist / perpVel - ship.size / Math.abs(perpVel),
        time = sim.time + dt,
        len = Math.min(wall.len + dt * wall.growSpeed, wall.maxLen),
        tanDist = tan.dot(diff.xy.add(ship.vel.xy.mult(dt)))
    if (0 < tanDist && tanDist < len) {
        sim.events.add(new WallCollision(time, sim, game, ship, wall, perp, perpVel))
    }
}

export {checkWallCollision}
export {WallCollision}