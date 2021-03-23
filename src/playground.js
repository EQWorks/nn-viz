import { useEffect, useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import IconButton from '@material-ui/core/IconButton'
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline'
import PauseCircleOutlineIcon from '@material-ui/icons/PauseCircleOutline'
import RotateLeftIcon from '@material-ui/icons/RotateLeft'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import { shuffle } from './lib/dataset'
import { Activations, buildNetwork, forwardProp, Errors } from './lib/nn'
import { useStore, Problems, Datasets, RegDatasets } from './state'
import Controls from './controls'
import DataConfig from './data-config'


const useStyles = makeStyles((theme) => ({
  controls: {
    minWidth: 120,
    margin: theme.spacing(1),
  },
}))

// TODO: make configurable
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

function reset({ trainData, testData, networkShape, problem, activation, regularization, initZero }) {
  // lineChart.reset();
  // player.pause();

  // let suffix = state.numHiddenLayers !== 1 ? "s" : "";
  // d3.select("#layers-label").text("Hidden layer" + suffix);
  // d3.select("#num-layers").text(state.numHiddenLayers);

  // Make a simple network.
  const numInputs = constructInput(0, 0).length;
  const shape = [numInputs].concat(networkShape).concat([1]);
  const outputActivation = (problem === Problems.REGRESSION) ? Activations.LINEAR : Activations.TANH
  const network = buildNetwork(shape, activation, outputActivation, regularization, constructInputIds(), initZero)
  const lossTrain = getLoss(network, trainData)
  const lossTest = getLoss(network, testData)
  // drawNetwork(network);
  // updateUI(true);
  return { iter: 0, network, lossTrain, lossTest }
}

const Playground = () => {
  const classes = useStyles()

  const [isPlaying, setIsPlaying] = useState(false)

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
  const setNoise = useStore(state => state.setNoise)

  const percTrainData = useStore(state => state.percTrainData)
  const setPercTrainData = useStore(state => state.setPercTrainData)

  const batchSize = useStore(state => state.batchSize)
  const setBatchSize = useStore(state => state.setBatchSize)

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
    <Container maxWidth='xl'>
      {/* controls */}
      <Controls isPlaying={isPlaying} iter={iter} />
      {/* visualization */}
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <h4>Data</h4>
          <DataConfig />
        </Grid>
        <Grid item xs={2}>
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
        </Grid>

        <Grid item xs={5}>
          <h4>
            {/* <div class="ui-numHiddenLayers">
              <button id="add-layers" class="mdl-button mdl-js-button mdl-button--icon">
                <i class="material-icons">add</i>
              </button>
              <button id="remove-layers" class="mdl-button mdl-js-button mdl-button--icon">
                <i class="material-icons">remove</i>
              </button>
            </div> */}
            Hidden layers
            <span id="num-layers"></span>
            <span id="layers-label"></span>
          </h4>
          <div class="bracket"></div>
        </Grid>

        <Grid item xs={3}>
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
        </Grid>

      </Grid>
    </Container>
  )
}

export default Playground
