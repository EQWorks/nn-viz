import {
  classifyCircleData,
  classifySpiralData,
  classifyTwoGaussData,
  classifyXORData,
  regressPlane,
  regressGaussian,
  shuffle,
} from './lib/dataset'
import { Activations, buildNetwork, forwardProp, Errors, Regularizations } from './lib/nn'

// TODO: make configurable
export const RECT_SIZE = 30
export const BIAS_SIZE = 5
export const NUM_SAMPLES_CLASSIFY = 500
export const NUM_SAMPLES_REGRESS = 1200
export const DENSITY = 100

export const INPUTS = {
  x: { f: (x) => x, label: 'X_1' },
  y: { f: (_, y) => y, label: 'X_2' },
  xSquared: { f: (x) => x * x, label: 'X_1^2' },
  ySquared: { f: (_, y) => y * y,  label: 'X_2^2' },
  xTimesY: { f: (x, y) => x * y, label: 'X_1X_2' },
  sinX: { f: (x) => Math.sin(x), label: 'sin(X_1)' },
  sinY: { f: (_, y) => Math.sin(y), label: 'sin(X_2)' },
}

// emulated enum Problem
export const Problems = {
  CLASSIFICATION: 'CLASSIFICATION',
  REGRESSION: 'REGRESSION',
}

/** A map between dataset names and functions that generate classification data. */
export const Datasets = {
  circle: classifyCircleData,
  xor: classifyXORData,
  gauss: classifyTwoGaussData,
  spiral: classifySpiralData,
}

/** A map between dataset names and functions that generate regression data. */
export const RegDatasets = {
  plane: regressPlane,
  gauss: regressGaussian,
}

export function constructInput(inputs, x, y) {
  const input = []
  for (const inputName in INPUTS) {
    if (inputs[inputName]) {
      input.push(INPUTS[inputName].f(x, y))
    }
  }
  return input
}

export function constructInputIds(inputs) {
  const result = []
  for (const inputName in INPUTS) {
    if (inputs[inputName]) {
      result.push(inputName)
    }
  }
  return result
}

export function getLoss(inputs, network, dataPoints) {
  let loss = 0
  for (let i = 0; i < dataPoints.length; i++) {
    const dataPoint = dataPoints[i]
    const input = constructInput(inputs, dataPoint.x, dataPoint.y)
    const output = forwardProp(network, input)
    loss += Errors.SQUARE.error(output, dataPoint.label)
  }
  return loss / dataPoints.length;
}

export function generateData({ problem, dataset, regDataset, noise, percTrainData }) {
  // Math.seedrandom(state.seed);
  const numSamples = (problem === Problems.REGRESSION) ? NUM_SAMPLES_REGRESS : NUM_SAMPLES_CLASSIFY
  const generator = problem === Problems.CLASSIFICATION
    ? (Datasets[dataset] || Datasets.circle)
    : RegDatasets[regDataset] || RegDatasets.plane
  const data = generator(numSamples, noise / 100)
  // Shuffle the data in-place.
  shuffle(data)
  // Split into train and test data.
  const splitIndex = Math.floor(data.length * percTrainData / 100)
  const trainData = data.slice(0, splitIndex)
  const testData = data.slice(splitIndex)
  return { trainData, testData }
  // heatMap.updatePoints(trainData)
  // heatMap.updateTestPoints(state.showTestData ? testData : [])
}

export function reset({ inputs, trainData, testData, networkShape, problem, activation, regularization, initZero }) {
  // lineChart.reset();
  // player.pause();

  // let suffix = state.numHiddenLayers !== 1 ? "s" : "";
  // d3.select("#layers-label").text("Hidden layer" + suffix);
  // d3.select("#num-layers").text(state.numHiddenLayers);

  // Make a simple network.
  const numInputs = constructInput(inputs, 0, 0).length;
  const shape = [numInputs].concat(networkShape).concat([1]);
  const outputActivation = (problem === Problems.REGRESSION) ? Activations.LINEAR : Activations.TANH
  const network = buildNetwork(
    shape,
    Activations[activation],
    outputActivation,
    Regularizations[regularization],
    constructInputIds(inputs),
    initZero,
  )
  const lossTrain = getLoss(inputs, network, trainData)
  const lossTest = getLoss(inputs, network, testData)
  // drawNetwork(network);
  // updateUI(true);
  return { iter: 0, network, lossTrain, lossTest }
}
