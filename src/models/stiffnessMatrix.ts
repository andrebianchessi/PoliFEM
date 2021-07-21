import { Matrix } from 'mathjs'
// eslint-disable-next-line camelcase
import { getT_4x4, getT_6x6 } from '../functions/rotationalMatrix'
import { StructuralElement } from './structuralElement'
import { FrameProperties } from './frameProperties'
import { math } from './math'
import { TrussProperties } from './trussProperties'
import { SolidElement } from './solidElement'

export class StiffnessMatrix {
    type: 'Frame' | 'Truss' | 'PlaneStress'

    k: Matrix
    kLocal: Matrix

    constructor (element: StructuralElement | SolidElement, type: 'Frame' | 'Truss' | 'PlaneStress') {
        this.type = type

        // dummy constructor to avoid compilation errors
        this.kLocal = math.matrix!()
        this.k = math.matrix!()

        if (element instanceof StructuralElement) {
            let t
            switch (type) {
            case 'Frame': {
                t = getT_6x6(element.angle)

                const E = element.properties.E
                const I = (element.properties as FrameProperties).I
                const A = (element.properties as FrameProperties).A
                const l = element.length()
                const l3 = l * l * l
                const l2 = l * l

                const EAl = E * A / l
                const EI12l3 = E * I * 12 / l3
                const EI6l2 = E * I * 6 / l2
                const EI4l = E * I * 4 / l
                const EI2l = E * I * 2 / l
                this.kLocal = math.matrix!([
                    [EAl, 0, 0, -EAl, 0, 0],
                    [0, EI12l3, EI6l2, 0, -EI12l3, EI6l2],
                    [0, EI6l2, EI4l, 0, -EI6l2, EI2l],
                    [-EAl, 0, 0, EAl, 0, 0],
                    [0, -EI12l3, -EI6l2, 0, EI12l3, -EI6l2],
                    [0, EI6l2, EI2l, 0, -EI6l2, EI4l]
                ])
                break
            }
            case 'Truss': {
                t = t = getT_4x4(element.angle)

                const E = element.properties.E
                const A = (element.properties as TrussProperties).A
                const l = element.length()

                const EAl = E * A / l
                this.kLocal = math.matrix!([
                    [EAl, 0, -EAl, 0],
                    [0, 0, 0, 0],
                    [-EAl, 0, EAl, 0],
                    [0, 0, 0, 0]
                ])
                break
            }
            }

            this.k = math.multiply!(math.multiply!(math.transpose!(t as Matrix), this.kLocal), t as Matrix)
        } else {
            switch (type) {
            case 'PlaneStress': {
                this.kLocal = math.matrix!()
                this.k = math.matrix!()
            }
            }
        }
    }
}
