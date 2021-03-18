import { scaleLinear } from 'd3-scale'
import SeedRandom from 'seedrandom'

/*
// reference types from original dataset.ts

export type Example2D = {
  x: number,
  y: number,
  label: number
};

type Point = {
  x: number,
  y: number
};

export type DataGenerator = (numSamples: number, noise: number) => Example2D[];
*/

// TODO: make this configurable
const rng = new SeedRandom('nn-viz')

function normalRandom(mean = 0, variance = 1) {
  let v1, v2, s
  do {
    v1 = 2 * rng() - 1
    v2 = 2 * rng() - 1
    s = v1 * v1 + v2 * v2
  } while (s > 1)

  const result = Math.sqrt(-2 * Math.log(s) / s) * v1
  return mean + Math.sqrt(variance) * result
}

function randUniform(a, b) {
  return rng() * (b - a) + a;
}

function dist(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function shuffle(array) {
  let counter = array.length
  let temp = 0
  let index = 0
  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    index = Math.floor(rng() * counter)
    // Decrease counter by 1
    counter--
    // And swap the last element with it
    temp = array[counter]
    array[counter] = array[index]
    array[index] = temp
  }
}

export function classifyTwoGaussData(numSamples, noise) {
  const points = [] // shape Example2D[]
  const varianceScale = scaleLinear().domain([0, .5]).range([0.5, 4])
  const variance = varianceScale(noise)

  function genGauss(cx, cy, label) {
    for (let i = 0; i < numSamples / 2; i++) {
      let x = normalRandom(cx, variance)
      let y = normalRandom(cy, variance)
      points.push({x, y, label})
    }
  }

  genGauss(2, 2, 1) // Gaussian with positive examples.
  genGauss(-2, -2, -1) // Gaussian with negative examples.
  return points
}

export function regressPlane(numSamples, noise) {
  const points = [] // shape Example2D[]
  const radius = 6
  const labelScale = scaleLinear().domain([-10, 10]).range([-1, 1])
  const getLabel = (x, y) => labelScale(x + y)

  for (let i = 0; i < numSamples; i++) {
    const x = randUniform(-radius, radius)
    const y = randUniform(-radius, radius)
    const noiseX = randUniform(-radius, radius) * noise
    const noiseY = randUniform(-radius, radius) * noise
    const label = getLabel(x + noiseX, y + noiseY)

    points.push({ x, y, label })
  }
  return points
}

export function regressGaussian(numSamples, noise) {
  const points = [] // shape Example2D[]
  const radius = 6
  const labelScale = scaleLinear().domain([0, 2]).range([1, 0]).clamp(true)
  const gaussians = [
    [-4, 2.5, 1],
    [0, 2.5, -1],
    [4, 2.5, 1],
    [-4, -2.5, -1],
    [0, -2.5, 1],
    [4, -2.5, -1],
  ]

  function getLabel(x, y) {
    // Choose the one that is maximum in abs value.
    let label = 0
    gaussians.forEach(([cx, cy, sign]) => {
      const newLabel = sign * labelScale(dist({ x, y }, { x: cx, y: cy }))
      if (Math.abs(newLabel) > Math.abs(label)) {
        label = newLabel
      }
    })
    return label
  }
  for (let i = 0; i < numSamples; i++) {
    const x = randUniform(-radius, radius)
    const y = randUniform(-radius, radius)
    const noiseX = randUniform(-radius, radius) * noise
    const noiseY = randUniform(-radius, radius) * noise
    const label = getLabel(x + noiseX, y + noiseY)
    points.push({ x, y, label })
  }
  return points
}

export function classifySpiralData(numSamples, noise) {
  const points = [] // shape Example2D[]
  const n = numSamples / 2

  function genSpiral(deltaT, label) {
    for (let i = 0; i < n; i++) {
      const r = i / n * 5
      const t = 1.75 * i / n * 2 * Math.PI + deltaT
      const x = r * Math.sin(t) + randUniform(-1, 1) * noise
      const y = r * Math.cos(t) + randUniform(-1, 1) * noise
      points.push({ x, y, label })
    }
  }

  genSpiral(0, 1) // Positive examples.
  genSpiral(Math.PI, -1) // Negative examples.
  return points
}

export function classifyCircleData(numSamples, noise) {
  const points = [] // shape Example2D[]
  const radius = 5

  const getCircleLabel = (p, center) => (dist(p, center) < (radius * 0.5)) ? 1 : -1

  // Generate positive points inside the circle.
  for (let i = 0; i < numSamples / 2; i++) {
    const r = randUniform(0, radius * 0.5)
    const angle = randUniform(0, 2 * Math.PI)
    const x = r * Math.sin(angle)
    const y = r * Math.cos(angle)
    const noiseX = randUniform(-radius, radius) * noise
    const noiseY = randUniform(-radius, radius) * noise
    const label = getCircleLabel({ x: x + noiseX, y: y + noiseY }, { x: 0, y: 0 })
    points.push({ x, y, label })
  }

  // Generate negative points outside the circle.
  for (let i = 0; i < numSamples / 2; i++) {
    const r = randUniform(radius * 0.7, radius)
    const angle = randUniform(0, 2 * Math.PI)
    const x = r * Math.sin(angle)
    const y = r * Math.cos(angle)
    const noiseX = randUniform(-radius, radius) * noise
    const noiseY = randUniform(-radius, radius) * noise
    const label = getCircleLabel( {x: x + noiseX, y: y + noiseY }, { x: 0, y: 0 })
    points.push({ x, y, label })
  }
  return points
}

const getXORLabel = (p) => p.x * p.y >= 0 ? 1 : -1

export function classifyXORData(numSamples, noise) {
  const points = [] // shape Example2D[]

  for (let i = 0; i < numSamples; i++) {
    let x = randUniform(-5, 5)
    const padding = 0.3
    x += x > 0 ? padding : -padding  // Padding.
    let y = randUniform(-5, 5)
    y += y > 0 ? padding : -padding
    const noiseX = randUniform(-5, 5) * noise
    const noiseY = randUniform(-5, 5) * noise
    const label = getXORLabel({ x: x + noiseX, y: y + noiseY })
    points.push({ x, y, label })
  }

  return points
}
