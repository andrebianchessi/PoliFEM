export class NodalLoads {
    // Nodal loads at the element's reference frame
    // positive X forces are directed to the right
    // positive Y forces are directed upwards
    // positive moments are directed cc-wise
    X1:number
    Y1:number
    M1:number
    X2:number
    Y2:number
    M2:number
    constructor (X1:number, Y1:number, M1:number, X2:number, Y2:number, M2:number) {
        this.X1 = X1
        this.Y1 = Y1
        this.M1 = M1
        this.X2 = X2
        this.Y2 = Y2
        this.M2 = M2
    }
}
