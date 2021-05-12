/* eslint-disable no-unused-vars */
/* eslint-disable no-new */
import { BoundaryCondition } from './models/boundaryCondition'
import { Element } from './models/element'
import { Load } from './models/load'
import { Node } from './models/node'
import { StaticProblem } from './models/staticProblem'

const p = new StaticProblem()

const properties = { E: 200000, I: 6660000, A: 1780 }
const n1 = Node.get(0, 0, p)
const n2 = Node.get(2000, 0, p)
const e1 = new Element('Beam', n1, n2, properties, p)
new Load(0, -50, 0, n2, p)
new BoundaryCondition(n1, 'Fix', p)

// const n1 = Node.get(0, 0, p)
// const n2 = Node.get(0, 3, p)
// const n3 = Node.get(0, 6, p)
// const n4 = Node.get(3.2, 3, p)
// const e1 = new Element('Truss', n1, n2, properties, p)
// const e2 = new Element('Truss', n2, n3, properties, p)
// const e3 = new Element('Frame', n2, n4, properties, p)
// new Load(50, 0, 0, n2, p)
// // new Load(0, -12.8, -6.8267, n2, p)
// // new Load(0, -12.8, 6.8267, n4, p)
// new BoundaryCondition(n1, 'Fix', p)
// new BoundaryCondition(n3, 'Fix', p)
// new BoundaryCondition(n4, 'Fix', p)

p.solve()
p.plot()
