import { create, all, Matrix } from 'mathjs'

const config = { }
const math = (create(all, config))!
export { math }

export function replaceRowAndColByZeros (m: Matrix, index:number) {
    m.subset!(math.index!(index, math.range!(0, m.size()[0])), math.zeros!(1, m.size()[0]))
    m.subset!(math.index!(math.range!(0, m.size()[0]), index), math.zeros!(m.size()[0], 1))
}
