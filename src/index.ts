/* eslint-disable no-new */
// import { plot, Plot } from 'nodeplotlib'
// const data: Plot[] = [{ x: [1, 3, 4, 5], y: [3, 12, 1, 4], text: ['a', 'b', 'c', 'd'], hoverinfo: 'text' }]
// plot(data)

import { plotElements } from './functions/plot'
import { Element } from './models/element'
import { Node } from './models/node'
import { Problem } from './models/problem'

const p = new Problem()

const n1 = Node.get(0, 0, p)
const n2 = Node.get(0, 3, p)

new Element('Frame', n1, n2, { E: 21 * 1000000000, I: 4.21875 / 100000, A: 0.0225 }, p)
plotElements(p)
