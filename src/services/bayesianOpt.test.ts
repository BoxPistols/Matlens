import { describe, it, expect } from 'vitest'
import {
  rbfKernel,
  fitGP,
  predictGP,
  expectedImprovement,
  suggestNext,
  normalize,
  denormalize,
  DEFAULT_HYPER,
} from './bayesianOpt'

describe('rbfKernel', () => {
  it('同じ点では variance に等しい', () => {
    expect(rbfKernel(1.0, 1.0, DEFAULT_HYPER)).toBe(DEFAULT_HYPER.variance)
  })

  it('離れた点ほど値が小さくなる', () => {
    const near = rbfKernel(0, 0.5, DEFAULT_HYPER)
    const far = rbfKernel(0, 3.0, DEFAULT_HYPER)
    expect(near).toBeGreaterThan(far)
  })

  it('対称性: k(x1,x2) = k(x2,x1)', () => {
    expect(rbfKernel(0.3, 1.2, DEFAULT_HYPER)).toBeCloseTo(rbfKernel(1.2, 0.3, DEFAULT_HYPER))
  })
})

describe('fitGP + predictGP', () => {
  it('訓練点での予測は訓練値に近い (ノイズ項以内)', () => {
    const xs = [0, 1, 2, 3, 4]
    const ys = [0, 2, 1, 3, 2]
    const model = fitGP(xs, ys)
    for (let i = 0; i < xs.length; i++) {
      const pred = predictGP(model, xs[i]!)
      // ノイズ項 (0.05) 程度の誤差を許容
      expect(pred.mean).toBeCloseTo(ys[i]!, 0)
    }
  })

  it('訓練点での分散は小さい (データが観測済みなので)', () => {
    const xs = [0, 1, 2]
    const ys = [1, 2, 1.5]
    const model = fitGP(xs, ys)
    const pred = predictGP(model, 1)
    // 観測ノイズ程度の不確実性
    expect(pred.std).toBeLessThan(0.3)
  })

  it('訓練点から遠い点では分散が大きい', () => {
    const xs = [0, 1, 2]
    const ys = [1, 2, 1.5]
    const model = fitGP(xs, ys)
    const predNear = predictGP(model, 1.5)
    const predFar  = predictGP(model, 10)
    expect(predFar.std).toBeGreaterThan(predNear.std)
  })

  it('空データで fitGP は throw', () => {
    expect(() => fitGP([], [])).toThrow()
  })

  it('xs/ys の長さ不一致で throw', () => {
    expect(() => fitGP([1, 2, 3], [1, 2])).toThrow()
  })
})

describe('expectedImprovement', () => {
  it('std=0 なら EI=0 (改善の期待なし)', () => {
    const ei = expectedImprovement({ mean: 1, std: 0 }, 0)
    expect(ei).toBe(0)
  })

  it('mean > yBest かつ std>0 なら EI > 0', () => {
    const ei = expectedImprovement({ mean: 2, std: 0.5 }, 1)
    expect(ei).toBeGreaterThan(0)
  })

  it('同じ平均/std で yBest が小さいほど EI は大きい', () => {
    const pred = { mean: 2, std: 0.5 }
    const eiLow  = expectedImprovement(pred, 0)
    const eiHigh = expectedImprovement(pred, 1.5)
    expect(eiLow).toBeGreaterThan(eiHigh)
  })
})

describe('suggestNext', () => {
  it('提案点が探索範囲内', () => {
    const xs = [0, 2, 4]
    const ys = [1, 3, 2]
    const model = fitGP(xs, ys)
    const { best } = suggestNext(model, 0, 5, 50)
    expect(best.x).toBeGreaterThanOrEqual(0)
    expect(best.x).toBeLessThanOrEqual(5)
  })

  it('グリッド点数が正しい', () => {
    const xs = [0, 1]
    const ys = [0, 1]
    const model = fitGP(xs, ys)
    const { grid } = suggestNext(model, 0, 1, 25)
    expect(grid).toHaveLength(25)
  })

  it('全グリッド点の EI が非負', () => {
    const xs = [0, 1, 2]
    const ys = [0, 2, 1]
    const model = fitGP(xs, ys)
    const { grid } = suggestNext(model, -1, 3)
    for (const point of grid) {
      expect(point.ei).toBeGreaterThanOrEqual(0)
    }
  })

  it('nGrid < 2 で throw', () => {
    const model = fitGP([0, 1], [0, 1])
    expect(() => suggestNext(model, 0, 1, 1)).toThrow()
  })
})

describe('normalize / denormalize', () => {
  it('min-max 正規化で [0, 1] 区間になる', () => {
    const { normalized, min, max } = normalize([10, 20, 30, 40, 50])
    expect(min).toBe(10)
    expect(max).toBe(50)
    expect(normalized[0]).toBe(0)
    expect(normalized[4]).toBe(1)
    expect(normalized[2]).toBe(0.5)
  })

  it('全要素同値 → 0.5 で埋める', () => {
    const { normalized } = normalize([5, 5, 5])
    expect(normalized).toEqual([0.5, 0.5, 0.5])
  })

  it('空配列 → 空配列', () => {
    const { normalized } = normalize([])
    expect(normalized).toEqual([])
  })

  it('denormalize は normalize の逆', () => {
    const { normalized, min, max } = normalize([10, 20, 30])
    expect(denormalize(normalized[0]!, min, max)).toBe(10)
    expect(denormalize(normalized[2]!, min, max)).toBe(30)
  })
})
