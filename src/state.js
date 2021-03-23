import create from 'zustand'

import { Activations, Regularizations } from './lib/nn'
import {
  classifyCircleData,
  classifySpiralData,
  classifyTwoGaussData,
  classifyXORData,
  regressPlane,
  regressGaussian,
} from './lib/dataset'

// TODO: handle hidden props
// const HIDE_STATE_SUFFIX = '_hide'

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

export const useStore = create((set) => ({
  // TODO: random seed
  learningRate: 0.03,
  setLearningRate: (v) => set({ learningRate: parseFloat(v) }),
  regularizationRate: 0,
  setRegularizationRate: (v) => set({ regularizationRate: parseFloat(v) }),
  showTestData: false,
  noise: 0,
  setNoise: (v) => set({ noise: parseInt(v, 10) }),
  batchSize: 10,
  setBatchSize: (v) => set({ batchSize: parseInt(v, 10) }),
  discretize: false,
  tutorial: null,
  percTrainData: 50,
  setPercTrainData: (v) => set({ percTrainData: parseInt(v, 10) }),
  activation: Activations.TANH,
  setActivation: (a) => set({ activation: Activations[a] || Activations.TANH }),
  regularization: Regularizations.None,
  setRegularization: (r) => set({ regularization: Regularizations[r] || Regularizations.None }),
  problem: Problems.CLASSIFICATION,
  setProblem: (p) => set({ problem: Problems[p] || Problems.CLASSIFICATION }),
  initZero: false,
  hideText: false,
  collectStats: false,
  numHiddenLayers: 1,
  hiddenLayerControls: [],
  networkShape: [4, 2],
  // feature inputs
  inputs: {
    x: true,
    y: true,
    xTimesY: false,
    xSquared: false,
    ySquared: false,
    cosX: false,
    sinX: false,
    cosY: false,
    sinY: false,
  },
  setInputs: (k, v) => set((prev) => ({ inputs: { ...prev.inputs, [k]: v } })),
  dataset: 'circle',
  setDataset: (dataset) => set({ dataset }),
  regDataset: 'plane',
  setRegDataset: (regDataset) => set({ regDataset }),
}))
