import { useEffect, useState } from 'react'

import { shuffle } from './lib/dataset'
import { Activations, buildNetwork, forwardProp, Errors } from './lib/nn'
import { useStore, Problem } from './state'

const RECT_SIZE = 30
const BIAS_SIZE = 5
const NUM_SAMPLES_CLASSIFY = 500
const NUM_SAMPLES_REGRESS = 1200
const DENSITY = 100

const INPUTS = {
  x: { f: (x) => x, label: 'X_1' },
  y: { f: (_, y) => y, label: 'X_2' },
  xSquared: { f: (x) => x * x, label: 'X_1^2' },
  ySquared: { f: (_, y) => y * y,  label: 'X_2^2' },
  xTimesY: { f: (x, y) => x * y, label: 'X_1X_2' },
  sinX: { f: (x) => Math.sin(x), label: 'sin(X_1)' },
  sinY: { f: (_, y) => Math.sin(y), label: 'sin(X_2)' },
}

function constructInput(x, y) {
  const inputs = useStore.getState().inputs
  const input = []
  for (const inputName in INPUTS) {
    if (inputs[inputName]) {
      input.push(INPUTS[inputName].f(x, y))
    }
  }
  return input
}

function constructInputIds() {
  const inputs = useStore.getState().inputs
  const result = []
  for (const inputName in INPUTS) {
    if (inputs[inputName]) {
      result.push(inputName)
    }
  }
  return result
}

function getLoss(network, dataPoints) {
  let loss = 0
  for (let i = 0; i < dataPoints.length; i++) {
    const dataPoint = dataPoints[i]
    const input = constructInput(dataPoint.x, dataPoint.y)
    const output = forwardProp(network, input)
    loss += Errors.SQUARE.error(output, dataPoint.label)
  }
  return loss / dataPoints.length;
}

