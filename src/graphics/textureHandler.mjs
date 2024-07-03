import {LightTex} from "./light/LightTex.mjs"
import V2 from "../V2.mjs"
import {device} from "./device.mjs"

let canvas, context, lightTex

const canvasFormat = navigator.gpu.getPreferredCanvasFormat()

function resize() {
    lightTex = new LightTex(V2.fromVals(innerWidth, innerHeight))
    canvas.width = innerWidth
    canvas.height = innerHeight
}

function setupTexutres(){
    canvas = document.getElementById("canvas")


    context = canvas.getContext("webgpu")
    context.configure({
        device: device,
        format: canvasFormat,
    })

    addEventListener("resize", resize)
    resize()
}


export {lightTex, canvas, canvasFormat, context, setupTexutres}