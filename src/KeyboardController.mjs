import {Controller} from "./Controller.mjs"

export class KeyboardController extends Controller {
    forwardKey = "ArrowUp"
    leftKey = "ArrowLeft"
    rightKey = "ArrowRight"
    dashKey = "KeyZ"

    releaseTurn = 0
    dashKeyPressed = false

    keydown(key) {
        if(key == this.forwardKey){
            this.forward = 1
        }
        if(key == this.leftKey){
            if(this.turn != 1) {
                this.releaseTurn = this.turn
            }
            this.turn = 1
        }
        if(key == this.rightKey){
            if(this.turn != -1) {
                this.releaseTurn = this.turn
            }
            this.turn = -1
        }
        if(key == this.dashKey && !this.dashKeyPressed){
            this.dash = true
            this.dashKeyPressed = true
        }
    }
    keyup(key) {
        if(key == this.forwardKey){
            this.forward = 0
        }
        if(key == this.leftKey){
            if(this.releaseTurn != 1) {
                this.turn = this.releaseTurn
            }
            this.releaseTurn = 0
        }
        if(key == this.rightKey){
            if(this.releaseTurn != -1) {
                this.turn = this.releaseTurn
            }
            this.releaseTurn = 0
        }
        if(key == this.dashKey){
            this.dash = false
            this.dashKeyPressed = false
        }
    }
    blur() {
        this.forward = 0
        this.turn = 0
        this.releaseTurn = 0
        this.dashKeyPressed = false
    }
    startDash() {
        this.dash = false
    }
}