function generateData({ problem, dataset, regDataset, noise, percTrainData }) {
  // Math.seedrandom(state.seed);
  const numSamples = (problem === Problem.REGRESSION) ? NUM_SAMPLES_REGRESS : NUM_SAMPLES_CLASSIFY
  const generator = problem === Problem.CLASSIFICATION ? dataset : regDataset
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

function reset({ trainData, testData, networkShape, problem, activation, regularization, initZero }) {
  // lineChart.reset();
  // player.pause();

  // let suffix = state.numHiddenLayers !== 1 ? "s" : "";
  // d3.select("#layers-label").text("Hidden layer" + suffix);
  // d3.select("#num-layers").text(state.numHiddenLayers);

  // Make a simple network.
  const numInputs = constructInput(0, 0).length;
  const shape = [numInputs].concat(networkShape).concat([1]);
  const outputActivation = (problem === Problem.REGRESSION) ? Activations.LINEAR : Activations.TANH
  const network = buildNetwork(shape, activation, outputActivation, regularization, constructInputIds(), initZero)
  const lossTrain = getLoss(network, trainData)
  const lossTest = getLoss(network, testData)
  // drawNetwork(network);
  // updateUI(true);
  return { iter: 0, network, lossTrain, lossTest }
};

const Playground = () => {
  const [trainData, setTrainData] = useState([])
  const [testData, setTestData] = useState([])

  const [iter, setIter] = useState(0)
  const [network, setNetwork] = useState([])
  const [lossTrain, setLossTrain] = useState(0)
  const [lossTest, setLossTest] = useState(0)

  // from global store
  const problem = useStore(state => state.problem)
  const dataset = useStore(state => state.dataset)
  const regDataset = useStore(state => state.regDataset)
  const noise = useStore(state => state.noise)
  const percTrainData = useStore(state => state.percTrainData)
  const networkShape = useStore(state => state.networkShape)
  const activation = useStore(state => state.activation)
  const regularization = useStore(state => state.regularization)
  const initZero = useStore(state => state.initZero)
  const inputs = useStore(state => state.inputs)
  const setInputs = useStore(state => state.setInputs)

  useEffect(() => {
    const { trainData, testData } = generateData({ problem, dataset, regDataset, noise, percTrainData })
    setTrainData(trainData)
    setTestData(testData)
    const { iter, network, lossTrain, lossTest } = reset({ trainData, testData, problem, activation, regularization, initZero })
    setIter(iter)
    setNetwork(network)
    setLossTrain(lossTrain)
    setLossTest(lossTest)
  }, [problem, dataset, regDataset, noise, percTrainData, activation, regularization, initZero])

  return (
    <>
      {/* controls */}
      <div>
        <div>
          {/* timeline controls */}
          <button>Reset</button>
          <button>Play/Pause</button>
          <button>Skip next</button>
        </div>
        <div>
          {/* iter number */}
        </div>
        <div>
          {/* learning rate */}
          <label for="learningRate">Learning rate</label>
          <select id="learningRate">
            <option value="0.00001">0.00001</option>
            <option value="0.0001">0.0001</option>
            <option value="0.001">0.001</option>
            <option value="0.003">0.003</option>
            <option value="0.01">0.01</option>
            <option value="0.03">0.03</option>
            <option value="0.1">0.1</option>
            <option value="0.3">0.3</option>
            <option value="1">1</option>
            <option value="3">3</option>
            <option value="10">10</option>
          </select>
        </div>
        <div>
          {/* activation */}
          <label for="activations">Activation</label>
          <select id="activations">
            <option value="relu">ReLU</option>
            <option value="tanh">Tanh</option>
            <option value="sigmoid">Sigmoid</option>
            <option value="linear">Linear</option>
          </select>
        </div>
        <div>
          {/* regularization */}
          <label for="regularizations">Regularization</label>
          <select id="regularizations">
            <option value="none">None</option>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
          </select>
        </div>
        <div>
          {/* regularization rate */}
          <label for="regularRate">Regularization rate</label>
          <select id="regularRate">
            <option value="0">0</option>
            <option value="0.001">0.001</option>
            <option value="0.003">0.003</option>
            <option value="0.01">0.01</option>
            <option value="0.03">0.03</option>
            <option value="0.1">0.1</option>
            <option value="0.3">0.3</option>
            <option value="1">1</option>
            <option value="3">3</option>
            <option value="10">10</option>
          </select>
        </div>
        <div>
          {/* problem type */}
          <label for="problem">Problem type</label>
          <select id="problem">
            <option value="classification">Classification</option>
            <option value="regression">Regression</option>
          </select>
        </div>
      </div>
      {/* visualization */}
      <div id="main-part" class="l--page">
        <div class="column data">
          <h4>Data</h4>
          <div class="ui-dataset">
            <label for="data-type">Which dataset do you want to use?</label>
            <select id="data-type">
              {/* conditional depending on problem type */}
              <option value="circle">circle</option>
              <option value="xor">xor</option>
              <option value="gauss">gauss</option>
              <option value="spiral">spiral</option>
              {/* only shown when problem type is regression */}
              <option value="reg-plane">reg-plane</option>
              <option value="reg-gauss">reg-gauss</option>
            </select>
          </div>
          <div>
            <div class="ui-percTrainData">
              <label for="percTrainData">Ratio of training to test data:&nbsp;&nbsp;<span class="value">XX</span>%</label>
              <p class="slider">
                <input class="mdl-slider mdl-js-slider" type="range" id="percTrainData" min="10" max="90" step="10" />
              </p>
            </div>
            <div class="ui-noise">
              <label for="noise">Noise:&nbsp;&nbsp;<span class="value">XX</span></label>
              <p class="slider">
                <input class="mdl-slider mdl-js-slider" type="range" id="noise" min="0" max="50" step="5" />
              </p>
            </div>
            <div class="ui-batchSize">
              <label for="batchSize">Batch size:&nbsp;&nbsp;<span class="value">XX</span></label>
              <p class="slider">
                <input class="mdl-slider mdl-js-slider" type="range" id="batchSize" min="1" max="30" step="1" />
              </p>
            </div>
              <button class="basic-button" id="data-regen-button" title="Regenerate data">
                Regenerate
              </button>
          </div>
        </div>
        <div class="column features">
          <h4>Features</h4>
          <p>Which properties do you want to feed in?</p>
          {Object.entries(INPUTS).map(([k, v]) => (
            <div>
              <input
                type="checkbox"
                id={`input-${k}`}
                name={`input-${k}`}
                key={k}
                checked={inputs[k]}
                onChange={({ target: { name, checked } }) => {
                  setInputs(name.split('-')[1], checked)
                }}
              />
              <label for={`input-${k}`}>{v.label}</label>
            </div>
          ))}
        </div>

        <div class="column hidden-layers">
          <h4>
            <div class="ui-numHiddenLayers">
              <button id="add-layers" class="mdl-button mdl-js-button mdl-button--icon">
                <i class="material-icons">add</i>
              </button>
              <button id="remove-layers" class="mdl-button mdl-js-button mdl-button--icon">
                <i class="material-icons">remove</i>
              </button>
            </div>
            <span id="num-layers"></span>
            <span id="layers-label"></span>
          </h4>
          <div class="bracket"></div>
        </div>

        <div class="column output">
          <h4>Output</h4>
          <div>
            <div>
              <span>Test loss: </span>
              <span>{lossTest}</span>
            </div>
            <div>
              <span>Training loss: </span>
              <span>{lossTrain}</span>
            </div>
            <div id="linechart"></div>
          </div>
          <div id="heatmap"></div>
          <div>
            <div>
              <span>Test Data: </span>
              <pre>{JSON.stringify(testData, null, 2)}</pre>
            </div>
            <div>
              <span>Training Data: </span>
              <pre>{JSON.stringify(trainData, null, 2)}</pre>
            </div>
          </div>
          <div >
            <div>
              <div class="label">
                Colors shows data, neuron and weight values.
              </div>
              <svg width="150" height="30" id="colormap">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="100%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f59322" stop-opacity="1"></stop>
                    <stop offset="50%" stop-color="#e8eaeb" stop-opacity="1"></stop>
                    <stop offset="100%" stop-color="#0877bd" stop-opacity="1"></stop>
                  </linearGradient>
                </defs>
                <g class="core" transform="translate(3, 0)">
                  <rect width="144" height="10"></rect>
                </g>
              </svg>
            </div>
            <br/>
            <div>
              <label class="ui-showTestData mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="show-test-data">
                <input type="checkbox" id="show-test-data" class="mdl-checkbox__input" checked />
                <span class="mdl-checkbox__label label">Show test data</span>
              </label>
              <label class="ui-discretize mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="discretize">
                <input type="checkbox" id="discretize" class="mdl-checkbox__input" checked />
                <span class="mdl-checkbox__label label">Discretize output</span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default Playground
