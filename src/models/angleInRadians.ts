export class Angle {
    private radians:number
    constructor (radians:number) {
        this.radians = radians
    }

    c (): number {
        if (this.radians === Math.PI / 2) {
            return 0
        }
        if (this.radians === -Math.PI / 2) {
            return 0
        }
        return Math.cos(this.radians)
    }

    s (): number {
        if (this.radians === Math.PI / 2) {
            return 1
        }
        if (this.radians === -Math.PI / 2) {
            return -1
        }
        return Math.sin(this.radians)
    }
}
