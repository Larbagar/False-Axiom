import { Controller } from "./Controller.mjs"
import V2 from "./V2.mjs"

class TouchController extends Controller{
    a = V2.zero()

    b = V2.zero()

    forward = 1

    /** @type {Set<number>} */
    lefts = new Set()

    /** @type {Set<number>} */
    rights = new Set()

    heldTime = 0
    dashDelay = 1

    /**
     * @param {V2} pos
     */
    getDistance(pos){
        const a = this.a.copy().mult(innerWidth, innerHeight)
        const b = this.b.copy().mult(innerWidth, innerHeight)
        return a.distance(pos) + b.distance(pos) - a.distance(b)
    }

    /**
     * @param {V2} pos
     * @param {number} id
     */
    addTouch(pos, id){
        const a = this.a.copy().mult(innerWidth, innerHeight)
        const b = this.b.copy().mult(innerWidth, innerHeight)
        if(a.distance(pos) < b.distance(pos)) {
            this.lefts.add(id)
            if(this.rights.size > 0){
                this.turn = 0
            }else{
                this.turn = 1
            }
        }else{
            this.rights.add(id)
            if(this.lefts.size > 0){
                this.turn = 0
            }else{
                this.turn = -1
            }
        }
    }

    /**
     * @param {number} id
     */
    removeTouch(id) {
        if(this.lefts.delete(id) && this.lefts.size == 0 && this.rights.size > 0){
            this.turn = -1
        }else if(this.rights.delete(id) && this.rights.size == 0 && this.lefts.size > 0){
            this.turn = 1
        }else if(this.lefts.size == 0 && this.rights.size == 0){
            this.turn = 0
        }
        if(this.lefts.size == 0 || this.rights.size == 0){
            this.heldTime = 0
            this.dash = false
        }
    }


    tick() {
        if(this.heldTime == this.dashDelay){
            this.dash = true
        }
        if(this.lefts.size > 0 && this.rights.size > 0) {
            this.heldTime++
        }
    }

    dashEnd() {
        this.dash = false
    }

    blur() {
        this.heldTime = 0
        this.dash = false
        this.turn = 0

        this.lefts.clear()
        this.rights.clear()
    }
}

export {TouchController}