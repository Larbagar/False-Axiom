class Simulation {
    time = 0

    /** @type {Set<Event>} */
    events = new Set()

    simulate(newTime){
        while(true){
            /** @type {Event} */
            let nextEvent = null
            let nextTime = newTime
            for(const event of this.events){
                if(this.time <= event.time && event.time < nextTime){
                    nextTime = event.time
                    nextEvent = event
                }
            }
            if(nextEvent){
                const dt = nextTime - this.time
                this.time = nextTime
                nextEvent.trigger(dt)
            }else{
                break
            }
        }
    }
}

export { Simulation }