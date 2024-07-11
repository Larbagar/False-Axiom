class Game {
    time = 0

    /** @type {Array<Ship>} */
    ships = []
    /** @type {Set<Wall>} */
    walls = new Set()
    /** @type {Set<Blast>} */
    blasts = new Set()

    /** @type {Set<RubbleCluster>} */
    rubbleClusters = new Set()
    /** @type {Set<Explosion>} */
    explosions = new Set()


    /** @type {TouchControllerHandler} */
    touchControllerHandler

    updateSpacing = 6
}

export {Game}