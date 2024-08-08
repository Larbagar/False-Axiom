import {device} from "./device.mjs"
import {context, distortionTex, lightTex} from "./textureHandler.mjs"
import M3 from "../M3.mjs"
import {clear} from "./clear.mjs"
import {drawLighting} from "./light/drawLighting.mjs"
import {minBrightnessBindGroupLayout} from "./light/minBrightnessBindGroupLayout.mjs"
import {resetDistortion} from "./light/resetDistortion.mjs"
import {cameraBindGroupLayout} from "./cameraBindGroupLayout.mjs"
import {minBrightnessBindGroup} from "../minBrightness.mjs"
import {Camera} from "../Camera.mjs"
import {PointGroup} from "./PointGroup.mjs"
import V2 from "../V2.mjs"




const camera = new Camera()

const newPointGroup = new PointGroup(2)
/**
 * @param {Game} game
 */
function draw(game){
    const encoder = device.createCommandEncoder()

    const canvasView = context.getCurrentTexture().createView()


    camera.set(M3.scaleV(Math.min(innerHeight/innerWidth, 1), Math.min(innerWidth/innerHeight, 1)))


    clear(encoder, lightTex.view, [0, 0, 0, 1])
    for(const ship of game.ships){
        ship.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)
    }
    for(const wall of game.walls){
        wall.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)
    }
    for(const blast of game.blasts){
        blast.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)
    }
    for(const rubbleCluster of game.rubbleClusters){
        rubbleCluster.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)
    }
    for(const explosion of game.particleClusters){
        explosion.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)
    }
    for(const gate of game.gates){
        gate.draw(encoder, lightTex.view, camera.bindGroup, minBrightnessBindGroup)
    }

    resetDistortion(encoder, distortionTex.view, camera.bindGroup)
    for(const shockwave of game.shockwaves){
        shockwave.draw(encoder, distortionTex.view, camera.bindGroup)
    }

    drawLighting(encoder, canvasView, lightTex.bindGroup, camera.bindGroup, distortionTex.bindGroup)

    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])
}

export {draw}