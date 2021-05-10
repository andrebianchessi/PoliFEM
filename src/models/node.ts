export class Node {
    private static count = 0
    private static allByXY = new Map<number, Map<number, Node>>()
    x: number;
    y: number;
    index: number;

    private constructor (x:number, y:number, index: number) {
        this.x = x
        this.y = y
        this.index = index
    }

    static get (x:number, y:number): Node {
        if (Node.allByXY.get(x) != null) {
            if (Node.allByXY.get(x)!.get(y) != null) {
                return Node.allByXY.get(x)!.get(y)!
            }
        }
        Node.count += 1
        const n = new Node(x, y, Node.count)
        Node.allByXY.set(x, new Map<number, Node>())
        Node.allByXY.get(x)!.set(y, n)
        return n
    }
}
