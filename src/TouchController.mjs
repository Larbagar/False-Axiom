import Controller from "./Controller.mjs"

class TouchController {
    /** @type {Player} */
    player
    /** @type {V2} */
    a
    /** @type {V2} */
    b

    /**
     * @param {Player} player
     * @param {V2} a
     * @param {V2} b
     */
    constructor(player, a, b){
        this.player = player
        this.a = a
        this.b = b
    }
}