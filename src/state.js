import SeedRandom from 'seedrandom'

import { Activations, RegularizationFunction } from './nn'
import {
  classifyCircleData,
  classifySpiralData,
  classifyTwoGaussData,
  classifyXORData,
  regressPlane,
  regressGaussian,
} from './dataset'

/** Suffix added to the state when storing if a control is hidden or not. */
const HIDE_STATE_SUFFIX = '_hide'

/** A map between names and activation functions. */
export const activations = {
  relu: Activations.RELU,
  tanh: Activations.TANH,
  sigmoid: Activations.SIGMOID,
  linear: Activations.LINEAR,
}

/** A map between names and regularization functions. */
export const regularizations = {
  none: null,
  ...RegularizationFunction,
}

/** A map between dataset names and functions that generate classification data. */
export const datasets = {
  circle: classifyCircleData,
  xor: classifyXORData,
  gauss: classifyTwoGaussData,
  spiral: classifySpiralData,
}

/** A map between dataset names and functions that generate regression data. */
export const regDatasets = {
  'reg-plane': regressPlane,
  'reg-gauss': regressGaussian,
}

export function getKeyFromValue(obj, value) {
  for (const key in obj) {
    if (obj[key] === value) {
      return key
    }
  }
  return undefined
}

function getHideProps(obj) {
  const result = [] // shape string[]
  for (const prop in obj) {
    if (prop.endsWith(HIDE_STATE_SUFFIX)) {
      result.push(prop)
    }
  }
  return result
}

/**
 * The data type of a state variable. Used for determining the
 * (de)serialization method.

export enum Type {
  STRING,
  NUMBER,
  ARRAY_NUMBER,
  ARRAY_STRING,
  BOOLEAN,
  OBJECT
}

export enum Problem {
  CLASSIFICATION,
  REGRESSION
}

export interface Property {
  name: string;
  type: Type;
  keyMap?: {[key: string]: any};
};

*/

// emulated enum Type
const Type = {
  STRING: 0,
  NUMBER: 1,
  ARRAY_NUMBER: 2,
  ARRAY_STRING: 3,
  BOOLEAN: 4,
  OBJECT: 5,
}
// emulated enum Problem
export const Problem = {
  CLASSIFICATION: 0,
  REGRESSION: 1,
}

export const problems = {
  classification: Problem.CLASSIFICATION,
  regression: Problem.REGRESSION,
}

// Add the GUI state.
export class State {

  static PROPS = [
    {name: 'activation', type: Type.OBJECT, keyMap: activations},
    {name: 'regularization', type: Type.OBJECT, keyMap: regularizations},
    {name: 'batchSize', type: Type.NUMBER},
    {name: 'dataset', type: Type.OBJECT, keyMap: datasets},
    {name: 'regDataset', type: Type.OBJECT, keyMap: regDatasets},
    {name: 'learningRate', type: Type.NUMBER},
    {name: 'regularizationRate', type: Type.NUMBER},
    {name: 'noise', type: Type.NUMBER},
    {name: 'networkShape', type: Type.ARRAY_NUMBER},
    {name: 'seed', type: Type.STRING},
    {name: 'showTestData', type: Type.BOOLEAN},
    {name: 'discretize', type: Type.BOOLEAN},
    {name: 'percTrainData', type: Type.NUMBER},
    {name: 'x', type: Type.BOOLEAN},
    {name: 'y', type: Type.BOOLEAN},
    {name: 'xTimesY', type: Type.BOOLEAN},
    {name: 'xSquared', type: Type.BOOLEAN},
    {name: 'ySquared', type: Type.BOOLEAN},
    {name: 'cosX', type: Type.BOOLEAN},
    {name: 'sinX', type: Type.BOOLEAN},
    {name: 'cosY', type: Type.BOOLEAN},
    {name: 'sinY', type: Type.BOOLEAN},
    {name: 'collectStats', type: Type.BOOLEAN},
    {name: 'tutorial', type: Type.STRING},
    {name: 'problem', type: Type.OBJECT, keyMap: problems},
    {name: 'initZero', type: Type.BOOLEAN},
    {name: 'hideText', type: Type.BOOLEAN},
  ]

