import { Problem } from './problem'
import { SolidElementProperties } from './solidElementProperties'
import * as SolverNode from '../models/node'
import { SolidElement } from './solidElement'
import { BoundaryCondition } from './boundaryCondition'
import { Load } from './load'
import { StaticProblem } from './staticProblem'

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
    dimension: 0
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
    dimension: 1
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
    dimension: 2
}
type Node = {
    tag: number
    x: number
    y: number
    z: number
    entity: (PointEntity|CurveEntity|SurfaceEntity)
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
    properties?: SolidElementProperties

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
    nodeFromXY: Map<number, Map<number, Node>>

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
        this.nodeFromXY = new Map<number, Map<number, Node>>()
    }

    private buildLineArrays (mshFilePath: string, domainProperties: SolidElementProperties) {
        const numberRegex = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g
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
    }

    /**
     * Reads msh file
     * @param p
     * @param mshFilePath
     */
    readMshFile (mshFilePath: string, domainProperties: SolidElementProperties) {
        this.properties = domainProperties

        const numberRegex = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g
        const stringRegex = /".*"/g

        this.buildLineArrays(mshFilePath, domainProperties)

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
                    physicalNames: physicalNames,
                    dimension: 0
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
                    pointEntities.push(this.pointEntities.get(Math.abs(+nums[9 + nPhysicalNames + p]))!)
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
                    points: pointEntities,
                    dimension: 1
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
                    curveEntities.push(this.curveEntities.get(+nums[9 + nPhysicalNames + c])!)
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
                    curves: curveEntities,
                    dimension: 2
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
                        entity: entity!
                    }
                    this.nodes.set(tag, node)
                    if (!this.nodeFromXY.get(xyz.x)) {
                        this.nodeFromXY.set(xyz.x, new Map<number, Node>())
                    }
                    this.nodeFromXY.get(xyz.x)!.set(xyz.y, node)
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
        for (const curveEntity of this.curveEntities.values()) {
            for (const physicalName of curveEntity.physicalNames) {
                for (const pointEntity of curveEntity.points) {
                    const n = this.nodeFromXY.get(pointEntity.x)!.get(pointEntity.y)!
                    this.nodesFromPhysicalName.get(physicalName.name)!.push(n)
                }
            }
        }
        for (const surfaceEntity of this.surfaceEntities.values()) {
            for (const physicalName of surfaceEntity.physicalNames) {
                for (const curveEntity of surfaceEntity.curves) {
                    for (const pointEntity of curveEntity.points) {
                        const n = this.nodeFromXY.get(pointEntity.x)!.get(pointEntity.y)!
                        this.nodesFromPhysicalName.get(physicalName.name)!.push(n)
                    }
                }
            }
        }
    }

    // Adds nodes and elements from msh file
    // must be run after readMshFile
    addNodesAndElements () {
        for (const [, n] of this.nodes) {
            SolverNode.Node.get(n.x, n.y, this.p)
        }
        for (const [, e] of this.elements) {
            if (e.entity.dimension === 2) {
                const n1 = SolverNode.Node.get(e.nodes[0].x, e.nodes[0].y, this.p)
                const n2 = SolverNode.Node.get(e.nodes[1].x, e.nodes[1].y, this.p)
                const n3 = SolverNode.Node.get(e.nodes[2].x, e.nodes[2].y, this.p)
                new SolidElement(n1, n2, n3, this.properties!, this.p)
            }
        }
    }

    saveStaticProblemToMsh (filePath: string, displacementFactor: number = 0) {
        let s: string = ''
        // Msh version
        s += '$MeshFormat\n'
        s += '4.1 0 8\n'
        s += '$EndMeshFormat\n'

        // Nodes
        s += '$Nodes\n'
        const nNodes = this.p.nodeCount
        const maxNodeTag = SolverNode.Node.firstNodeIndex + nNodes - 1
        s += `1 ${nNodes} ${SolverNode.Node.firstNodeIndex} ${maxNodeTag}\n`
        s += `2 1 0 ${nNodes}\n`
        for (const map of this.p.nodes.values()) {
            for (const node of map.values()) {
                s += `${node.index}\n`
            }
        }
        for (const map of this.p.nodes.values()) {
            for (const node of map.values()) {
                const dx = (this.p as StaticProblem).U!.get([node.uIndex!, 0]) * displacementFactor
                const x = node.x + dx
                const dy = (this.p as StaticProblem).U!.get([node.vIndex!, 0]) * displacementFactor
                const y = node.y + dy
                s += `${x} ${y} 0\n`
            }
        }
        s += '$EndNodes\n'

        // Elements
        s += '$Elements\n'
        const nElements = this.p.solidElementCount
        const maxElementTag = SolidElement.firstIndex + nElements - 1
        s += `1 ${nElements} ${SolidElement.firstIndex} ${maxElementTag}\n`
        s += `2 1 2 ${nElements}\n`
        for (const [, e] of this.p.solidElements) {
            s += `${e.index} ${e.n1.index} ${e.n2.index} ${e.n3.index}\n`
        }
        s += '$EndElements\n'

        // Horizontal displacements NodeData
        s += '$NodeData\n'
        s += '1\n'
        s += '"Horizontal displacement"\n'
        s += '1\n'
        s += '0.0\n'
        s += '3\n'
        s += '0\n'
        s += '1\n'
        s += `${this.p.nodeCount}\n`
        for (const map of this.p.nodes.values()) {
            for (const node of map.values()) {
                const dx = (this.p as StaticProblem).U!.get([node.uIndex!, 0])
                s += `${node.index} ${dx}\n`
            }
        }
        s += '$EndNodeData\n'

        // Vertical Displacements Node Data
        s += '$NodeData\n'
        s += '1\n'
        s += '"Vertical displacement"\n'
        s += '1\n'
        s += '0.0\n'
        s += '3\n'
        s += '0\n'
        s += '1\n'
        s += `${this.p.nodeCount}\n`
        for (const map of this.p.nodes.values()) {
            for (const node of map.values()) {
                const dy = (this.p as StaticProblem).U!.get([node.vIndex!, 0])
                s += `${node.index} ${dy}\n`
            }
        }
        s += '$EndNodeData\n'

        // Von Mises Element
        s += '$NodeData\n'
        s += '1\n'
        s += '"Von Mises Stress"\n'
        s += '1\n'
        s += '0.0\n'
        s += '3\n'
        s += '0\n'
        s += '1\n'
        s += `${this.p.solidElementCount}\n`
        for (const e of this.p.solidElements.values()) {
            s += `${e.index} ${e.getVonMises()}\n`
        }
        s += '$EndNodeData\n'

        require('fs').writeFile(filePath, s, function (err: any) {
            if (err) return console.log(err)
            console.log('Saving complete!\nFile:' + filePath)
        })
    }

    createBoundaryConditions (physicalName: string,
        type: 'Fix' | 'RollerX' | 'RollerY' | 'Pin' | 'XDisplacement' | 'YDisplacement' | 'AngularDisplacement',
        value:number = 0) {
        for (const n of this.nodesFromPhysicalName.get(physicalName)!) {
            const ns: SolverNode.Node = SolverNode.Node.get(n.x, n.y, this.p)
            new BoundaryCondition(ns, type, this.p, value)
        }
    }

    createLoads (physicalName: string, x: number, y: number) {
        for (const n of this.nodesFromPhysicalName.get(physicalName)!) {
            const ns: SolverNode.Node = SolverNode.Node.get(n.x, n.y, this.p)
            new Load(x, y, 0, ns, this.p)
        }
    }
}
