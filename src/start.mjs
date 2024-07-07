import V2 from "./V2.mjs"
import { Ship } from "./game/Ship.mjs"
import { KeyboardController } from "./KeyboardController.mjs"
import { KeyboardControllerHandler } from "./KeyboardControllerHandler.mjs"
import { Wall } from "./game/Wall.mjs"
import { TouchController } from "./TouchController.mjs"
import { TouchControllerHandler } from "./TouchControllerHandler.mjs"
import {draw} from "./graphics/draw.mjs";
import {setupTexutres} from "./graphics/textureHandler.mjs"
import {shipGeometries} from "./shipGeometries.mjs"
import {Simulation} from "./game/Simulation.mjs"
import {UpdateEvent} from "./game/UpdateEvent.mjs"
import {Game} from "./game/Game.mjs"
import {move} from "./game/mover.mjs"
import {RubbleCluster} from "./RubbleCluster.mjs"


setupTexutres()



// let deferredPrompt
// addEventListener('beforeinstallprompt', (e) => {
//     e.preventDefault()
//     deferredPrompt = e
//     addEventListener("touchstart", _ => deferredPrompt.prompt())
// })
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
}


const game = new Game()
const simulation = new Simulation()
simulation.events.add(new UpdateEvent(game, simulation, 0))

const kc0 = new KeyboardController()
// kc0.dashKey = "KeyM"

const kc1 = new KeyboardController()
kc1.forwardKey = "KeyW"
kc1.leftKey = "KeyA"
kc1.rightKey = "KeyD"
kc1.dashKey = "ShiftLeft"


const keyboardControllerHandler = new KeyboardControllerHandler()
keyboardControllerHandler.add(kc0)
keyboardControllerHandler.add(kc1)
keyboardControllerHandler.listen()


const bottom = new TouchController()
bottom.a.set(0, 1)
bottom.b.set(1, 1)

const top = new TouchController()
top.a.set(1, 0)
top.b.set(0, 0)

const topRight = new TouchController()
topRight.a.set(1, 0.5)
topRight.b.set(0.5, 0)

const topLeft = new TouchController()
topLeft.a.set(0.5, 0)
topLeft.b.set(0, 0.5)

const touchControllerHandler = new TouchControllerHandler()
touchControllerHandler.add(bottom)
touchControllerHandler.add(top)
touchControllerHandler.listen()

game.touchControllerHandler = touchControllerHandler

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
addEventListener("resize", updateBoundary)
updateBoundary()

// const simulation = new OldGame(ships, walls, touchControllerHandler)
// simulation.update() // Generates events
// window.simulation = simulation


window.gameSpeed = 1
// setInterval(_ => gameSpeed = Math.sin(performance.now()/2000) + 1, 100)
let oldTime
function loop(t) {
    if(!oldTime){
        oldTime = t
    }
    const dt = t - oldTime
    oldTime = t

    const targetTime = simulation.time + dt*gameSpeed
    simulation.simulate(targetTime)
    move(game, targetTime)
    simulation.time = targetTime


    draw(game)

    requestAnimationFrame(loop)
}

const red = [0.016, 0.001, 0.004]
const orange = [0.016, 0.004, 0.001]
const yellow = [0.012, 0.008, 0.001]
const lime = [0.004, 0.016, 0.001]
const green = [0.001, 0.016, 0.004]
const cyan = [0.001, 0.012, 0.008]
const lightBlue = [0.001, 0.008, 0.012]
const darkBlue = [0.001, 0.004, 0.016]
const purple = [0.004, 0.001, 0.016]
const magenta = [0.008, 0.001, 0.012]
const antiLight = [-0.007, -0.007, -0.007]


function startTouch() {
    removeListeners()
    game.ships.push(new Ship(V2.fromVals(0, -0.5), Math.PI/2, bottom, purple, shipGeometries[0]))
    game.ships.push(new Ship(V2.fromVals(0, 0.5), -Math.PI/2, top, orange, shipGeometries[2]))
    document.body.requestFullscreen().then(_ => requestAnimationFrame(loop))
}
function startKeyboard() {
    removeListeners()
    game.ships.push(new Ship(V2.fromVals(-0.5, 0), 0, kc0, orange, shipGeometries[2]))
    game.ships.push(new Ship(V2.fromVals(0.5, 0), Math.PI, kc1, cyan, shipGeometries[4]))
    requestAnimationFrame(loop)
}
function startDisplay(){
    game.ships.push(new Ship(V2.fromPolar(0.5, 0/10*(2*Math.PI)), 0/10*(2*Math.PI), kc0, purple, shipGeometries[0]))
    game.ships.push(new Ship(V2.fromPolar(0.5, 1/10*(2*Math.PI)), 1/10*(2*Math.PI), kc0, darkBlue, shipGeometries[1]))
    game.ships.push(new Ship(V2.fromPolar(0.5, 2/10*(2*Math.PI)), 2/10*(2*Math.PI), kc0, orange, shipGeometries[2]))
    game.ships.push(new Ship(V2.fromPolar(0.5, 3/10*(2*Math.PI)), 3/10*(2*Math.PI), kc0, magenta, shipGeometries[3]))
    game.ships.push(new Ship(V2.fromPolar(0.5, 4/10*(2*Math.PI)), 4/10*(2*Math.PI), kc0, red, shipGeometries[4]))
    game.ships.push(new Ship(V2.fromPolar(0.5, 5/10*(2*Math.PI)), 5/10*(2*Math.PI), kc0, green, shipGeometries[5]))
    game.ships.push(new Ship(V2.fromPolar(0.5, 6/10*(2*Math.PI)), 6/10*(2*Math.PI), kc0, lightBlue, shipGeometries[6]))
    game.ships.push(new Ship(V2.fromPolar(0.5, 7/10*(2*Math.PI)), 7/10*(2*Math.PI), kc0, cyan, shipGeometries[7]))
    game.ships.push(new Ship(V2.fromPolar(0.5, 8/10*(2*Math.PI)), 8/10*(2*Math.PI), kc0, lime, shipGeometries[8]))
    game.ships.push(new Ship(V2.fromPolar(0.5, 9/10*(2*Math.PI)), 9/10*(2*Math.PI), kc0, yellow, shipGeometries[9]))
    removeListeners()
    requestAnimationFrame(loop)
}
function removeListeners(){
    removeEventListener("touchend", startTouch)
    removeEventListener("keyup", startKeyboard)
    removeEventListener("mouseup", startDisplay)
}
addEventListener("touchend", startTouch)
addEventListener("keyup", startKeyboard)
addEventListener("mouseup", startDisplay)