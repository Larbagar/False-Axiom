import V2 from "./V2.mjs"

class EditorTouch {
    /** @type {V2} */
    pos = V2.zero()
    delegated = false
    player = null
    side = 0.5
    constructor(x, y) {
        this.pos.set(x, y)
    }
}

export {EditorTouch}