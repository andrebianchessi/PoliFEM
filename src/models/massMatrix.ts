import { Matrix } from 'mathjs'
import { Element } from './element'
import { math } from './math'
import { TrussProperties } from './trussProperties'

export class MassMatrix {
    type: 'Truss' | 'Frame'

    m: Matrix
    mLocal?:Matrix

    constructor (element: Element, type: 'Truss' | 'Frame') {
        const c = element.angle.c()
        const s = element.angle.s()
        let t

        this.type = type
        switch (type) {
        case 'Truss': {
            t = math.matrix!(
                [
                    [c, s, 0, 0],
                    [-s, c, 0, 0],
                    [0, 0, c, s],
                    [0, 0, -s, c]
                ]
            )
            const rho = (element.properties as TrussProperties).rho!
            const A = (element.properties as TrussProperties).A
            const l = element.length()

            const r = rho * A * l / 2
            this.mLocal = math.matrix!([
                [r, 0, 0, 0],
                [0, r, 0, 0],
                [0, 0, r, 0],
                [0, 0, 0, r]
            ])
            break
        }
        }

        this.m = math.multiply!(math.multiply!(math.transpose!(t as Matrix), this.mLocal!), t as Matrix)
    }
}
