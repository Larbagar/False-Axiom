let loopFn = null

function setLoopFn(newFn){
    loopFn = newFn
}


let oldTime

function loop(t){
    if(!oldTime){
        oldTime = t
    }
    const dt = t - oldTime
    oldTime = t

    loopFn?.(dt)

    requestAnimationFrame(loop)
}

export {loopFn, setLoopFn, loop}