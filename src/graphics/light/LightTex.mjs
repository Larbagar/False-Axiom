import { device } from "../device.mjs"
import { textureBindGroupLayout } from "../textureBindGroupLayout.mjs"

class LightTex {
    /**
     * @param {V2} resolution
     */
    constructor(resolution){
        this.texture = device.createTexture({
            label: "light texture",
            format: "rgba16float",
            size: resolution.arr,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
        })
        this.view = this.texture.createView()
        this.bindGroup = device.createBindGroup({
            label: "light bind group",
            layout: textureBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: this.view,
                },
            ],
        })
    }
}

export {LightTex}