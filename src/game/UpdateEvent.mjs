import {recalculateAllEvents} from "./eventHelpers.mjs"
import {move} from "./mover.mjs"
import {Event} from "./Event.mjs"

class UpdateEvent extends Event {
    /** @type {Game} */
    game
    /** @type {Simulation} */
    sim
    constructor(game, simulation, time) {
        super(time)
        this.game = game
        this.sim = simulation
    }
    trigger(){
        move(this.game, this.sim.time)
        this.game.touchControllerHandler.update()
        for(const ship of this.game.ships){
            ship.update(this.game.updateSpacing, this.game)
        }
        for(const blast of this.game.blasts){
            blast.update(this.game.updateSpacing, this.game)
        }
        for(const rubbleCluster of this.game.rubbleClusters){
            rubbleCluster.update(this.game.updateSpacing)
        }
        recalculateAllEvents(this.sim, this.game)

        this.sim.events.add(new UpdateEvent(
            this.game,
            this.sim,
            this.time + this.game.updateSpacing,
        ))
    }
}

export {UpdateEvent}