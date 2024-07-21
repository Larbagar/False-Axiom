import {LineGroup} from "./LineGroup.mjs"
import V2 from "./V2.mjs"
import {colors} from "./colors.mjs"

class Player {
    /** @type {V2} */
    touchA
    /** @type {V2} */
    touchB
    /** @type {LineGroup} */
    lineGroup = new LineGroup(1)
    /** @type {number} */
    colIndex
    constructor(posA, posB) {
        this.touchA = posA
        this.touchB = posB
    }
    setColIndex(i){
        this.colIndex = i
        this.lineGroup.col.set(colors[i])
        this.lineGroup.colChanged = true
    }
    draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup){
        const scale = V2.fromVals(
            Math.max(innerWidth/innerHeight, 1),
            Math.max(innerHeight/innerWidth, 1)
        )
        this.lineGroup.pos.set([...this.touchA.xy.mult(scale)], 0)
        this.lineGroup.pos.set([...this.touchB.xy.mult(scale)], 2)
        this.lineGroup.posChanged = true
        this.lineGroup.draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup)
    }
}

export {Player}