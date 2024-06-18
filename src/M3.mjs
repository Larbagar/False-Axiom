import V2 from "./V2.mjs"

export default class M3 {
    /** @type {Float32Array} */
    arr

    //#region constants

    static ELEMENTS = 12
    static BYTES_PER_ELEMENT = Float32Array.BYTES_PER_ELEMENT
    static BYTE_LENGTH = M3.ELEMENTS*M3.BYTES_PER_ELEMENT

    //#endregion

    //#region constructors

    /**
     * @param {number} e00
     * @param {number} e01
     * @param {number} e02
     * @param {number} e10
     * @param {number} e11
     * @param {number} e12
     * @param {number} e20
     * @param {number} e21
     * @param {number} e22
     */
    static fromVals(
        e00 = 1, e01 = 0, e02 = 0,
        e10 = 0, e11 = 1, e12 = 0,
        e20 = 0, e21 = 0, e22 = 1,
    ) {
        const m3 = new M3()
        m3.arr = new Float32Array(M3.ELEMENTS)
        m3.arr[0] = e00
        m3.arr[1] = e01
        m3.arr[2] = e02
        m3.arr[4] = e10
        m3.arr[5] = e11
        m3.arr[6] = e12
        m3.arr[8] = e20
        m3.arr[9] = e21
        m3.arr[10] = e22
        return m3
    }
    /**
     * Copies by reference
     * @param {ArrayBuffer} arrayBuffer
     * @param {number} byteOffset
     */
    static fromArrayBuffer(arrayBuffer = new ArrayBuffer(M3.BYTE_LENGTH), byteOffset = 0) {
        const m3 = new M3()
        m3.arr = new Float32Array(arrayBuffer, byteOffset, M3.ELEMENTS)
        return m3
    }
    /**
     * Copies by reference
     * @param {Float32Array} float32Array
     * @param {number} offset
     */
    static fromFloat32Array(float32Array = new Float32Array(M3.ELEMENTS), offset = 0) {
        const m3 = new M3()
        m3.arr = new Float32Array(float32Array.buffer, float32Array.byteOffset + offset*Float32Array.BYTES_PER_ELEMENT, M3.ELEMENTS)
        return m3
    }

    /**
     */
    static zero() {
        const m3 = new M3()
        m3.arr = new Float32Array(M3.ELEMENTS)
        return m3
    }
    /**
     */
    static identity() {
        const m3 = new M3()
        m3.arr = new Float32Array(M3.ELEMENTS)
        m3.arr[0] = 1
        m3.arr[5] = 1
        m3.arr[10] = 1
        return m3
    }

