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
        for (const [lineIndex, line] of lines.entries()) {
            console.log(line)
            console.log(lineIndex)
        }
    }
}
