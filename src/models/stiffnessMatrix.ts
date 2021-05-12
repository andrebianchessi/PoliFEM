import { Matrix } from 'mathjs'
import { BeamProperties } from './beamProperties'
import { Element } from './element'
import { FrameProperties } from './frameProperties'
import { math } from './math'
import { TrussProperties } from './trussProperties'

export class StiffnessMatrix {
    type: 'Frame' | 'Truss' | 'Beam'

    k: Matrix
    kLocal:Matrix

    constructor (element: Element, type: 'Frame' | 'Truss' | 'Beam') {
        const c = element.angle.c()
        const s = element.angle.s()
        let t

        this.type = type
        switch (type) {
        case 'Frame': {
            t = math.matrix!(
                [
                    [c, s, 0, 0, 0, 0],
                    [-s, c, 0, 0, 0, 0],
                    [0, 0, 1, 0, 0, 0],
                    [0, 0, 0, c, s, 0],
                    [0, 0, 0, -s, c, 0],
                    [0, 0, 0, 0, 0, 1]
                ]
            )
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
            t = math.matrix!(
                [
                    [c, s, 0, 0],
                    [-s, c, 0, 0],
                    [0, 0, c, s],
                    [0, 0, -s, c]
                ]
            )
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
        case 'Beam': {
            t = math.matrix!(
                [
                    [c, s, 0, 0, 0, 0],
                    [-s, c, 0, 0, 0, 0],
                    [0, 0, 1, 0, 0, 0],
                    [0, 0, 0, c, s, 0],
                    [0, 0, 0, -s, c, 0],
                    [0, 0, 0, 0, 0, 1]
                ]
            )
            const E = element.properties.E
            const I = (element.properties as BeamProperties).I
            const l = element.length()
            const l3 = l * l * l
            const l2 = l * l

            const EI12l3 = E * I * 12 / l3
            const EI6l2 = E * I * 6 / l2
            const EI4l = E * I * 4 / l
            const EI2l = E * I * 2 / l
            this.kLocal = math.matrix!([
                [0, 0, 0, 0, 0, 0],
                [0, EI12l3, EI6l2, 0, -EI12l3, EI6l2],
                [0, EI6l2, EI4l, 0, -EI6l2, EI2l],
                [0, 0, 0, 0, 0, 0],
                [0, -EI12l3, -EI6l2, 0, EI12l3, -EI6l2],
                [0, EI6l2, EI2l, 0, -EI6l2, EI4l]
            ])
            break
        }
        }

        this.k = math.multiply!(math.multiply!(math.transpose!(t), this.kLocal), t)
    }
}
