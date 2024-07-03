import V2 from "./V2.mjs"
import { Ship } from "./Ship.mjs"
import { KeyboardController } from "./KeyboardController.mjs"
import { KeyboardControllerHandler } from "./KeyboardControllerHandler.mjs"
import { Wall } from "./Wall.mjs"
import { TouchController } from "./TouchController.mjs"
import { TouchControllerHandler } from "./TouchControllerHandler.mjs"
import {Simulation} from "./Simulation.mjs";
import {render} from "./render.mjs";
import {setupTexutres} from "./graphics/textureHandler.mjs"


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


const kc0 = new KeyboardController()


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

const ships = []
// ships.push(new Ship(V2.fromVals(0, 0), 0, topLeft, [0.001, 0.008, 0.002]))

/** @type {Set<Wall>} */
const walls = new Set()

const edgeCol = [0.001, 0.001, 0.001]

let bottomWall, rightWall, topWall, leftWall
function updateBoundary(){
    walls.delete(bottomWall)
    walls.delete(rightWall)
    walls.delete(topWall)
    walls.delete(leftWall)
    const width = Math.max(1, innerWidth/innerHeight)
    const height = Math.max(1, innerHeight/innerWidth)
    bottomWall = new Wall(V2.fromVals(-width, -height), 0, 2*width, 1, edgeCol, 0, true)
    rightWall = new Wall(V2.fromVals(width, -height), Math.PI/2, 2*height, 1, edgeCol, 0, true)
    topWall = new Wall(V2.fromVals(width, height), Math.PI, 2*width, 1, edgeCol, 0, true)
    leftWall = new Wall(V2.fromVals(-width, height), 3*Math.PI/2, 2*height, 1, edgeCol, 0, true)
    walls.add(bottomWall)
    walls.add(rightWall)
    walls.add(topWall)
    walls.add(leftWall)
}
addEventListener("resize", updateBoundary)
updateBoundary()

const simulation = new Simulation(ships, walls, touchControllerHandler)
simulation.update() // Generates events
window.simulation = simulation

window.gameSpeed = 1
// setInterval(_ => gameSpeed = Math.sin(performance.now()/2000) + 1, 100)
let oldTime
function loop(t) {
    if(!oldTime){
        oldTime = t
    }
    const dt = t - oldTime
    oldTime = t

    simulation.simulate(simulation.time + dt*gameSpeed)

    // simulation.update(1)
    // for(const ship of ships){
    //     ship.collide(walls, ships)
    // }
    // simulation.moveAll(simulation.time + 1)
    // simulation.time ++

    render(simulation)

    requestAnimationFrame(loop)
}

function startTouch() {
    removeEventListener("touchend", startTouch)
    removeEventListener("keyup", startKeyboard)
    ships.push(new Ship(V2.fromVals(-0.5, 0), 0, bottom, [0.004, 0.002, 0.016]))
    ships.push(new Ship(V2.fromVals(0.5, 0), 0, top, [0.008, 0.002, 0.001]))
    document.body.requestFullscreen().then(_ => requestAnimationFrame(loop))
}
function startKeyboard() {
    removeEventListener("touchend", startTouch)
    removeEventListener("keyup", startKeyboard)
    ships.push(new Ship(V2.fromVals(-0.5, 0), 0, kc0, [0.004, 0.002, 0.016]))
    ships.push(new Ship(V2.fromVals(0.5, 0), 0, kc1, [0.008, 0.002, 0.001]))
    requestAnimationFrame(loop)
}
addEventListener("touchend", startTouch)
addEventListener("keyup", startKeyboard)