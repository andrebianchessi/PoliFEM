import { Problem } from './problem'
import { SolidElementProperties } from './solidElementProperties'

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
    entity: (PointEntity|CurveEntity|SurfaceEntity)
    entityDim: 0|1|2
}
type Element = {
    tag: number
    entity: (PointEntity|CurveEntity|SurfaceEntity)
    nodes: Node[]
}

type xyz = {
    x:number,
    y:number,
    z:number
}
export class GmshParser {
    p: Problem
    thickness?: number

    // lists of msh file lines
    physicalNamesLines: string[]
    entitiesLines: string[]
    nodesLines: string[]
    elementsLines: string[]

    physicalNames: Map<number, PhysicalName>
    pointEntities: Map<number, PointEntity>
    curveEntities: Map<number, CurveEntity>
    surfaceEntities: Map<number, SurfaceEntity>

    nodes: Map<number, Node>
    elements: Map<number, Element>

    nodesFromPhysicalName: Map<string, Node[]>

    constructor (p:Problem) {
        this.p = p
        this.physicalNamesLines = []
        this.entitiesLines = []
        this.nodesLines = []
        this.elementsLines = []

        this.physicalNames = new Map<number, PhysicalName>()
        this.pointEntities = new Map<number, PointEntity>()
        this.curveEntities = new Map<number, CurveEntity>()
        this.surfaceEntities = new Map<number, SurfaceEntity>()

        this.nodes = new Map<number, Node>()
        this.elements = new Map<number, Element>()

        this.nodesFromPhysicalName = new Map<string, Node[]>()
    }

    /**
     * Adds nodes and elements from msh file
     * currently only uniform domain properties
     * are supported
     * @param p
     * @param mshFilePath
     */
    async readMshFile (mshFilePath: string, domainThickness: number, domainProperties: SolidElementProperties) {
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
            if (region === 'Entities') {
                this.entitiesLines.push(line)
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
                this.physicalNames.set(+nums[1], { dimension: +nums[0], tag: +nums[1], name: name })
                i++
            }
        }

        // Parse entities
        if (this.entitiesLines.length > 0) {
            const nums = this.entitiesLines[0].match(numberRegex)!
            const nPoints = +nums[0]
            const nCurves = +nums[1]
            const nSurfaces = +nums[2]
            let i = 1
            // pointEntities
            for (let p = 0; p < nPoints; p++) {
                const nums = this.entitiesLines[i].match(numberRegex)!
                const tag = +nums[0]
                const x = +nums[1]
                const y = +nums[2]
                const z = +nums[3]
                const nPhysicalTags = +nums[4]
                const physicalNames:PhysicalName[] = []
                for (let t = 0; t < nPhysicalTags; t++) {
                    physicalNames.push(this.physicalNames.get(+nums[5 + t])!)
                }
                this.pointEntities.set(tag, {
                    tag: tag,
                    x: x,
                    y: y,
                    z: z,
                    physicalNames: physicalNames
                })
                i++
            }
            // curveEntities
            for (let c = 0; c < nCurves; c++) {
                const nums = this.entitiesLines[i].match(numberRegex)!
                const tag = +nums[0]
                const minX = +nums[1]
                const minY = +nums[2]
                const minZ = +nums[3]
                const maxX = +nums[4]
                const maxY = +nums[5]
                const maxZ = +nums[6]
                const nPhysicalNames = +nums[7]
                const physicalNames:PhysicalName[] = []
                for (let t = 0; t < nPhysicalNames; t++) {
                    physicalNames.push(this.physicalNames.get(+nums[8 + t])!)
                }
                const nPoints = +nums[8 + nPhysicalNames]
                const pointEntities:PointEntity[] = []
                for (let p = 0; p < nPoints; p++) {
                    pointEntities.push(this.pointEntities.get(+nums[9 + p])!)
                }
                this.curveEntities.set(tag, {
                    tag: tag,
                    minX: minX,
                    minY: minY,
                    minZ: minZ,
                    maxX: maxX,
                    maxY: maxY,
                    maxZ: maxZ,
                    physicalNames: physicalNames,
                    points: pointEntities
                })
                i++
            }
            // surfaceEntities
            for (let s = 0; s < nSurfaces; s++) {
                const nums = this.entitiesLines[i].match(numberRegex)!
                const tag = +nums[0]
                const minX = +nums[1]
                const minY = +nums[2]
                const minZ = +nums[3]
                const maxX = +nums[4]
                const maxY = +nums[5]
                const maxZ = +nums[6]
                const nPhysicalNames = +nums[7]
                const physicalNames:PhysicalName[] = []
                for (let t = 0; t < nPhysicalNames; t++) {
                    physicalNames.push(this.physicalNames.get(+nums[8 + t])!)
                }
                const nCurves = +nums[8 + nPhysicalNames]
                const curveEntities:CurveEntity[] = []
                for (let c = 0; c < nCurves; c++) {
                    curveEntities.push(this.curveEntities.get(+nums[9 + c])!)
                }
                this.surfaceEntities.set(tag, {
                    tag: tag,
                    minX: minX,
                    minY: minY,
                    minZ: minZ,
                    maxX: maxX,
                    maxY: maxY,
                    maxZ: maxZ,
                    physicalNames: physicalNames,
                    curves: curveEntities
                })
                i++
            }
        }

