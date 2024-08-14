const params = new URLSearchParams(location.search)
export const
    noFullscreen = params.has("no-fullscreen"),
    resolution = params.get("resolution") ?? 1/devicePixelRatio,
    minBrightnessVal = params.get("min-brightness") ?? 0.01,
    profileView = params.has("profile-view"),
    lightMode = params.has("light-mode")