export class Angle {
    private radians:number
    constructor (radians:number) {
        this.radians = radians
    }

    cos (): number {
        return Math.cos(this.radians)
    }

    sin (): number {
        return Math.sin(this.radians)
    }
}
