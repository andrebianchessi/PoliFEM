export class Node {
    private static count = 0
    private static all= new Map<number, Map<number, Node>>()
    x: number;
    y: number;
    index: number;
    uIndex: number; // Global horizontal displacement index
    vIndex: number; // Global vertical displacement index
    wIndex: number; // Global rotational displacement index

    private constructor (x:number, y:number, index: number) {
        this.x = x
        this.y = y
        this.index = index
        this.uIndex = index
        this.vIndex = index + 1
        this.wIndex = index + 2
    }

    static get (x:number, y:number): Node {
        if (Node.all.get(x) != null) {
            if (Node.all.get(x)!.get(y) != null) {
                return Node.all.get(x)!.get(y)!
            }
        }
        Node.count += 1
        const n = new Node(x, y, Node.count)
        Node.all.set(x, new Map<number, Node>())
        Node.all.get(x)!.set(y, n)
        return n
    }
}
