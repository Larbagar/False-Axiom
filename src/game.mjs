import V2 from "./V2.mjs"
import { Ship } from "./game/Ship.mjs"
import { KeyboardControllerHandler } from "./KeyboardControllerHandler.mjs"
import { Wall } from "./game/Wall.mjs"
import { TouchController } from "./TouchController.mjs"
import { TouchControllerHandler } from "./TouchControllerHandler.mjs"
import {draw} from "./graphics/draw.mjs"
import {shipGeometries} from "./shipGeometries.mjs"
import {Simulation} from "./game/Simulation.mjs"
import {UpdateEvent} from "./game/UpdateEvent.mjs"
import {Game} from "./game/Game.mjs"
import {move} from "./game/mover.mjs"
import {colors} from "./colors.mjs"
import {setCurrentState} from "./appState.mjs"
import {states} from "./states.mjs"
import {playSoundtrack, soundtracks} from "./audio.mjs"
import {KeyboardController} from "./KeyboardController.mjs"
import {setLoopFn} from "./loop.mjs"
import {Gate, gateTypes} from "./Gate.mjs"

let game
let simulation
let keyboardControllerHandler
let touchControllerHandler

let gameLoaded = false

/**
 * @param {Set<Player>} players
 */
function setupGame(players){
    const smallerDimension = Math.min(innerWidth, innerHeight)


    game = new Game()
    simulation = new Simulation()
    simulation.events.add(new UpdateEvent(game, simulation, 0))

    keyboardControllerHandler = new KeyboardControllerHandler()
    touchControllerHandler = new TouchControllerHandler()

    for(let player of players){
        const controller = new TouchController()
        const scale = V2.fromVals(innerWidth, innerHeight)
        let a, b
        if(player.posB.xy.sub(player.posA).mult(scale).cross(player.posA.xy.mult(scale).mult(-1)) < 0){
            a = player.posB
            b = player.posA
        }else{
            a = player.posA
            b = player.posB
        }
        controller.a = a.xy.add(1, -1).mult(1/2, -1/2)
        controller.b = b.xy.add(1, -1).mult(1/2, -1/2)
        touchControllerHandler.controllers.add(controller)

        const ship = new Ship(
            a.xy.add(b).div(2).mult(innerWidth, innerHeight).div(smallerDimension),
            b.xy.sub(a).mult(innerWidth, innerHeight).dir + Math.PI/2, controller, colors[player.colIndex], shipGeometries[player.colIndex]
        )
        game.ships.push(ship)
    }

    const kc0 = new KeyboardController()
    keyboardControllerHandler.add(kc0)

    // game.gates.add(new Gate(V2.new(-0.2, 0), V2.new(0.2, 0.05), [...game.ships][0], gateTypes.open))
    // game.gates.add(new Gate(V2.new(-0.3, 0.3), V2.new(-0.25, 0.7), [...game.ships][0], gateTypes.smash))
    // game.gates.add(new Gate(V2.new(-0.5, 0.2), V2.new(-0.9, 0.15), [...game.ships][0], gateTypes.bounce))

    // const j = 5
    // // for(let j = 0; j < 10; j++) {
    //     for (let i = 0; i < 10; i++) {
    //         game.ships.push(new Ship(V2.fromPolar(j/10*1, 0.1*j + i / 10 * (2 * Math.PI)), 0 / 10 * (2 * Math.PI), kc0, colors[i], shipGeometries[i]))
    //     }
    // // }


    game.touchControllerHandler = touchControllerHandler

    timeToExit = 3000

    singlePlayerMode = game.ships.length == 1

    gameLoaded = true
}

function startGame(){
    setCurrentState(states.GAME)
    playSoundtrack(soundtracks.GAME)
    addEventListener("resize", updateBoundary)
    setLoopFn(gameLoopFn)
    updateBoundary()
    keyboardControllerHandler.listen()
    touchControllerHandler.listen()
}

function removeGameEventListeners(){
    removeEventListener("resize", updateBoundary)
    keyboardControllerHandler.stopListening()
}



const top = new TouchController()
top.a.set(1, 0)
top.b.set(0, 0)

const topRight = new TouchController()
topRight.a.set(1, 0.5)
topRight.b.set(0.5, 0)

const topLeft = new TouchController()
topLeft.a.set(0.5, 0)
topLeft.b.set(0, 0.5)



const edgeCol = [0.001, 0.001, 0.001]

let bottomWall, rightWall, topWall, leftWall
function updateBoundary(){
    game.walls.delete(bottomWall)
    game.walls.delete(rightWall)
    game.walls.delete(topWall)
    game.walls.delete(leftWall)
    const width = Math.max(1, innerWidth/innerHeight)
    const height = Math.max(1, innerHeight/innerWidth)
    bottomWall = new Wall(V2.fromVals(-width, -height), 0, 2*width, 1, edgeCol, true)
    rightWall = new Wall(V2.fromVals(width, -height), Math.PI/2, 2*height, 1, edgeCol, true)
    topWall = new Wall(V2.fromVals(width, height), Math.PI, 2*width, 1, edgeCol, true)
    leftWall = new Wall(V2.fromVals(-width, height), 3*Math.PI/2, 2*height, 1, edgeCol, true)
    game.walls.add(bottomWall)
    game.walls.add(rightWall)
    game.walls.add(topWall)
    game.walls.add(leftWall)
}

const maxSimTime = 500
let timeToExit = 0
let singlePlayerMode
function gameLoopFn(dt){
    if(dt < maxSimTime){
        const targetTime = simulation.time + dt*gameSpeed
        simulation.simulate(targetTime)
        move(game, targetTime)
        simulation.time = targetTime

        if(game.ships.length <= 1 - singlePlayerMode){
            timeToExit -= dt
        }
        if(timeToExit <= 0){
            history.go(-1)
            setCurrentState(states.CONFIG)
        }
    }

    draw(game)
}


window.gameSpeed = 1

// let oldTime
// function loop(t) {
//     if(!oldTime || t - oldTime > maxSimTime){
//         oldTime = t
//     }
//     const dt = t - oldTime
//     oldTime = t
//
//     const targetTime = simulation.time + dt*gameSpeed
//     simulation.simulate(targetTime)
//     move(game, targetTime)
//     simulation.time = targetTime
//
//
//     draw(game)
//
//     if(game.ships.length <= 1 - singlePlayerMode){
//         timeToExit -= dt
//     }
//     if(timeToExit <= 0){
//         history.go(-1)
//         setCurrentState(states.CONFIG)
//     }
//
//     if(currentState == states.GAME) {
//         requestAnimationFrame(loop)
//     }
// }

export {setupGame, startGame, removeGameEventListeners, gameLoaded}