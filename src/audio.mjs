const audioContext = new AudioContext()

const soundtrackLength = 16

async function createAudioBufferSourceNode(path){
    return await audioContext.decodeAudioData(await (await fetch(path)).arrayBuffer())
}

const soundtrackPromise = createAudioBufferSourceNode("./audio/soundtrack.mp3")
const configSoundtrackPromise = createAudioBufferSourceNode("./audio/config soundtrack.mp3")

// function playSoundtrack(){
//     currentSoundtrack = soundtracks.GAME
//     startLoop()
// }

const soundtracks = {
    CONFIG: "config",
    GAME: "game",
}

let looping = false
function startLoop(){
    updateSoundtrack()
    if(!looping) {
        setInterval(updateSoundtrack, 1000*soundtrackLength - 1000)
        looping = true
    }
}

async function playSoundtrack(soundtrack){
    if(soundtrack == currentSoundtrack){
        return
    }
    currentSoundtrack = soundtrack
    const alreadyPlaying = currentSource && nextSource
    if(alreadyPlaying){
        currentSource.stop()
        nextSource.stop()
    }
    await populateSources()
    if(alreadyPlaying){
        const offset = (audioContext.currentTime - currentStart) % soundtrackLength
        currentStart = audioContext.currentTime - offset
        currentSource.start(0, offset)
        nextSource.start(currentStart + soundtrackLength)
    }else{
        currentStart = audioContext.currentTime
        currentSource.start()
        nextSource.start(currentStart + soundtrackLength)
        startLoop()
    }
}

async function populateSources(){
    currentSource = audioContext.createBufferSource()
    nextSource = audioContext.createBufferSource()
    switch(currentSoundtrack){
        case soundtracks.CONFIG:
            currentSource.buffer = await configSoundtrackPromise
            nextSource.buffer = await configSoundtrackPromise
            break
        case soundtracks.GAME:
            currentSource.buffer = await soundtrackPromise
            nextSource.buffer = await soundtrackPromise
            break
    }
    currentSource.connect(audioContext.destination)
    nextSource.connect(audioContext.destination)
}

let currentSoundtrack = undefined
let currentStart = -Infinity
let currentSource = null
let nextSource = null
async function updateSoundtrack(){
    if(!currentSource || currentStart + 2*soundtrackLength <= audioContext.currentTime){
        await populateSources()
        currentStart = audioContext.currentTime
        currentSource.start(currentStart)
        nextSource.start(currentStart + soundtrackLength)
    }else if(currentStart + soundtrackLength <= audioContext.currentTime){
        currentStart += soundtrackLength
        currentSource = nextSource
        nextSource = audioContext.createBufferSource()
        switch(currentSoundtrack){
            case soundtracks.CONFIG:
                nextSource.buffer = await configSoundtrackPromise
                break
            case soundtracks.GAME:
                nextSource.buffer = await soundtrackPromise
                break
        }
        nextSource.connect(audioContext.destination)
        nextSource.start(currentStart + soundtrackLength)
    }
}

window.playSoundtrack = playSoundtrack
window.soundtracks = soundtracks

export {playSoundtrack, soundtracks}