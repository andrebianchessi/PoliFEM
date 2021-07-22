import { Problem } from './problem'

type PhysicalName = {
    dimension: number
    tag: number
    name: string
}
type PointEntity = {
    tag: number
    x: number
    y: number
    z: number
    physicalNames: PhysicalName[]
}
type CurveEntity = {
    tag: number
    minX: number
    minY: number
    minZ: number
    maxX: number
    maxY: number
    maxZ: number
    physicalNames: PhysicalName[]
    points: PointEntity[]
}
type SurfaceEntity = {
    tag: number
    minX: number
    minY: number
    minZ: number
    maxX: number
    maxY: number
    maxZ: number
    physicalNames: PhysicalName[]
    curves: CurveEntity[]
}

export class GmshParser {
    p: Problem
    thickness?: number

    // lists of msh file lines
    physicalNamesLines: string[]
    nodesLines: string[]
    elementsLines: string[]

    constructor (p:Problem) {
        this.p = p
        this.physicalNamesLines = []
        this.nodesLines = []
        this.elementsLines = []
    }

    /**
     * Adds nodes and elements from msh file
     * @param p
     * @param mshFilePath
     */
    async readMshFile (mshFilePath: string, domainThickness: number) {
        const numberRegex = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g
        this.thickness = domainThickness
        const lines = require('fs').readFileSync(mshFilePath, 'utf-8').split('\n').filter(Boolean)
        let region: ''|'MeshFormat'|'PhysicalNames'|'Entities'|'Nodes'|'Elements' = ''
        const regions = ['MeshFormat', 'PhysicalNames', 'Entities', 'Nodes', 'Elements']

        // Build lines arrays
        for (const [lineIndex, line] of lines.entries()) {
            // Find current region of the file
            for (const r of regions) {
                if (region === '' && lines[lineIndex - 1] === '$' + r) {
                    region = r as ''|'MeshFormat'|'PhysicalNames'|'Entities'|'Nodes'|'Elements'
                }
                if (region === r && lines[lineIndex - 1] === '$End' + r) {
                    region = ''
                }
            }

            if (region === 'MeshFormat') {
                const fileVersion = +line.match(numberRegex)[0]
                if (fileVersion !== 4.1) {
                    console.log('Warning!! Gmsh file parser was built considering 4.1 mesh version')
                }
            }

            if (region === 'PhysicalNames') {
                this.physicalNamesLines.push(line)
            }
            if (region === 'Nodes') {
                this.nodesLines.push(line)
            }
            if (region === 'Elements') {
                this.elementsLines.push(line)
            }
        }

        // Get data line by line
        const i = 0
    }
}
