import {LineGroup} from "./LineGroup.mjs"
import V2 from "./V2.mjs"

class Player {
    /** @type {V2} */
    touchA
    /** @type {V2} */
    touchB
    /** @type {LineGroup} */
    lineGroup = new LineGroup(1)
    constructor(posA, posB) {
        this.touchA = posA
        this.touchB = posB
    }
    draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup){
        const scale = V2.fromVals(
            Math.min(innerHeight/innerWidth, 1),
            Math.min(innerWidth/innerHeight, 1)
        )
        this.lineGroup.pos.set([...this.touchA.copy().mult(scale)], 0)
        this.lineGroup.pos.set([...this.touchB.copy().mult(scale)], 2)
        this.lineGroup.draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup)
    }
}

export {Player}