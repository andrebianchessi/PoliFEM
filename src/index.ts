/* eslint-disable no-new */
import { Element } from './models/element'
import { Node } from './models/node'
import { Problem } from './models/problem'

const p = new Problem()

const n1 = Node.get(0, 0, p)
const n2 = Node.get(0, 3, p)
new Element('Frame', n1, n2, { E: 21 * 1000000000, I: 4.21875 / 100000, A: 0.0225 }, p)

p.build()
p.plot()
