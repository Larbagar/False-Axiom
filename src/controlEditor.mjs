import {canvas, context, distortionTex, lightTex, setupTexutres} from "./graphics/textureHandler.mjs"
import V2 from "./V2.mjs"
import {Player} from "./Player.mjs"
import {Camera} from "./Camera.mjs"
import {device} from "./graphics/device.mjs"
import M3 from "./M3.mjs"
import {clear} from "./graphics/clear.mjs"
import {resetDistortion} from "./graphics/light/resetDistortion.mjs"
import {drawLighting} from "./graphics/light/drawLighting.mjs"
import {minBrightnessBindGroup} from "./minBrightness.mjs"
import {colors} from "./colors.mjs"
import {setupGame, startGame} from "./game.mjs"
import {currentState, setCurrentState} from "./appState.mjs"
import {states} from "./states.mjs"
import {playSoundtrack, soundtracks} from "./audio.mjs"
import {LineGroup} from "./graphics/LineGroup.mjs"
import {PointGroup} from "./graphics/PointGroup.mjs"
import {setLoopFn} from "./loop.mjs"

const newPlayerIcon = new LineGroup(2, true)
newPlayerIcon.col.set(new Array(2).fill([0.01, 0.01, 0.01]).flat())
newPlayerIcon.updateColBuffer()
newPlayerIcon.pos.set([
    -1, 0,
    1, 0,
    0, -1,
    0, 1,
])
newPlayerIcon.updatePosBuffer()
newPlayerIcon.transform = M3.scaleS(0.1)
newPlayerIcon.updateTransformBuffer()

class Suggestion{
    static LINE_COUNT = 5
    lineGroup = new LineGroup(Suggestion.LINE_COUNT, true)
    constructor() {
        for(let i = 0; i < Suggestion.LINE_COUNT*2; i++){
            this.lineGroup.pos[2*i + 0] = Math.cos(2 * Math.PI * i / 2 / Suggestion.LINE_COUNT)
            this.lineGroup.pos[2*i + 1] = Math.sin(2 * Math.PI * i / 2 / Suggestion.LINE_COUNT)
        }
        this.lineGroup.updatePosBuffer()

        this.lineGroup.col.set(new Array(Suggestion.LINE_COUNT).fill([0.005, 0.005, 0.005]).flat())
        this.lineGroup.updateColBuffer()

        this.lineGroup.transform = M3.zero()
    }
}

const createSuggestion1 = new Suggestion()
const createSuggestion2 = new Suggestion()




class EditorTouch {
    /** @type {V2} */
    pos = V2.zero()
    /** @type {"drag" | "click"} */
    usage
    player = null
    /** @type {number} */
    side
    static DRAG = "drag"
    static CLICK = "click"
}



/** @type {Set<Player>} */
const players = new Set()



const camera = new Camera()


let uselessTouches = 0
const uselessTouchThresh = 3
let createHintTime = 3000
let createHintTimer = createHintTime

function controlEditorLoopFn(dt){
    const encoder = device.createCommandEncoder()

    const canvasView = context.getCurrentTexture().createView()

    camera.set(M3.scaleV(Math.min(innerHeight/innerWidth, 1), Math.min(innerWidth/innerHeight, 1)))

    clear(encoder, lightTex.view, [0, 0, 0, 1])

    for(const player of players){
        player.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)
    }

    const smallerDimension = Math.min(innerWidth, innerHeight)

    if(uselessTouches >= uselessTouchThresh || createHintTimer < createHintTime){
        createHintTimer += dt
        if(!touches.size && uselessTouches >= uselessTouchThresh){
            createHintTimer %= createHintTime
        }else{
            createHintTimer = Math.min(createHintTime, createHintTimer)
        }

        const start = 2/3 * createRange / 2
        const end = 0.6 * innerWidth / smallerDimension
        let x
        const y = 0.6 * innerHeight / smallerDimension
        let size

        const rotSpeed = 3 / Suggestion.LINE_COUNT
        const rot = rotSpeed * 2 * Math.PI * createHintTimer / createHintTime


        const createTime = 1
        const hold1Time = 2
        const moveTime = 5
        const hold2Time = 2
        const releaseTime = 1
        const idleTime = 2
        const totTime = createTime + hold1Time + moveTime + hold2Time + releaseTime + idleTime
        if(createHintTimer / createHintTime < (
            createTime
        ) / totTime){
            const progress = (createHintTimer / createHintTime) / (createTime / totTime)
            x = start
            size = 0.1*(1 - (1 - progress)**2)
        }else if(createHintTimer / createHintTime < (
            createTime + hold1Time
        ) / totTime){
            x = start
            size = 0.1
        }else if(createHintTimer / createHintTime < (
            createTime + hold1Time + moveTime
        ) / totTime){
            const progress = (createHintTimer / createHintTime - (createTime + hold1Time)/totTime) / (moveTime / totTime)
            const weight = 3*progress**2 - 2*progress**3
            x = start*(1 - weight) + end*weight
            size = 0.1
        }else if(createHintTimer / createHintTime < (
            createTime + hold1Time + moveTime + hold2Time
        ) / totTime){
            x = end
            size = 0.1
        }else if(createHintTimer / createHintTime < (
            createTime + hold1Time + moveTime + hold2Time + releaseTime
        ) / totTime){
            const progress = (createHintTimer / createHintTime - (createTime + hold1Time + moveTime + hold2Time)/totTime) / (releaseTime / totTime)
            x = end
            size = 0.1*(1 - (progress)**2)
        }else{
            x = 0
            size = 0
        }
        createSuggestion1.lineGroup.transform.identity().scaleS(size).rotate(rot).translate(V2.fromVals(-x, -y))
        createSuggestion2.lineGroup.transform.identity().scaleS(size).rotate(rot).translate(V2.fromVals(x, -y))
        createSuggestion1.lineGroup.updateTransformBuffer()
        createSuggestion2.lineGroup.updateTransformBuffer()


        createSuggestion1.lineGroup.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)

        createSuggestion2.lineGroup.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)
    }

    resetDistortion(encoder, distortionTex.view, camera.bindGroup)

    drawLighting(encoder, canvasView, lightTex.bindGroup, camera.bindGroup, distortionTex.bindGroup)

    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])
}



