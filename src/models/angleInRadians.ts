export class Angle {
    private radians:number
    constructor (radians:number) {
        this.radians = radians
    }

    c (): number {
        return Math.cos(this.radians)
    }

    s (): number {
        return Math.sin(this.radians)
    }
}
