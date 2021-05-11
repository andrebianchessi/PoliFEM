/* eslint-disable no-unused-vars */
/* eslint-disable no-new */
import { BoundaryCondition } from './models/boundaryCondition'
import { Element } from './models/element'
import { Load } from './models/load'
import { Node } from './models/node'
import { Problem } from './models/problem'

const p = new Problem()

const properties = { E: 21 * 1000000000, I: 4.21875 / 100000, A: 0.0225 }

const n1 = Node.get(0, 0, p)
const n2 = Node.get(0, 3, p)
const n3 = Node.get(0, 6, p)
const n4 = Node.get(3.2, 3, p)
const e1 = new Element('Frame', n1, n2, properties, p)
const e2 = new Element('Frame', n2, n3, properties, p)
const e3 = new Element('Frame', n2, n4, properties, p)
new Load(50, 0, 0, n2, p)
new BoundaryCondition(n1, 'Fix', p)
new BoundaryCondition(n3, 'Fix', p)
new BoundaryCondition(n4, 'Fix', p)

p.build()
p.plot()
