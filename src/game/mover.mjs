function move(game, newTime){
    const dt = newTime - game.time
    game.time = newTime
    for(const ship of game.ships){
        ship.move(dt)
    }
    for(const wall of game.walls){
        wall.move(dt)
    }
    for(const blast of game.blasts){
        blast.move(dt)
    }
    for(const rubbleCluster of game.rubbleClusters){
        rubbleCluster.move(dt)
    }
}

export {move}