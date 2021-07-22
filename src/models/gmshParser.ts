import { Problem } from './problem'

type PhysicalName = {
    tag: number
    dimension: number
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
type Node = {
    tag: number
    x: number
    y: number
    z: number
}
type Element = {
    tag: number
    entities: (PointEntity|CurveEntity|SurfaceEntity)[]
    nodes: Node[]
}
export class GmshParser {
    p: Problem
    thickness?: number

    // lists of msh file lines
    physicalNamesLines: string[]
    nodesLines: string[]
    elementsLines: string[]

    physicalNames: PhysicalName[]

    constructor (p:Problem) {
        this.p = p
        this.physicalNamesLines = []
        this.nodesLines = []
        this.elementsLines = []

        this.physicalNames = []
    }

    /**
     * Adds nodes and elements from msh file
     * @param p
     * @param mshFilePath
     */
    async readMshFile (mshFilePath: string, domainThickness: number) {
        const numberRegex = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g
        const stringRegex = /".*"/g
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
                if (region === r && lines[lineIndex] === '$End' + r) {
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

        // Parse PhysicalNames
        if (this.physicalNamesLines.length > 0) {
            let i = 1
            while (i < this.physicalNamesLines.length) {
                const nums = this.physicalNamesLines[i].match(numberRegex)!
                let name = this.physicalNamesLines[i].match(stringRegex)![0]
                name = name.replace('"', '').replace('"', '')
                this.physicalNames.push({ dimension: +nums[0], tag: +nums[1], name: name })
                i++
            }
        }
    }
}
