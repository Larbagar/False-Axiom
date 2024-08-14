import {setCurrentState} from "./appState.mjs"
import {states} from "./states.mjs"
import {setLoopFn} from "./loop.mjs"
import {playSoundtrack, soundtracks} from "./audio.mjs"
import V2 from "./V2.mjs"

class Player {

}

class DragPoint {
    /** @type {V2} */
    pos = null
    /** @type {function} */
    onConfirm = null
    /** @type {Set<UndelegatedTouch>} */
    listeners = new Set()
}

class UndelegatedTouch {
    /** @type {V2} */
    pos = null
    /** @type {function} this will increment the useless touch counter, or change a player's color */
    onRelease = null

    /** @type {Set<DragPoint>} */

    /** @type {DragPoint} */
    dragPoint = null
    /** @type {V2} relative to drag point */
    followPos = V2.zero()
    /** @type {number} */
    followTime
}

class DragTouch {

}

function configLoop(){

}

function touchStart(){

}

function touchMove(){

}

function touchEnd(){

}

function blur(){

}

function touchCancel(){
    // #TODO
}

function config(){
    setCurrentState(states.CONFIG)
    setLoopFn(configLoop)
    playSoundtrack(soundtracks.CONFIG)

    addEventListener("touchstart", touchStart)
    addEventListener("touchmove", touchMove)
    addEventListener("touchend", touchEnd)
    addEventListener("touchcancel", touchCancel)
    addEventListener("blur", blur)
}

function stopConfig(){
    removeEventListener("touchstart", touchStart)
    removeEventListener("touchmove", touchMove)
    removeEventListener("touchend", touchEnd)
    removeEventListener("touchcancel", touchCancel)
    removeEventListener("blur", blur)
}