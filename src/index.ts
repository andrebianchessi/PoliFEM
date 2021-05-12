/* eslint-disable no-unused-vars */
/* eslint-disable no-new */
import { BoundaryCondition } from './models/boundaryCondition'
import { Element } from './models/element'
import { Load } from './models/load'
import { Node } from './models/node'
import { StaticProblem } from './models/staticProblem'

const p = new StaticProblem()

const properties = { E: 260000000000, A: 1 / 10000 }

const n1 = Node.get(0, 0, p)
const n2 = Node.get(0, 1, p)
const n3 = Node.get(1 * Math.cos(30 * Math.PI / 180), -1 * Math.sin(30 * Math.PI / 180), p)
const n4 = Node.get(-1 * Math.cos(30 * Math.PI / 180), -1 * Math.sin(30 * Math.PI / 180), p)

new Element('Truss', n3, n1, properties, p)
new Element('Truss', n1, n2, properties, p)
new Element('Truss', n4, n1, properties, p)

new Load(20000 * Math.cos(45 * Math.PI / 180), 20000 * Math.sin(45 * Math.PI / 180), 0, n1, p)

new BoundaryCondition(n2, 'Fix', p)
new BoundaryCondition(n3, 'Fix', p)
new BoundaryCondition(n4, 'Fix', p)

p.solve()
p.plot()
