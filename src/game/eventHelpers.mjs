import {checkShipCollision, ShipCollision} from "./shipCollision.mjs"
import {checkWallCollision, WallCollision} from "./wallCollision.mjs"
import {BlastCollision, checkBlastCollision} from "./blastCollision.mjs"

/**
 * @param {Simulation} sim
 * @param {Ship} ship
 */
function removeShipEvents(sim, ship){
    for(const event of sim.events){
        if(
            (
                event instanceof ShipCollision &&
                (event.shipA === ship || event.shipB === ship)
            ) || (
                event instanceof WallCollision &&
                event.ship === ship
            ) || (
                event instanceof BlastCollision &&
                event.ship === ship
            )
        ){
            sim.events.delete(event)
        }
    }
}
/**
 * @param {Simulation} sim
 * @param {Game} game
 * @param {Ship} ship
 */
function recalculateShipEvents(sim, game, ship){
    removeShipEvents(sim, ship)
    for(const otherShip of game.ships){
        checkShipCollision(sim, game, ship, otherShip)
    }
    for(const wall of game.walls){
        checkWallCollision(sim, game, ship, wall)
    }
    for(const blast of game.blasts){
        checkBlastCollision(sim, game, ship, blast)
    }
}
/**
 * @param {Simulation} sim
 * @param {Wall} wall
 */
function removeWallEvents(sim, wall){
    for(const event of sim.events){
        if(event instanceof WallCollision && event.wall === wall){
            sim.events.delete(event)
        }
    }
}
/**
 * @param {Simulation} sim
 * @param {Game} game
 */
function recalculateAllEvents(sim, game){
    sim.events.clear()
    for(let i = 0; i < game.ships.length; i++){
        const shipA = game.ships[i]
        for(let j = i + 1; j < game.ships.length; j++){
            const shipB = game.ships[j]
            checkShipCollision(sim, game, shipA, shipB)
        }
    }
    for(const ship of game.ships){
        for(const wall of game.walls){
            checkWallCollision(sim, game, ship, wall)
        }
    }
    for(const ship of game.ships){
        for(const blast of game.blasts){
            checkBlastCollision(sim, game, ship, blast)
        }
    }
}

export {removeShipEvents, recalculateShipEvents, recalculateAllEvents, removeWallEvents}