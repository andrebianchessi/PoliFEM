export class Forces {
    N: number // normal
    V: number // shear
    M: number // moment

    constructor (N:number, V:number, M:number) {
        this.N = N
        this.V = V
        this.M = M
    }
}
