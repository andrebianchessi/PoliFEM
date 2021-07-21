import { Problem } from './problem'
import { eachLine } from 'line-reader'
export class GmshReader {
    p: Problem
    constructor (p:Problem) {
        this.p = p
    }

    readMshFile (mshFilePath: string) {
        eachLine(mshFilePath, function (line: string) {

        }
        )
    }
}