function setupControlEditorListeners(){
    addEventListener("touchstart", touchStart)
    addEventListener("touchmove", touchMove)
    addEventListener("touchend", touchEnd)
    addEventListener("touchcancel", touchCancel)
    addEventListener("blur", blurControlEditor)
}
function removeControlEditorListeners(){
    blurControlEditor()
    removeEventListener("touchstart", touchStart)
    removeEventListener("touchmove", touchMove)
    removeEventListener("touchend", touchEnd)
    removeEventListener("touchcancel", touchCancel)
    removeEventListener("blur", blurControlEditor)
}

const createRange = 0.5
const modifyRange = 0.2
const deleteRange = 0.3

/** @type {Map<number, EditorTouch>} */
const touches = new Map()
function touchStart(e){
    const smallerDimension = Math.min(innerWidth, innerHeight)
    for(const newTouchRaw of e.changedTouches){
        const newTouch = new EditorTouch()
        newTouch.pos.set(2*newTouchRaw.clientX/innerWidth - 1, 1 - 2*newTouchRaw.clientY/innerHeight)

        let closestDist = createRange
        let closestAvailable = null
        for(const [id, touch] of touches){
            if(touch.usage == EditorTouch.CLICK){
                const dist = Math.sqrt(((newTouch.pos.x - touch.pos.x)*innerWidth) ** 2 + ((newTouch.pos.y - touch.pos.y)*innerHeight) ** 2) / smallerDimension
                if(dist < closestDist){
                    closestAvailable = touch
                    closestDist = dist
                }
            }
        }
        closestDist = Math.min(modifyRange, closestDist)
        let closestA = null
        let closestB = null
        for(const player of players){
            {
                const dist = Math.sqrt(((newTouch.pos.x - player.posA.x) * innerWidth) ** 2 + ((newTouch.pos.y - player.posA.y) * innerHeight) ** 2) / smallerDimension
                if (dist < closestDist) {
                    closestA = player
                    closestB = null
                    closestAvailable = null
                    closestDist = dist
                }
            }
            {
                const dist = Math.sqrt(((newTouch.pos.x - player.posB.x)*innerWidth) ** 2 + ((newTouch.pos.y - player.posB.y)*innerHeight) ** 2) / smallerDimension
                if (dist < closestDist) {
                    closestB = player
                    closestA = null
                    closestAvailable = null
                    closestDist = dist
                }
            }
        }
        if(closestAvailable){
            if(closestAvailable.player && closestAvailable.side < 0){
                closestAvailable.player.lefts.delete(closestAvailable)
            }else if(closestAvailable.player && closestAvailable.side > 0){
                closestAvailable.player.rights.delete(closestAvailable)
            }

            const player = new Player(newTouch.pos, closestAvailable.pos)
            player.setColIndex(Math.floor(Math.random()*colors.length))
            players.add(player)

            newTouch.usage = EditorTouch.DRAG
            newTouch.side = -1
            newTouch.player = player
            player.dragA = newTouch
            closestAvailable.usage = EditorTouch.DRAG
            closestAvailable.side = 1
            closestAvailable.player = player
            player.dragB = closestAvailable
        }else if(closestA) {
            newTouch.side = -1
            newTouch.usage = EditorTouch.DRAG
            newTouch.player = closestA
            closestA.posA = newTouch.pos
            closestA.dragA = newTouch
        }else if(closestB){
            newTouch.side = 1
            newTouch.usage = EditorTouch.DRAG
            newTouch.player = closestB
            closestB.posB = newTouch.pos
            closestB.dragB = newTouch
        }else{
            newTouch.usage = EditorTouch.CLICK
            let closestPlayer = null
            let closestDist = Infinity
            for(const player of players){
                const dist = (
                    Math.sqrt(
                        ((newTouch.pos.x - player.posA.x)*innerWidth) ** 2 +
                        ((newTouch.pos.y - player.posA.y)*innerHeight) ** 2
                    ) + Math.sqrt(
                        ((newTouch.pos.x - player.posB.x)*innerWidth) ** 2 +
                        ((newTouch.pos.y - player.posB.y)*innerHeight) ** 2
                    ) - Math.sqrt(
                        ((player.posA.x - player.posB.x)*innerWidth) ** 2 +
                        ((player.posA.y - player.posB.y)*innerHeight) ** 2
                    )
                ) / smallerDimension
                if(dist < closestDist){
                    closestPlayer = player
                    closestDist = dist
                }
            }
            if(closestPlayer) {
                newTouch.player = closestPlayer
                const diff = closestPlayer.posB.xy.sub(closestPlayer.posA)
                const mag = diff.mag
                newTouch.side =
                    (diff.normalize().dot(newTouch.pos.xy.sub(closestPlayer.posA)) / mag * 2 - 1) *
                    Math.sign(diff.cross(closestPlayer.posA.xy.mult(-1)))
                if(newTouch.side < 0){
                    newTouch.player.lefts.add(newTouch)
                }else if(newTouch.side > 0){
                    newTouch.player.rights.add(newTouch)
                }

                let ready = true
                for(const player of players){
                    if(!player.lefts.size || !player.rights.size){
                        ready = false
                    }
                }

                if(ready && players.size >= 1){

                    removeControlEditorListeners()
                    history.pushState(states.GAME, "",)
                    document.title = "False Axiom - Play"
                    setupGame(players)
                    startGame()
                }
            }
        }

        touches.set(newTouchRaw.identifier, newTouch)
    }
}
function touchMove(e) {
    for(const movedTouch of e.changedTouches){
        touches.get(movedTouch.identifier)?.pos?.set(2*movedTouch.clientX/innerWidth - 1, 1 - 2*movedTouch.clientY/innerHeight)
    }
}
function touchEnd(e) {
    const smallerDimension = Math.min(innerWidth, innerHeight)
    for(const removedTouch of e.changedTouches){
        const touch = touches.get(removedTouch.identifier)
        if(!touch){
            continue
        }
        touch.pos.set(V2.fromVals(2*removedTouch.clientX/innerWidth - 1, 1 - 2*removedTouch.clientY/innerHeight))
        touches.delete(removedTouch.identifier)
        if(touch.player && touch.side < 0){
            touch.player.lefts.delete(touch)
        }else if(touch.player && touch.side > 0){
            touch.player.rights.delete(touch)
        }
        if(touch.usage == EditorTouch.CLICK){
            if(touch.player) {
                if(touch.side < 0) {
                    touch.player.setColIndex((touch.player.colIndex + colors.length - 1) % colors.length)
                } else if (touch.side > 0) {
                    touch.player.setColIndex((touch.player.colIndex + 1) % colors.length)
                }
            }else{
                uselessTouches ++
            }
        }
        if(touch.usage == EditorTouch.DRAG){
            if(touch.side < 0 && touch.player.dragA == touch){
                if(!touch.player.dragB && touch.player.posB.xy.sub(touch.player.posA).mult(V2.fromVals(innerWidth, innerHeight)).mag/smallerDimension < deleteRange){
                    players.delete(touch.player)
                }else if(touch.player.dragB == null){
                    uselessTouches = 0
                }
                touch.player.dragA = null
            }else if(touch.side > 0 && touch.player.dragB == touch){
                if(!touch.player.dragA && touch.player.posB.xy.sub(touch.player.posA).mult(V2.fromVals(innerWidth, innerHeight)).mag/smallerDimension < deleteRange){
                    players.delete(touch.player)
                }else if(touch.player.dragA == null){
                    uselessTouches = 0
                }
                touch.player.dragB = null
            }
        }
    }
}
function touchCancel(e) {
    // #TODO
    // for(const removedTouch of e.changedTouches){
    //     const touch = touches.get(removedTouch.identifier)
    //     if(!touch){
    //         continue
    //     }
    //     touch.pos.set(V2.fromVals(2*removedTouch.clientX/innerWidth - 1, 1 - 2*removedTouch.clientY/innerHeight))
    //     touches.delete(removedTouch.identifier)
    //     if(touch.player && touch.side < 0){
    //         touch.player.lefts.delete(touch)
    //     }else if(touch.player && touch.side > 0){
    //         touch.player.rights.delete(touch)
    //     }
    // }
}
function blurControlEditor(){
    for(const player of players){
        player.lefts.clear()
        player.rights.clear()
        player.dragA = null
        player.dragB = null
    }
    touches.clear()
}

function controlEditor(){
    setCurrentState(states.CONFIG)
    setLoopFn(controlEditorLoopFn)
    playSoundtrack(soundtracks.CONFIG)
    setupControlEditorListeners()
    // requestAnimationFrame(controlEditorLoopFn)
}

export {controlEditor, removeControlEditorListeners, blurControlEditor}