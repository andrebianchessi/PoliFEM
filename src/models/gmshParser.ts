import { Problem } from './problem'
export class GmshParser {
    p: Problem
    nodesFromTag: Map<string, Node[]>
    constructor (p:Problem) {
        this.p = p
        this.nodesFromTag = new Map<string, Node[]>()
    }

    /**
     * Adds nodes and elements from msh file
     * @param p
     * @param mshFilePath
     */
    readMshFile (mshFilePath: string) {
        const lines = require('fs').readFileSync(mshFilePath, 'utf-8').split('\n').filter(Boolean)
        let region: ''|'MeshFormat'|'PhysicalNames'|'Entities'|'Nodes'|'Elements' = ''
        const regions = ['MeshFormat', 'PhysicalNames', 'Entities', 'Nodes', 'Elements']
        for (const [lineIndex, line] of lines.entries()) {
            for (const r of regions) {
                if (region === '' && line === '$' + r) {
                    region = r as ''|'MeshFormat'|'PhysicalNames'|'Entities'|'Nodes'|'Elements'
                }
                if (region === r && line === '$End' + r) {
                    region = ''
                }
            }

            console.log(region)
            console.log(lineIndex)
        }
    }
}
