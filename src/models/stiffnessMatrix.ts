import { Angle } from './angleInRadians'

export class StiffnessMatrix {
    type: 'Beam'|'Truss'|'Frame'

    k: [[number, number, number],
    [number, number, number],
    [number, number, number]]

    constructor (type: 'Beam'|'Truss'|'Frame', angle: Angle) {
        const t = [

        ]

        this.type = type
        switch (type) {
        case 'Beam': {
            this.k = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ]
            break
        }
        case 'Truss': {
            this.k = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ]
            break
        }
        case 'Frame': {
            this.k = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ]
        }
        }
    }
}
