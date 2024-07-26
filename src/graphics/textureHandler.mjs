import {LightTex} from "./light/LightTex.mjs"
import V2 from "../V2.mjs"
import {device} from "./device.mjs"
import {DistortionTex} from "./light/DistortionTex.mjs"
import {highGraphics} from "../flags.mjs"

let
    /** @type {HTMLCanvasElement} */
    canvas,
    /** @type {GPUCanvasContext} */
    context,
    /** @type {LightTex} */
    lightTex,
    /** @type {DistortionTex} */
    distortionTex

const canvasFormat = navigator.gpu.getPreferredCanvasFormat()
let resolution = highGraphics ? 1 : 0.8

function resize() {
    const res = V2.fromVals(innerWidth*devicePixelRatio*resolution, innerHeight*devicePixelRatio*resolution)
    lightTex = new LightTex(res)
    distortionTex = new DistortionTex(res);
    [canvas.width, canvas.height] = res
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


export {lightTex, distortionTex, canvas, canvasFormat, context, setupTexutres}