        // Parse Nodes
        if (this.nodesLines.length > 0) {
            const nums = this.nodesLines[0].match(numberRegex)!
            const nEntities = +nums[0]
            // const nNodes = +nums[1]
            // const minNodeTag = +nums[2]
            // const maxNodeTag = +nums[3]
            let i = 1
            for (let e = 0; e < nEntities; e++) {
                const nums = this.nodesLines[i].match(numberRegex)!
                const entityDim = +nums[0]
                const entityTag = +nums[1]
                let entity: PointEntity|CurveEntity|SurfaceEntity
                if (entityDim === 0) {
                    entity = this.pointEntities.get(entityTag)!
                }
                if (entityDim === 1) {
                    entity = this.curveEntities.get(entityTag)!
                }
                if (entityDim === 2) {
                    entity = this.surfaceEntities.get(entityTag)!
                }
                // const isParametric = (nums[2] === '1')
                const nNodes = +nums[3]

                i++
                const nodeTags: number[] = []
                const nodeXYZ: xyz[] = []
                for (let n = 0; n < nNodes; n++) {
                    const nums = this.nodesLines[i].match(numberRegex)!
                    nodeTags.push(+nums[0])
                    i++
                }
                for (let n = 0; n < nNodes; n++) {
                    const nums = this.nodesLines[i].match(numberRegex)!
                    nodeXYZ.push({
                        x: +nums[0],
                        y: +nums[1],
                        z: +nums[2]
                    })
                    i++
                }
                for (let n = 0; n < nNodes; n++) {
                    const tag = nodeTags[n]
                    const xyz = nodeXYZ[n]
                    const node: Node = {
                        tag: tag,
                        x: xyz.x,
                        y: xyz.y,
                        z: xyz.z,
                        entity: entity!,
                        entityDim: entityDim as (0|1|2)
                    }
                    this.nodes.set(tag, node)
                }
            }
        }

        // Parse elements
        if (this.elementsLines.length > 0) {
            const nums = this.elementsLines[0].match(numberRegex)!
            const nEntities = +nums[0]
            // const nElements = +nums[1]
            // const minElementTag = +nums[2]
            // const maxElementTag = +nums[3]

            let i = 1
            for (let e = 0; e < nEntities; e++) {
                const nums = this.elementsLines[i].match(numberRegex)!
                const entityDim = +nums[0]
                const entityTag = +nums[1]
                const elementType = +nums[2]
                const nElements = +nums[3]
                if (elementType !== 1 && elementType !== 2 && elementType !== 15) {
                    throw new Error('Only point, lines and triangular elements are supported')
                }
                let entity: PointEntity|CurveEntity|SurfaceEntity
                if (entityDim === 0) {
                    entity = this.pointEntities.get(entityTag)!
                }
                if (entityDim === 1) {
                    entity = this.curveEntities.get(entityTag)!
                }
                if (entityDim === 2) {
                    entity = this.surfaceEntities.get(entityTag)!
                }
                i++
                for (let el = 0; el < nElements; el++) {
                    const nums = this.elementsLines[i].match(numberRegex)!
                    const tag = +nums[0]
                    const nodes: Node[] = []
                    for (let t = 1; t < nums.length; t++) {
                        nodes.push(this.nodes.get(+nums[t])!)
                    }
                    const element:Element = {
                        tag: tag,
                        entity: entity!,
                        nodes: nodes
                    }
                    this.elements.set(tag, element)

                    i++
                }
            }
        }

        // Build nodesFromPhysicalName
        for (const [, physicalName] of this.physicalNames) {
            this.nodesFromPhysicalName.set(physicalName.name, [])
        }
        for (const [, n] of this.nodes) {
            for (const physicalName of n.entity.physicalNames) {
                this.nodesFromPhysicalName.get(physicalName.name)!.push(n)
            }
        }
    }
}
