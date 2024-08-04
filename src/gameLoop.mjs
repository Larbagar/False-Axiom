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
import {currentState, setCurrentState} from "./appState.mjs"
import {states} from "./states.mjs"
import {playSoundtrack, soundtracks} from "./audio.mjs"

let game
let simulation
let keyboardControllerHandler
let touchControllerHandler

let gameLoaded = false

/**
 * @param {Set<Player>} players
 */
function setupGame(players){
    setCurrentState(states.GAME)


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
            a = player.posB.xy
            b = player.posA.xy
        }else{
            a = player.posA.xy
            b = player.posB.xy
        }
        controller.a = a.add(1, -1).mult(1/2, -1/2)
        controller.b = b.add(1, -1).mult(1/2, -1/2)
        touchControllerHandler.controllers.add(controller)

        const ship = new Ship(V2.zero(), 0, controller, colors[player.colIndex], shipGeometries[0])
        game.ships.push(ship)
    }


    game.touchControllerHandler = touchControllerHandler

    timeToExit = 3000

    singlePlayerMode = game.ships.length == 1

    gameLoaded = true
}

function startGame(){
    setCurrentState(states.GAME)
    playSoundtrack(soundtracks.GAME)
    addEventListener("resize", updateBoundary)
    updateBoundary()
    keyboardControllerHandler.listen()
    touchControllerHandler.listen()
    requestAnimationFrame(loop)
}

function removeGameEventListeners(){
    oldTime = undefined
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



window.gameSpeed = 1

let oldTime
const maxSimTime = 500
let timeToExit = 0
let singlePlayerMode
function loop(t) {
    if(!oldTime || t - oldTime > maxSimTime){
        oldTime = t
    }
    const dt = t - oldTime
    oldTime = t

    const targetTime = simulation.time + dt*gameSpeed
    simulation.simulate(targetTime)
    move(game, targetTime)
    simulation.time = targetTime


    draw(game)

    if(game.ships.length <= 1 - singlePlayerMode){
        timeToExit -= dt
    }
    if(timeToExit <= 0){
        history.go(-1)
        setCurrentState(states.CONFIG)
    }

    if(currentState == states.GAME) {
        requestAnimationFrame(loop)
    }
}

export {setupGame, startGame, removeGameEventListeners, gameLoaded}