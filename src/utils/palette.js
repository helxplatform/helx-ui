import chroma from 'chroma-js'

const clamp = (x, min, max) => (
    Math.max(min, Math.min(x, max))
)

const GOLDEN_ANGLE_DEG = 180 * (3 - Math.sqrt(5)) // golden angle in degrees

export class Palette {
    /**
     * 
     * @param {chroma.Color} seed - Seed color used to generate palette
     */
    constructor(seed, options) {
        this.seed = seed
        this.mode = options.mode || null

        this._palette = []
    }
    getColor(i) {
        if (!Number.isInteger(i) || i < 0) throw Error("getColor arg 'i' invalid: " + i);
        let color
        while (this._palette[i] === undefined) {
            color = this.getNextColor()
        }
        return color || Palette.formatColor(this._palette[i], this.mode)
    }
    getNextColor() {
        const color = this._generateColor(this.seed, this._palette.length)
        this._palette.push(color)
        return Palette.formatColor(color, this.mode)
    }
    // Generate the next palette color using the seed.
    _generateColor(seed, i) {
        let [h, s, l, _] = seed.hsl() // not sure what `_` (4th value) is; docs don't mention it.
        // hue-shift by golden angle*i mod 360deg
        h  = (h + (GOLDEN_ANGLE_DEG*i)) % 360
        return chroma.hsl(h, s, l, _)
    }
    static formatColor(color, mode) {
        switch (mode) {
            case 'hex':
                return color.hex()
            case 'rgb':
                return color.rgb()
            case null:
                // Default mode, return chroma instance
                return color
            default:
                console.error('Unrecognized color mode ', mode)
                return color
        }
    }
}
export class PastelPalette extends Palette {
    constructor(pastelOptions) {
        const { seed, ...options } = pastelOptions
        super(PastelPalette._generateSeed(seed), options)
    }
    static _generateSeed(seedOptions={}) {
        const { minHue=0, minSaturation=0, minLightness=0, maxHue=360, maxSaturation=1, maxLightness=1 } = seedOptions
        // Seed the palette with a visually pleasing pastel color. 
        const r = (Math.round(Math.random()* 127) + 127).toString(16)
        const g = (Math.round(Math.random()* 127) + 127).toString(16)
        const b = (Math.round(Math.random()* 127) + 127).toString(16)
        const color = chroma.hex(`#${r}${g}${b}`)
        let [h, s, l, _] = color.hsl()
        h = clamp(h, minHue, maxHue)
        s = clamp(s, minSaturation, maxSaturation)
        l = clamp(l, minLightness, maxLightness)
        return chroma.hsl(h, s, l, _)
    }
}