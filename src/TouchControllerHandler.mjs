import V2 from "./V2.mjs"
import { canvas } from "./graphics/textureHandler.mjs"

class TouchControllerHandler {
    /** @type {Set<TouchController>} */
    controllers = new Set()

    add(controller){
        this.controllers.add(controller)
    }
    listen(){
        addEventListener("touchstart", e => {
            this.touchstart(e.changedTouches)
        })
        canvas.addEventListener("touchstart", e => {
            e.preventDefault()
        })
        addEventListener("touchend", e => {
            this.touchend(e.changedTouches)
            e.preventDefault()
        })
        addEventListener("touchcancel", e => {
            this.touchend(e.changedTouches)
        })
        addEventListener("contextmenu", e => {
            e.preventDefault()
        })
        addEventListener("blur", _ => this.blur())
    }
    touchstart(touches){
        for(const touch of touches){
            const pos = V2.fromVals(touch.clientX, touch.clientY)
            let nearestDistance = Infinity
            /** @type {?TouchController} */
            let nearestController = null
            for(const controller of this.controllers){
                const dist = controller.getDistance(pos)
                if(dist < nearestDistance){
                    nearestDistance = dist
                    nearestController = controller
                }
            }
            nearestController?.addTouch?.(pos, touch.identifier)
        }
    }
    touchend(touches){
        for(const touch of touches){
            for(const controller of this.controllers){
                controller.removeTouch(touch.identifier)
            }
        }
    }
    blur(){
        for(const controller of this.controllers){
            controller.blur()
        }
    }
    update(){
        for(const controller of this.controllers){
            controller.tick()
        }
    }
}

export {TouchControllerHandler}