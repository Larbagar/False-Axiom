import {device} from "./graphics/device.mjs"
import M3 from "./M3.mjs"
import {cameraBindGroupLayout} from "./graphics/cameraBindGroupLayout.mjs"

class Camera {
    buffer = device.createBuffer({
        label: "camera buffer",
        size: M3.BYTE_LENGTH,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    })
    inverseBuffer = device.createBuffer({
        label: "inverse camera buffer",
        size: M3.BYTE_LENGTH,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    })
    bindGroup = device.createBindGroup({
        label: "camera bind group",
        layout: cameraBindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: this.buffer,
                },
            },
            {
                binding: 1,
                resource: {
                    buffer: this.inverseBuffer,
                },
            },
        ],
    })

    /**
     * @param {M3} m3
     */
    set(m3){
        device.queue.writeBuffer(this.buffer, 0, m3.arr)
        device.queue.writeBuffer(this.inverseBuffer, 0, m3.inverse().arr)
    }
}

export {Camera}