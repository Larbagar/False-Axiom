function clear(encoder, view, col){
    const pass = encoder.beginRenderPass({
        colorAttachments: [
            {
                view: view,
                loadOp: "clear",
                clearValue: col,
                storeOp: "store",
            },
        ],
    })
    pass.end()
}

export {clear}