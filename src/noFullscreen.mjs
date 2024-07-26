const params = new URLSearchParams(location.search)
export const
    noFullscreen = params.has("no-fullscreen"),
    highGraphics = params.has("high-graphics"),
    profileView = params.has("profile-view")