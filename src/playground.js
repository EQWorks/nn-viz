import { useEffect, useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'

import { useStore } from './state'
import { INPUTS } from './utils'
import Controls from './controls'
import DataConfig from './data-config'


const useStyles = makeStyles((theme) => ({
  controls: {
    minWidth: 120,
    margin: theme.spacing(1),
  },
}))

const Playground = () => {
  const classes = useStyles()

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

  const learningRate = useStore(state => state.learningRate)
  const regularizationRate = useStore(state => state.regularizationRate)

  const initZero = useStore(state => state.initZero)
  const inputs = useStore(state => state.inputs)
  const setInputs = useStore(state => state.setInputs)

  const isPlaying = useStore(state => state.isPlaying)
  const togglePlaying = useStore(state => state.togglePlaying)
  const trainData = useStore(state => state.trainData)
  const testData = useStore(state => state.testData)
  const iter = useStore(state => state.iter)
  const network = useStore(state => state.network)
  const lossTrain = useStore(state => state.lossTrain)
  const lossTest = useStore(state => state.lossTest)
  const oneStep = useStore(state => state.oneStep)
  const resetNetwork = useStore(state => state.resetNetwork)

  // TODO: use zustand reactive mechanism (subscribe)
  useEffect(() => {
    resetNetwork()
  }, [inputs, problem, dataset, regDataset, noise, percTrainData, activation, regularization, initZero])

  useEffect(() => {
    let t
    if (!t) {
      t = setInterval(() => {
        if (isPlaying) {
          oneStep()
        }
      }, 100)
    }
    return () => clearInterval(t)
  }, [isPlaying])

  return (
    <Container maxWidth='xl'>
      {/* controls */}
      <Controls isPlaying={isPlaying} iter={iter} togglePlaying={togglePlaying} oneStep={oneStep} resetNetwork={resetNetwork} />
      {/* visualization */}
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <h4>Data configuration</h4>
          <DataConfig />
        </Grid>
        <Grid item xs={2}>
          <h4>Features</h4>
          {Object.entries(INPUTS).map(([k, v]) => (
            <div>
              <input
                type='checkbox'
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
              <span>Network</span>
              <pre>{JSON.stringify((network[network.length - 1] || [])[0], null, 2)}</pre>
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
    </Container>
  )
}

export default Playground
