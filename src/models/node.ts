import { Problem } from './problem'

export class Node {
    static firstNodeIndex = 0
    x: number;
    y: number;
    index: number;
    uIndex?: number; // Global horizontal displacement index
    vIndex?: number; // Global vertical displacement index
    wIndex?: number; // Global rotational displacement index

    private constructor (x:number, y:number, index: number) {
        this.x = x
        this.y = y
        this.index = index + Node.firstNodeIndex
    }

    static get (x:number, y:number, p:Problem): Node {
        if (p.nodes.get(x) != null) {
            if (p.nodes.get(x)!.get(y) != null) {
                return p.nodes.get(x)!.get(y)!
            } else {
                const n = new Node(x, y, p.nodeCount)
                p.nodes.get(x)!.set(y, n)
                p.nodeCount += 1
                return n
            }
        }
        const n = new Node(x, y, p.nodeCount)
        p.nodes.set(x, new Map<number, Node>())
        p.nodes.get(x)!.set(y, n)
        p.nodeCount += 1
        return n
    }
}
