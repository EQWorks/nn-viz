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
  hiddenLayerControls: [],
  networkShape: [4, 2],
  // TODO: randomize neurons?
  addHiddenLayer: (neurons = 2) => set((prev) => {
    if (prev.networkShape.length >= 6) {
      return
    }
    return { networkShape: [...prev.networkShape, neurons] }
  }),
  removeHiddenLayer: () => set((prev) => {
    if (prev.networkShape.length <= 0) {
      return
    }
    const networkShape = [...prev.networkShape]
    networkShape.pop()
    return { networkShape }
  }),
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
  oneStep: () => set((state) => {
    const network = cloneDeep(state.network)
    state.trainData.forEach((point, i) => {
      const input = constructInput(state.inputs, point.x, point.y)
      forwardProp(network, input)
      backProp(network, point.label, Errors.SQUARE)
      if ((i + 1) % state.batchSize === 0) {
        updateWeights(network, state.learningRate, state.regularizationRate)
      }
    })
    return {
      iter: state.iter + 1,
      network,
      lossTrain: getLoss(state.inputs, network, state.trainData),
      lossTest: getLoss(state.inputs, network, state.testData),
    }
  }),
  resetNetwork: () => set((state) => {
    const { trainData, testData } = generateData(state)
    const { iter, network, lossTrain, lossTest } = reset({ ...state, trainData, testData })
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
