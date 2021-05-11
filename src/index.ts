// import { plot, Plot } from 'nodeplotlib'
// const data: Plot[] = [{ x: [1, 3, 4, 5], y: [3, 12, 1, 4], text: ['a', 'b', 'c', 'd'], hoverinfo: 'text' }]
// plot(data)

import { Element } from './models/element'
import { Node } from './models/node'

const n1 = Node.get(0, 0)
const n2 = Node.get(1, 0)

const e = new Element('Frame', n1, n2, { E: 1, I: 1, A: 1 })
