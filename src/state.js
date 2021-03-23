import create from 'zustand'
import cloneDeep from 'lodash.clonedeep'

import { forwardProp, backProp, updateWeights, Errors } from './lib/nn'
import {
  Problems,
  constructInput,
  getLoss,
  generateData,
  reset,
 } from './utils'

// TODO: handle hidden props
// const HIDE_STATE_SUFFIX = '_hide'

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
  activation: 'TANH',
  setActivation: (activation) => set({ activation }),
  regularization: 'None',
  setRegularization: (regularization) => set({ regularization }),
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
  // playground
  isPlaying: false,
  togglePlaying: () => set((prev) => ({ isPlaying: !prev.isPlaying })),
  trainData: [],
  testData: [],
  iter: 0,
  network: [],
  lossTrain: 0,
  lossTest: 0,
  oneStep: () => set((prev) => {
    const network = cloneDeep(prev.network)
    prev.trainData.forEach((point, i) => {
      const input = constructInput(prev.inputs, point.x, point.y)
      forwardProp(network, input)
      backProp(network, point.label, Errors.SQUARE)
      if ((i + 1) % prev.batchSize === 0) {
        updateWeights(network, prev.learningRate, prev.regularizationRate)
      }
    })
    return {
      iter: prev.iter + 1,
      network,
      lossTrain: getLoss(prev.inputs, network, prev.trainData),
      lossTest: getLoss(prev.inputs, network, prev.testData),
    }
  }),
  resetNetwork: () => set(({ problem, dataset, regDataset, noise, percTrainData, inputs, activation, regularization, initZero }) => {
    const { trainData, testData } = generateData({ problem, dataset, regDataset, noise, percTrainData })
    const { iter, network, lossTrain, lossTest } = reset({ inputs, trainData, testData, problem, activation, regularization, initZero })
    return {
      trainData,
      testData,
      isPlaying: false,
      iter,
      network,
      lossTrain,
      lossTest,
    }
  }),
}))
