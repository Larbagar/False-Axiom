import {PointGroup} from "./graphics/PointGroup.mjs"
import V2 from "./V2.mjs"
import {LineGroup} from "./graphics/LineGroup.mjs"

const gateTypes = {
    open: "open",
    smash: "smash",
    bounce: "bounce",
}

class Gate {
    /** @type {V2} */
    p0
    /** @type {V2} */
    p1
    /** @type {number} */
    segmentCount = 4
    /** @type {PointGroup | LineGroup} */
    edgeGroup
    /** @type {PointGroup | LineGroup} */
    centerGroup
    /** @type {Gate} */
    next
    /** @type {Ship} */
    ship
    /** @type {boolean} */
    active

    type
    constructor(p0, p1, ship, type) {
        this.ship = ship
        this.type = type

        const perp = p1.xy.sub(p0).perp().normalize()


        this.edgeGroup = new LineGroup(2)
        this.edgeGroup.pos.set([
            ...p0.xy.add(perp.xy.mult(0.02)),
            ...p0.xy.sub(perp.xy.mult(0.02)),
            ...p1.xy.add(perp.xy.mult(0.02)),
            ...p1.xy.sub(perp.xy.mult(0.02)),
        ])
        this.edgeGroup.col.set(new Array(2).fill(this.ship.col).flat().map(x => 4*x))

        this.edgeGroup.posChanged = true
        this.edgeGroup.colChanged = true

        const cenCol = [0.007, 0.007, 0.007]

        if(this.type == gateTypes.smash){
            this.centerGroup = new LineGroup(this.segmentCount)
            this.centerGroup.col.set(new Array(this.segmentCount).fill(cenCol).flat().map(x => 4*x))

            const frac = 0.6
            for(let i = 0; i < this.segmentCount; i++){
                const coeff0 = (i + 1 - frac) / (this.segmentCount + 1 - frac)
                const coeff1 = (i + 1) / (this.segmentCount + 1 - frac)
                this.centerGroup.pos.set([...V2.lerp(p0, p1, coeff0)], 4*i)
                this.centerGroup.pos.set([...V2.lerp(p0, p1, coeff1)], 4*i + 2)
            }
        }else if(this.type == gateTypes.bounce){
            this.centerGroup = new LineGroup(1)
            this.centerGroup.pos.set([...V2.lerp(p0, p1, 0.1), ...V2.lerp(p0, p1, 0.9)])
            this.centerGroup.col.set(cenCol.map(x => 4*x))
        }else{
            this.centerGroup = new LineGroup(0)
        }
        // for(let i  = 0; i < this.segmentCount; i++){
        //     const coeff = (i + 1) / (this.segmentCount + 1)
        //     const pos = V2.lerp(p0, p1, coeff)
        //     this.centerGroup.pos.set([...pos.xy.add(perp.xy.mult(0.02))], 4*i)
        //     this.centerGroup.pos.set([...pos.xy.sub(perp.xy.mult(0.02))], 4*i + 2)
        // }

        this.centerGroup.posChanged = true
        this.centerGroup.colChanged = true
    }
    draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup) {
        console.log(this.edgeGroup.pos)
        this.edgeGroup.draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup)
        this.centerGroup.draw(encoder, lightTex, cameraBindGroup, minBrightnessBindGroup)
    }

}

export {Gate, gateTypes}