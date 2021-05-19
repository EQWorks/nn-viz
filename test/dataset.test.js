import {
  shuffle,
  classifyTwoGaussData,
  regressPlane,
  regressGaussian,
  classifySpiralData,
  classifyCircleData,
  classifyXORData,
} from '../src/lib/dataset'

// TODO: expectation based on hardcoded 'nn-viz' random seed
const numSamples = 2
const noise = 0.5

test('shuffle(array)', () => {
  const array = [1, 2, 3]
  shuffle(array)
  expect(array).toStrictEqual([2, 1, 3])
})

test('classifyTwoGaussData(numSamples, noise)', () => {
  const exp =     [
    { x: 1.9960009885808625, y: 3.9881051282925606, label: 1 },
    { x: 2.2549400960168056, y: -4.28879042427983, label: -1 },
  ]
  expect(classifyTwoGaussData(numSamples, noise)).toStrictEqual(exp)
})

test('regressPlane(numSamples, noise)', () => {
  expect(regressPlane(numSamples, noise)).toStrictEqual([
    {
      x: 5.0086727158467905,
      y: -5.970540173005118,
      label: 0.23776444556282428,
    },
    {
      x: -0.4700300503253141,
      y: -2.7847625624016223,
      label: -0.26467332257690246,
    },
  ])
})

test('regressGaussian(numSamples, noise)', () => {
  expect(regressGaussian(numSamples, noise)).toStrictEqual([
    { x: -5.963086668300668, y: 0.3451980758284199, label: 0 },
    { x: 5.77457132508057, y: -0.37052516319948303, label: 0 },
  ])
})

test('classifySpiralData(numSamples, noise)', () => {
  expect(classifySpiralData(numSamples, noise)).toStrictEqual([
    { x: -0.18370786092897712, y: -0.3916558486055387, label: 1 },
    { x: -0.25997877315477014, y: -0.2684027760665676, label: -1 },
  ])
})

test('classifyCircleData(numSamples, noise)', () => {
  expect(classifyCircleData(numSamples, noise)).toStrictEqual([
    { x: -1.5119230983794347, y: -0.8845877993607065, label: 1 },
    { x: -3.352986683515431, y: 2.084583920851261, label: -1 },
  ])
})

test('classifyXORData(numSamples, noise)', () => {
  expect(classifyXORData(numSamples, noise)).toStrictEqual([
    { x: -3.326027273672307, y: 0.8403857409682971, label: -1 },
    { x: -3.871020511225424, y: 2.022701728561234, label: -1 },
  ])
})
