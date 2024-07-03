import {TouchControllerHandler} from "./TouchControllerHandler.mjs";
import {Event, ShipCollision, shipCollision, UpdateEvent, WallCollision} from "./physics.mjs"
import V2 from "./V2.mjs"
import {Wall} from "./Wall.mjs"

class Simulation {
    /** @type {Array<Ship>} */
    ships
    /** @type {Set<Wall>} */
    walls
    /** @type {TouchControllerHandler} */
    touchControllerHandler

    time = 0
    updateTime = 16

    /** @type {Set<Event>} */
    events = new Set()

    /**
     * @param {Array<Ship>} ships
     * @param {Set<Wall>} walls
     * @param {TouchControllerHandler} touchControllerHandler
     */
    constructor(ships, walls = new Set(), touchControllerHandler = new TouchControllerHandler()) {
        this.ships = ships
        this.walls = walls
        this.touchControllerHandler = touchControllerHandler
    }
    update(dt = this.updateTime){
        this.touchControllerHandler.update()
        for(const ship of this.ships){
            ship.update(dt, this)
        }
        // for(const wall of this.walls){
        //     wall.update(this.walls)
        // }
        this.generateEvents()
    }

    /**
     * @param {Ship} shipA
     * @param {Ship} shipB
     */
    shipCollision(shipA, shipB){
        const
            ap = shipA.pos.xy.add(shipA.vel.xy.mult(this.time - shipA.time)),
            bp = shipB.pos.xy.add(shipB.vel.xy.mult(this.time - shipB.time)),
            dp = bp.xy.sub(ap),
            dv = shipB.vel.xy.sub(shipA.vel),
            discriminant = (dv.x**2 + dv.y**2)*(shipA.size + shipB.size)**2 - (dv.y*dp.x - dv.x*dp.y)**2,
            dt = -(dp.x*dv.x + dp.y*dv.y + Math.sqrt(discriminant))/(dv.x**2+dv.y**2)
        if(discriminant > 0){
            this.events.add(new ShipCollision(
                this.time + dt,
                shipA,
                shipB,
                this,
            ))
        }
    }

    /**
     * @param {Ship} ship
     * @param {Wall} wall
     */
    wallCollision(ship, wall){
        const
            diff = ship.pos.xy.sub(wall.pos),
            tan = V2.fromPolar(1, wall.dir),
            perp = tan.xy.perp(),
            dist = perp.dot(diff),
            perpVel = perp.dot(ship.vel),
            dt = - dist/perpVel - ship.size/Math.abs(perpVel),
            time = this.time + dt,
            len = Math.min(wall.len + (time - wall.initTime)*wall.growSpeed, wall.maxLen),
            tanDist = tan.dot(diff.xy.add(ship.vel.xy.mult(dt)))
        if(0 < tanDist && tanDist < len){
            this.events.add(new WallCollision(
                time,
                ship,
                wall,
                perp,
                perpVel,
                this,
            ))
        }
    }
    generateEvents(){
        this.events.clear()
        for(let i = 0; i < this.ships.length; i++){
            const shipA = this.ships[i]
            for(let j = i + 1; j < this.ships.length; j++){
                const shipB = this.ships[j]
                this.shipCollision(shipA, shipB)
            }
        }
        for(const ship of this.ships){
            for(const wall of this.walls){
                this.wallCollision(ship, wall)
            }
        }
        this.events.add(new UpdateEvent(
            Math.floor(this.time/this.updateTime + 1)*this.updateTime,
            this
        ))
    }

    /**
     * @param {Ship} ship
     */
    recalculateShip(ship){
        this.removeShip(ship)
        for(const otherShip of this.ships){
            this.shipCollision(ship, otherShip)
        }
        for(const wall of this.walls){
            this.wallCollision(ship, wall)
        }
    }

    /**
     * @param {Ship} ship
     */
    removeShip(ship){
        for(const event of this.events){
            if(
                (
                    event instanceof ShipCollision &&
                    (event.shipA === ship || event.shipB === ship)
                ) || (
                    event instanceof WallCollision &&
                    event.ship === ship
                )
            ){
                this.events.delete(event)
            }
        }
    }

    /**
     * @param {Wall} wall
     */
    recalculateWall(wall){
        this.removeWall(wall)
        for(const ship of this.ships){
            this.wallCollision(ship, wall)
        }
    }
    /**
     * @param {Wall} wall
     */
    removeWall(wall){
        for(const event of this.events){
            if(event instanceof WallCollision && event.wall === wall){
                this.events.delete(event)
            }
        }
    }

    simulate(newTime){
        while(true){
            const eventsToRun = new Set()
            let nextTime = Infinity
            for(const event of this.events){
                if(this.time <= event.time && event.time <= nextTime){
                    if(event.time < nextTime){
                        eventsToRun.clear()
                        nextTime = event.time
                    }
                    eventsToRun.add(event)
                }
            }
            if(nextTime < newTime){
                this.time = nextTime
                for(const event of eventsToRun){
                    event.run()
                }
            }else{
                break
            }
        }
        this.time = newTime
        this.moveAll(newTime)
    }
    moveAll(dt){
        for(const ship of this.ships){
            ship.move(dt)
        }
        for(const wall of this.walls){
            wall.move(dt)
        }
    }
}

export {Simulation}