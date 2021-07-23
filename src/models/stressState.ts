export class StressState {
    sigmaX: number
    sigmaY: number
    tauXY: number

    constructor (sigmaX: number, sigmaY: number, tauXY: number) {
        this.sigmaX = sigmaX
        this.sigmaY = sigmaY
        this.tauXY = tauXY
    }

    getVonMises (): number {
        const I1 = this.sigmaX + this.sigmaY
        const I2 = this.sigmaX * this.sigmaY - this.tauXY * this.tauXY
        return Math.sqrt(I1 * I1 - 3 * I2)
    }
}
