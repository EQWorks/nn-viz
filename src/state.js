import create from 'zustand'

import { Activations, Regularizations } from './lib/nn'
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

// emulated enum Problem
export const Problems = {
  CLASSIFICATION: 'CLASSIFICATION',
  REGRESSION: 'REGRESSION',
}

export const useStore = create((set) => ({
  // TODO: random seed
  learningRate: 0.03,
  setLearningRate: (v) => set({ learningRate: parseFloat(v) }),
  regularizationRate: 0,
  setRegularizationRate: (v) => set({ regularizationRate: parseFloat(v) }),
  showTestData: false,
  noise: 0,
  batchSize: 10,
  discretize: false,
  tutorial: null,
  percTrainData: 50,
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
  dataset: classifyCircleData,
  regDataset: regressPlane,
}))
