import {states} from "./states.mjs"
import {currentState, setCurrentState} from "./appState.mjs"
import {removeTitleListeners, title} from "./title.mjs"
import {blurControlEditor, controlEditor, removeControlEditorListeners} from "./controlEditor.mjs"
import {gameLoaded, removeGameEventListeners, startGame} from "./gameLoop.mjs"

function onPopState(e){
    switch (currentState) {
        case states.TITLE:
            removeTitleListeners()
            break
        case states.CONFIG:
            removeControlEditorListeners()
            break
        case states.PAUSE:
            break
        case states.GAME:
            removeGameEventListeners()
            break
    }
    switch (e.state) {
        case states.TITLE:
            title()
            break
        case states.CONFIG:
            controlEditor()
            break
        case states.PAUSE:
            console.log('go to pause')
            break
        case states.GAME:
            if(gameLoaded){
                startGame()
            }else{
                history.replaceState(states.CONFIG, "",)
                document.title = "False Axiom - Config"
                controlEditor()
            }
            break
    }

}

function handleHistory(){
    addEventListener("popstate", onPopState)
}

export {handleHistory}