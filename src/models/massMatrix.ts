import { Matrix } from 'mathjs'
import { Element } from './element'
import { math } from './math'
import { TrussProperties } from './trussProperties'

export class MassMatrix {
    type: 'Truss' | 'Frame'

    m?: Matrix

    constructor (element: Element, type: 'Truss' | 'Frame') {
        this.type = type
        switch (type) {
        case 'Truss': {
            const rho = (element.properties as TrussProperties).rho!
            const A = (element.properties as TrussProperties).A
            const l = element.length()

            const r = rho * A * l / 2
            this.m = math.matrix!([
                [r, 0, 0, 0],
                [0, r, 0, 0],
                [0, 0, r, 0],
                [0, 0, 0, r]
            ])
            break
        }
        }
    }
}
