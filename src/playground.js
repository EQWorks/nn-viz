import { useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import IconButton from '@material-ui/core/IconButton'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { useStore } from './state'
import { INPUTS } from './utils'
import Controls from './controls'
import DataConfig from './data-config'


const useStyles = makeStyles((theme) => ({
  controls: {
    minWidth: 120,
    margin: theme.spacing(1),
  },
  accordionDetail: {
    maxHeight: 200,
    overflowY: 'scroll',
  },
}))

const Playground = () => {
  const classes = useStyles()

  // from global store
  const problem = useStore(state => state.problem)
  const dataset = useStore(state => state.dataset)
  const regDataset = useStore(state => state.regDataset)

  const noise = useStore(state => state.noise)
  const percTrainData = useStore(state => state.percTrainData)
  const batchSize = useStore(state => state.batchSize)
  const activation = useStore(state => state.activation)
  const regularization = useStore(state => state.regularization)
  const regularizationRate = useStore(state => state.regularizationRate)

  const initZero = useStore(state => state.initZero)
  const inputs = useStore(state => state.inputs)
  const setInputs = useStore(state => state.setInputs)

  const isPlaying = useStore(state => state.isPlaying)
  const togglePlaying = useStore(state => state.togglePlaying)
  const trainData = useStore(state => state.trainData)
  const testData = useStore(state => state.testData)
  const iter = useStore(state => state.iter)
  // const network = useStore(state => state.network) // TODO: visualize this circular structure
  const lossTrain = useStore(state => state.lossTrain)
  const lossTest = useStore(state => state.lossTest)
  const oneStep = useStore(state => state.oneStep)
  const resetNetwork = useStore(state => state.resetNetwork)

  const networkShape = useStore(state => state.networkShape)
  const addHiddenLayer = useStore(state => state.addHiddenLayer)
  const removeHiddenLayer = useStore(state => state.removeHiddenLayer)
  const addNeuron = useStore(state => state.addNeuron)
  const removeNeuron = useStore(state => state.removeNeuron)

  // TODO: use zustand reactive mechanism (subscribe)
  useEffect(() => {
    resetNetwork()
  }, [inputs, problem, dataset, regDataset, noise, percTrainData, activation, regularization, regularizationRate, initZero, networkShape, batchSize])

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
          <h4>{networkShape.length} Hidden layers</h4>
          <ButtonGroup size='small' color='primary'>
            <IconButton
              aria-label='Add Layer'
              onClick={() => { addHiddenLayer() }}
              disabled={networkShape.length >= 6}
            >
              <AddIcon />
            </IconButton>
            <IconButton
              aria-label='Remove Layer'
              onClick={() => { removeHiddenLayer() }}
              disabled={networkShape.length <= 0}
            >
              <RemoveIcon />
            </IconButton>
          </ButtonGroup>
          {networkShape.length > 0 && (
            <Grid container spacing={2}>
              {networkShape.map((neurons, layer) => (
                <Grid item xs key={layer}>
                  <h5>{neurons} Neurons</h5>
                  <ButtonGroup size='small' color='primary'>
                    <IconButton
                      aria-label={`Add Neuron for Layer ${layer}`}
                      onClick={() => { addNeuron(layer) }}
                      disabled={neurons >= 8}
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      aria-label={`Remove Neuron for Layer ${layer}`}
                      onClick={() => { removeNeuron(layer) }}
                      disabled={neurons <= 1}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </ButtonGroup>
                </Grid>
              ))}
            </Grid>
          )}
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
          {/* seems to be viz only */}
          {/* <div >
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
              <label class="ui-discretize mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="discretize">
                <input type="checkbox" id="discretize" class="mdl-checkbox__input" checked />
                <span class="mdl-checkbox__label label">Discretize output</span>
              </label>
            </div>
          </div> */}
        </Grid>
      </Grid>
      <div>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel-test-data-content"
            id="panel-test-data-header"
          >
            Test data
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetail}>
            <pre>{JSON.stringify(testData, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel-training-data-content"
            id="panel-training-data-header"
          >
            Training data
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetail}>
            <pre>{JSON.stringify(trainData, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
      </div>
    </Container>
  )
}

export default Playground
