export class Forces {
    N: (xAdim: number) => number // normal
    V: (xAdim: number) => number // shear
    M: (xAdim: number) => number // moment

    constructor (N:(xAdim: number) => number, V:(xAdim: number) => number, M:(xAdim: number) => number) {
        this.N = N
        this.V = V
        this.M = M
    }
}
