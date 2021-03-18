import create from 'zustand'

// import { Activations, RegularizationFunction } from './lib/nn'
import {
  classifyCircleData,
  // classifySpiralData,
  // classifyTwoGaussData,
  // classifyXORData,
  regressPlane,
  // regressGaussian,
} from './lib/dataset'

// TODO: handle hidden props
// const HIDE_STATE_SUFFIX = '_hide'

export const useStore = create((set) => ({
  learningRate: 0.03,
  regularizationRate: 0,
  showTestData: false,
  noise: 0,
  batchSize: 10,
  discretize: false,
  tutorial: null,
  percTrainData: 50,
  activation: nn.Activations.TANH,
  regularization: null,
  problem: Problem.CLASSIFICATION,
  initZero: false,
  hideText: false,
  collectStats: false,
  numHiddenLayers: 1,
  hiddenLayerControls: [],
  networkShape: [4, 2],
  x: true,
  y: true,
  xTimesY: false,
  xSquared: false,
  ySquared: false,
  cosX: false,
  sinX: false,
  cosY: false,
  sinY: false,
  dataset: classifyCircleData,
  regDataset: regressPlane,
}))
