if(!navigator.gpu){
  throw "WebGPU not supported"
}

const adapter = await navigator.gpu.requestAdapter()
if(!adapter){
  throw "No available adapter"
}

const device = await adapter.requestDevice()

export { device }