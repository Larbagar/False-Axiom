class KeyboardControllerHandler {
    controllers = new Set()

    add(controller){
        this.controllers.add(controller)
    }
    listen(){
        addEventListener("keydown", e => this.keydown(e.code))
        addEventListener("keyup", e => this.keyup(e.code))
        addEventListener("blur", e => this.blur())
    }
    keydown(key){
        for(const controller of this.controllers){
            controller.keydown(key)
        }
    }
    keyup(key){
        for(const controller of this.controllers){
            controller.keyup(key)
        }
    }
    blur(){
        for(const controller of this.controllers){
            controller.blur()
        }
    }
}

export {KeyboardControllerHandler}