    /**
     * @param {V2} v2
     */
    static translation(v2 = V2.zero()) {
        const m3 = new M3()
        m3.arr = new Float32Array(M3.ELEMENTS)
        m3.arr[0] = 1
        m3.arr[5] = 1
        m3.arr[8] = v2.arr[0]
        m3.arr[9] = v2.arr[1]
        m3.arr[10] = 1
        return m3
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    static translationV(x = 0, y = 0) {
        const m3 = new M3()
        m3.arr = new Float32Array(M3.ELEMENTS)
        m3.arr[0] = 1
        m3.arr[5] = 1
        m3.arr[8] = x
        m3.arr[9] = y
        m3.arr[10] = 1
        return m3
    }

    /**
     * @param {V2} v2
     */
    static scale(v2 = V2.one()) {
        const m3 = new M3()
        m3.arr = new Float32Array(M3.ELEMENTS)
        m3.arr[0] = v2.x
        m3.arr[5] = v2.y
        m3.arr[10] = 1
        return m3
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    static scaleV(x = 1, y = 1) {
        const m3 = new M3()
        m3.arr = new Float32Array(M3.ELEMENTS)
        m3.arr[0] = x
        m3.arr[5] = y
        m3.arr[10] = 1
        return m3
    }
    /**
     * @param {number} factor
     */
    static scaleS(factor = 1) {
        const m3 = new M3()
        m3.arr = new Float32Array(M3.ELEMENTS)
        m3.arr[0] = factor
        m3.arr[5] = factor
        m3.arr[10] = 1
        return m3
    }

    /**
     * @param {number} angle
     */
    static rotation(angle = 0) {
        const s = Math.sin(angle)
        const c = Math.cos(angle)
        const m3 = new M3()
        m3.arr = new Float32Array(M3.ELEMENTS)
        m3.arr[0] = c
        m3.arr[1] = s
        m3.arr[4] = -s
        m3.arr[5] = c
        m3.arr[10] = 1
        return m3
    }

    //#endregion

    //#region getters

    get e00() {
        return this.arr[0]
    }
    get e01() {
        return this.arr[1]
    }
    get e02() {
        return this.arr[2]
    }
    get e10() {
        return this.arr[4]
    }
    get e11() {
        return this.arr[5]
    }
    get e12() {
        return this.arr[6]
    }
    get e20() {
        return this.arr[8]
    }
    get e21() {
        return this.arr[9]
    }
    get e22() {
        return this.arr[10]
    }

    /**
     * @param {number} column
     * @param {number} row
     */
    get(column = 0, row = 0) {
        return this.arr[column*4 + row]
    }

    //#endregion

    //#region setters

    /**
     * @param {number} e00
     */
    set e00(e00) {
        this.arr[0] = e00
    }
    /**
     * @param {number} e01
     */
    set e01(e01) {
        this.arr[1] = e01
    }
    /**
     * @param {number} e02
     */
    set e02(e02) {
        this.arr[2] = e02
    }
    /**
     * @param {number} e10
     */
    set e10(e10) {
        this.arr[4] = e10
    }
    /**
     * @param {number} e11
     */
    set e11(e11) {
        this.arr[5] = e11
    }
    /**
     * @param {number} e12
     */
    set e12(e12) {
        this.arr[6] = e12
    }
    /**
     * @param {number} e20
     */
    set e20(e20) {
        this.arr[8] = e20
    }
    /**
     * @param {number} e21
     */
    set e21(e21) {
        this.arr[9] = e21
    }
    /**
     * @param {number} e22
     */
    set e22(e22) {
        this.arr[10] = e22
    }

    /**
     * @param {M3} m3
     */
    set(m3 = this) {
        this.arr[0] = m3.arr[0]
        this.arr[1] = m3.arr[1]
        this.arr[2] = m3.arr[2]
        this.arr[4] = m3.arr[4]
        this.arr[5] = m3.arr[5]
        this.arr[6] = m3.arr[6]
        this.arr[8] = m3.arr[8]
        this.arr[9] = m3.arr[9]
        this.arr[10] = m3.arr[10]
        return this
    }
    /**
     * @param {number} e00
     * @param {number} e01
     * @param {number} e02
     * @param {number} e10
     * @param {number} e11
     * @param {number} e12
     * @param {number} e20
     * @param {number} e21
     * @param {number} e22
     */
    setV(
        e00 = this.arr[0], e01 = this.arr[1], e02 = this.arr[2],
        e10 = this.arr[4], e11 = this.arr[5], e12 = this.arr[6],
        e20 = this.arr[8], e21 = this.arr[9], e22 = this.arr[10],
    ) {
        this.arr[0] = e00
        this.arr[1] = e01
        this.arr[2] = e02
        this.arr[4] = e10
        this.arr[5] = e11
        this.arr[6] = e12
        this.arr[8] = e20
        this.arr[9] = e21
        this.arr[10] = e22
        return this
    }

    //#endregion

    /**
     */
    copy() {
        const m3 = new M3()
        m3.arr = new Float32Array(this.arr)
        return m3
    }

    //#region adding and subtracting

    /**
     * @param {M3} m3
     */
    add(m3 = M3.zero()) {
        this.arr[0] += m3.arr[0]
        this.arr[1] += m3.arr[1]
        this.arr[2] += m3.arr[2]
        this.arr[4] += m3.arr[4]
        this.arr[5] += m3.arr[5]
        this.arr[6] += m3.arr[6]
        this.arr[8] += m3.arr[8]
        this.arr[9] += m3.arr[9]
        this.arr[10] += m3.arr[10]
        return this
    }
    /**
     * @param {number} e00
     * @param {number} e01
     * @param {number} e02
     * @param {number} e10
     * @param {number} e11
     * @param {number} e12
     * @param {number} e20
     * @param {number} e21
     * @param {number} e22
     */
    addV(
        e00 = 0, e01 = 0, e02 = 0,
        e10 = 0, e11 = 0, e12 = 0,
        e20 = 0, e21 = 0, e22 = 0,
    ) {
        this.arr[0] += e00
        this.arr[1] += e01
        this.arr[2] += e02
        this.arr[4] += e10
        this.arr[5] += e11
        this.arr[6] += e12
        this.arr[8] += e20
        this.arr[9] += e21
        this.arr[10] += e22
        return this
    }

    /**
     * @param {M3} m3
     */
    sub(m3 = M3.zero()) {
        this.arr[0] -= m3.arr[0]
        this.arr[1] -= m3.arr[1]
        this.arr[2] -= m3.arr[2]
        this.arr[4] -= m3.arr[4]
        this.arr[5] -= m3.arr[5]
        this.arr[6] -= m3.arr[6]
        this.arr[8] -= m3.arr[8]
        this.arr[9] -= m3.arr[9]
        this.arr[10] -= m3.arr[10]
        return this
    }
    /**
     * @param {number} e00
     * @param {number} e01
     * @param {number} e02
     * @param {number} e10
     * @param {number} e11
     * @param {number} e12
     * @param {number} e20
     * @param {number} e21
     * @param {number} e22
     */
    subV(
        e00 = 0, e01 = 0, e02 = 0,
        e10 = 0, e11 = 0, e12 = 0,
        e20 = 0, e21 = 0, e22 = 0,
    ) {
        this.arr[0] -= e00
        this.arr[1] -= e01
        this.arr[2] -= e02
        this.arr[4] -= e10
        this.arr[5] -= e11
        this.arr[6] -= e12
        this.arr[8] -= e20
        this.arr[9] -= e21
        this.arr[10] -= e22
        return this
    }

    //#endregion

    //#region multiplying

    /**
     * @param {M3} m3
     */
    mult(m3 = M3.identity()) {
        const
            a00 = this.arr[0],
            a01 = this.arr[1],
            a02 = this.arr[2],
            a10 = this.arr[4],
            a11 = this.arr[5],
            a12 = this.arr[6],
            a20 = this.arr[8],
            a21 = this.arr[9],
            a22 = this.arr[10],
            b00 = m3.arr[0],
            b01 = m3.arr[1],
            b02 = m3.arr[2],
            b10 = m3.arr[4],
            b11 = m3.arr[5],
            b12 = m3.arr[6],
            b20 = m3.arr[8],
            b21 = m3.arr[9],
            b22 = m3.arr[10]
        this.arr[0] = a00*b00 + a10*b01 + a20*b02
        this.arr[1] = a01*b00 + a11*b01 + a21*b02
        this.arr[2] = a02*b00 + a12*b01 + a22*b02
        this.arr[4] = a00*b10 + a10*b11 + a20*b12
        this.arr[5] = a01*b10 + a11*b11 + a21*b12
        this.arr[6] = a02*b10 + a12*b11 + a22*b12
        this.arr[8] = a00*b20 + a10*b21 + a20*b22
        this.arr[9] = a01*b20 + a11*b21 + a21*b22
        this.arr[10] = a02*b20 + a12*b21 + a22*b22
        return this
    }
    /**
     * @param {number} b00
     * @param {number} b01
     * @param {number} b02
     * @param {number} b10
     * @param {number} b11
     * @param {number} b12
     * @param {number} b20
     * @param {number} b21
     * @param {number} b22
     */
    multV(
        b00 = 1, b01 = 0, b02 = 0,
        b10 = 0, b11 = 1, b12 = 0,
        b20 = 0, b21 = 0, b22 = 1,
    ) {
        const
            a00 = this.arr[0],
            a01 = this.arr[1],
            a02 = this.arr[2],
            a10 = this.arr[4],
            a11 = this.arr[5],
            a12 = this.arr[6],
            a20 = this.arr[8],
            a21 = this.arr[9],
            a22 = this.arr[10]
        this.arr[0] = a00*b00 + a10*b01 + a20*b02
        this.arr[1] = a01*b00 + a11*b01 + a21*b02
        this.arr[2] = a02*b00 + a12*b01 + a22*b02
        this.arr[4] = a00*b10 + a10*b11 + a20*b12
        this.arr[5] = a01*b10 + a11*b11 + a21*b12
        this.arr[6] = a02*b10 + a12*b11 + a22*b12
        this.arr[8] = a00*b20 + a10*b21 + a20*b22
        this.arr[9] = a01*b20 + a11*b21 + a21*b22
        this.arr[10] = a02*b20 + a12*b21 + a22*b22
        return this
    }
    /**
     * @param {number} factor
     */
    multS(factor = 1) {
        this.arr[0] *= factor
        this.arr[1] *= factor
        this.arr[2] *= factor
        this.arr[4] *= factor
        this.arr[5] *= factor
        this.arr[6] *= factor
        this.arr[8] *= factor
        this.arr[9] *= factor
        this.arr[10] *= factor
        return this
    }

    //#endregion

    //#region inverting

    /**
     * Modifies original matrix
     */
    invert() {
        // Calculate minors
        const
            e00 = this.arr[0],
            e01 = this.arr[1],
            e02 = this.arr[2],
            e10 = this.arr[4],
            e11 = this.arr[5],
            e12 = this.arr[6],
            e20 = this.arr[8],
            e21 = this.arr[9],
            e22 = this.arr[10],
            m00 = e11*e22 - e12*e21,
            m01 = e12*e20 - e10*e22,
            m02 = e10*e21 - e11*e20,
            m10 = e21*e02 - e22*e01,
            m11 = e22*e00 - e20*e02,
            m12 = e20*e01 - e21*e00,
            m20 = e01*e12 - e02*e11,
            m21 = e02*e10 - e00*e12,
            m22 = e00*e11 - e01*e10,
            det = e00*m00 + e10*m10 + e20*m20

        this.arr[0] = m00/det
        this.arr[1] = m10/det
        this.arr[2] = m20/det
        this.arr[4] = m01/det
        this.arr[5] = m11/det
        this.arr[6] = m21/det
        this.arr[8] = m02/det
        this.arr[9] = m12/det
        this.arr[10] = m22/det
        return this
    }

    /**
     * Returns new matrix
     */
    inverse() {
        const
            e00 = this.arr[0],
            e01 = this.arr[1],
            e02 = this.arr[2],
            e10 = this.arr[4],
            e11 = this.arr[5],
            e12 = this.arr[6],
            e20 = this.arr[8],
            e21 = this.arr[9],
            e22 = this.arr[10],
            m00 = e11*e22 - e12*e21,
            m01 = e12*e20 - e10*e22,
            m02 = e10*e21 - e11*e20,
            m10 = e21*e02 - e22*e01,
            m11 = e22*e00 - e20*e02,
            m12 = e20*e01 - e21*e00,
            m20 = e01*e12 - e02*e11,
            m21 = e02*e10 - e00*e12,
            m22 = e00*e11 - e01*e10,
            det = e00*m00 + e01*m01 + e02*m02,
            m3 = new M3()

        m3.arr = new Float32Array(M3.ELEMENTS)
        m3.arr[0] = m00/det
        m3.arr[1] = m10/det
        m3.arr[2] = m20/det
        m3.arr[4] = m01/det
        m3.arr[5] = m11/det
        m3.arr[6] = m21/det
        m3.arr[8] = m02/det
        m3.arr[9] = m12/det
        m3.arr[10] = m22/det
        return m3
    }

    //#region transformations

    /**
     * @param {V2} v2
     */
    translate(v2 = V2.zero()) {
        const
            x = v2.arr[0],
            y = v2.arr[1]
        this.arr[0] = this.arr[0] + x*this.arr[2]
        this.arr[1] = this.arr[1] + y*this.arr[2]
        this.arr[4] = this.arr[4] + x*this.arr[6]
        this.arr[5] = this.arr[5] + y*this.arr[6]
        this.arr[8] = this.arr[8] + x*this.arr[10]
        this.arr[9] = this.arr[9] + y*this.arr[10]
        return this
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    translateV(x = 0, y = 0) {
        this.arr[0] = this.arr[0] + x*this.arr[2]
        this.arr[1] = this.arr[1] + y*this.arr[2]
        this.arr[4] = this.arr[4] + x*this.arr[6]
        this.arr[5] = this.arr[5] + y*this.arr[6]
        this.arr[8] = this.arr[8] + x*this.arr[10]
        this.arr[9] = this.arr[9] + y*this.arr[10]
        return this
    }
    /**
     * @param {V2} v2
     */
    scale(v2 = V2.one()) {
        const
            x = v2.arr[0],
            y = v2.arr[1]
        this.arr[0] = x*this.arr[0]
        this.arr[1] = y*this.arr[1]
        this.arr[4] = x*this.arr[4]
        this.arr[5] = y*this.arr[5]
        this.arr[8] = x*this.arr[8]
        this.arr[9] = y*this.arr[9]
        return this
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    scaleV(x = 1, y = 1) {
        this.arr[0] = x*this.arr[0]
        this.arr[1] = y*this.arr[1]
        this.arr[4] = x*this.arr[4]
        this.arr[5] = y*this.arr[5]
        this.arr[8] = x*this.arr[8]
        this.arr[9] = y*this.arr[9]
        return this
    }
    /**
     * @param {number} factor
     */
    scaleS(factor) {
        this.arr[0] = factor*this.arr[0]
        this.arr[1] = factor*this.arr[1]
        this.arr[4] = factor*this.arr[4]
        this.arr[5] = factor*this.arr[5]
        this.arr[8] = factor*this.arr[8]
        this.arr[9] = factor*this.arr[9]
        return this
    }
    /**
     * @param {number} angle
     */
    rotate(angle = 0) {
        const
            s = Math.sin(angle),
            c = Math.cos(angle),
            e00 = this.arr[0],
            e01 = this.arr[1],
            e10 = this.arr[4],
            e11 = this.arr[5],
            e20 = this.arr[8],
            e21 = this.arr[9]

        this.arr[0] = c*e00 - s*e01
        this.arr[1] = s*e00 + c*e01
        this.arr[4] = c*e10 - s*e11
        this.arr[5] = s*e10 + c*e11
        this.arr[8] = c*e20 - s*e21
        this.arr[9] = s*e20 + c*e21
        return this
    }

    //#endregion

    /**
     */
    isNaN() {
        return Number.isNaN(this.arr[0]) || Number.isNaN(this.arr[1]) || Number.isNaN(this.arr[2]) || Number.isNaN(this.arr[4]) || Number.isNaN(this.arr[5]) || Number.isNaN(this.arr[6]) || Number.isNaN(this.arr[8]) || Number.isNaN(this.arr[9]) || Number.isNaN(this.arr[10])
    }

    /**
     */
    toString() {
        return `[${this.arr[0]}, ${this.arr[1]}, ${this.arr[2]}, ${this.arr[4]}, ${this.arr[5]}, ${this.arr[6]}, ${this.arr[8]}, ${this.arr[9]}, ${this.arr[10]}]`
    }

    /**
     * @yields {number}
     */
    *[Symbol.iterator]() {
        yield this.arr[0]
        yield this.arr[1]
    }
}

window["M3"] = M3