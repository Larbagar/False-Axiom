import {LineGroup} from "./LineGroup.mjs"
import V2 from "./V2.mjs"
import {colors} from "./colors.mjs"

class Player {
    /** @type {V2} */
    posA
    /** @type {V2} */
    posB
    /** @type {LineGroup} */
    lineGroup = new LineGroup(1)
    /** @type {number} */
    colIndex
    /** @type {Set<EditorTouch>} */
    lefts = new Set()
    /** @type {Set<EditorTouch>} */
    rights = new Set()
    constructor(posA, posB) {
        this.posA = posA
        this.posB = posB
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
        this.lineGroup.pos.set([...this.posA.xy.mult(scale)], 0)
        this.lineGroup.pos.set([...this.posB.xy.mult(scale)], 2)
        this.lineGroup.posChanged = true
        this.lineGroup.draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup)
    }
}

export {Player}