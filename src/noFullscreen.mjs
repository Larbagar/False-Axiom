const params = new URLSearchParams(location.search)
const noFullscreen = params.has("no-fullscreen")
const highGraphics = params.has("high-graphics")

export {noFullscreen, highGraphics}