  [key] // shape [key: string]
  learningRate = 0.03
  regularizationRate = 0
  showTestData = false
  noise = 0
  batchSize = 10
  discretize = false
  tutorial = null // shape string
  percTrainData = 50;
  activation = Activations.TANH
  regularization = null // shape RegularizationFunction
  problem = Problem.CLASSIFICATION
  initZero = false
  hideText = false
  collectStats = false
  numHiddenLayers = 1
  hiddenLayerControls = [] // shape any[]
  networkShape = [4, 2] // number[]
  x = true
  y = true
  xTimesY = false
  xSquared = false
  ySquared = false
  cosX = false
  sinX = false
  cosY = false
  sinY = false
  dataset = classifyCircleData // shape dataset.DataGenerator
  regDataset = regressPlane // shape dataset.DataGenerator
  seed // shape string // TODO: make dataset seed configurable

  /**
   * Deserializes the state from the url hash.
   */
  static deserializeState() {
    const map = {} // shape {[key: string]: string}
    for (let keyvalue of window.location.hash.slice(1).split('&')) {
      let [name, value] = keyvalue.split('=')
      map[name] = value
    }
    const state = new State()

    const hasKey = (name) => name in map && map[name] != null && map[name].trim() !== ''
    const parseArray = (value) => value.trim() === "" ? [] : value.split(',')

    // Deserialize regular properties.
    State.PROPS.forEach(({ name, type, keyMap }) => {
      switch (type) {
        case Type.OBJECT:
          if (keyMap == null) {
            throw Error('A key-value map must be provided for state variables of type Object')
          }
          if (hasKey(name) && map[name] in keyMap) {
            state[name] = keyMap[map[name]]
          }
          break
        case Type.NUMBER:
          if (hasKey(name)) {
            // The + operator is for converting a string to a number.
            state[name] = +map[name]
          }
          break
        case Type.STRING:
          if (hasKey(name)) {
            state[name] = map[name]
          }
          break
        case Type.BOOLEAN:
          if (hasKey(name)) {
            state[name] = map[name] !== 'false'
          }
          break
        case Type.ARRAY_NUMBER:
          if (name in map) {
            state[name] = parseArray(map[name]).map(Number)
          }
          break
        case Type.ARRAY_STRING:
          if (name in map) {
            state[name] = parseArray(map[name])
          }
          break
        default:
          throw Error('Encountered an unknown type for a state variable')
      }
    });

    // Deserialize state properties that correspond to hiding UI controls.
    getHideProps(map).forEach(prop => {
      state[prop] = map[prop] === 'true'
    })
    state.numHiddenLayers = state.networkShape.length
    if (state.seed == null) {
      state.seed = Math.random().toFixed(5)
    }
    SeedRandom(state.seed)
    return state
  }

  /**
   * Serializes the state into the url hash.
   */
  serialize() {
    // Serialize regular properties.
    const props = [] // shape string[]
    State.PROPS.forEach(({ name, type, keyMap }) => {
      let value = this[name]
      // Don't serialize missing values.
      if (value == null) {
        return
      }
      if (type === Type.OBJECT) {
        value = getKeyFromValue(keyMap, value)
      } else if (type === Type.ARRAY_NUMBER ||
          type === Type.ARRAY_STRING) {
        value = value.join(',')
      }
      props.push(`${name}=${value}`)
    })
    // Serialize properties that correspond to hiding UI controls.
    getHideProps(this).forEach(prop => {
      props.push(`${prop}=${this[prop]}`)
    })
    window.location.hash = props.join('&')
  }

  /** Returns all the hidden properties. */
  getHiddenProps() {
    const result = [] // shape string[]
    for (const prop in this) {
      if (prop.endsWith(HIDE_STATE_SUFFIX) && this[prop] === true) {
        result.push(prop.replace(HIDE_STATE_SUFFIX, ""))
      }
    }
    return result
  }

  setHideProperty(name, hidden) {
    this[name + HIDE_STATE_SUFFIX] = hidden
  }
}
