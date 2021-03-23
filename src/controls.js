import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
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

import { Activations, Regularizations } from './lib/nn'
import { Problems, Datasets, RegDatasets } from './utils'
import { useStore } from './state'


const useStyles = makeStyles((theme) => ({
  controls: {
    minWidth: 120,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}))

const Controls = ({ isPlaying, iter, togglePlaying, oneStep, resetNetwork }) => {
  const classes = useStyles()

  // from global store
  const problem = useStore(state => state.problem)
  const setProblem = useStore(state => state.setProblem)

  const activation = useStore(state => state.activation)
  const setActivation = useStore(state => state.setActivation)

  const regularization = useStore(state => state.regularization)
  const setRegularization = useStore(state => state.setRegularization)

  const learningRate = useStore(state => state.learningRate)
  const setLearningRate = useStore(state => state.setLearningRate)

  const regularizationRate = useStore(state => state.regularizationRate)
  const setRegularizationRate = useStore(state => state.setRegularizationRate)

  const dataset = useStore(state => state.dataset)
  const setDataset = useStore(state => state.setDataset)

  const regDataset = useStore(state => state.regDataset)
  const setRegDataset = useStore(state => state.setRegDataset)

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        {/* activation */}
        <FormControl size='small' variant='outlined' className={classes.controls}>
          <InputLabel id="activations-label">Activation</InputLabel>
          <Select
            labelId='activations-label'
            value={activation}
            onChange={({ target: { value } }) => setActivation(value)}
            label='Activation'
          >
            {Object.keys(Activations).map((a) => (
              <MenuItem key={a} value={a}>{a}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* regularization */}
        <FormControl size='small' variant='outlined' className={classes.controls}>
          <InputLabel id='regularizations-label'>Regularization</InputLabel>
          <Select
            labelId="regularizations-label"
            value={regularization}
            onChange={({ target: { value } }) => setRegularization(value)}
            label='Regularization'
          >
            {Object.keys(Regularizations).map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* problem type */}
        <FormControl size='small' variant='outlined' className={classes.controls}>
          <InputLabel id='problem-label'>Problem type</InputLabel>
          <Select
            labelId='problem-label'
            value={problem}
            onChange={({ target: { value } }) => setProblem(value)}
            label='Problem type'
          >
            {Object.values(Problems).map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* dataset */}
        <FormControl size='small' variant='outlined' className={classes.controls}>
          <InputLabel id="dataset-label">Dataset</InputLabel>
          <Select
            labelId='data-type-label'
            value={problem === Problems.REGRESSION ? regDataset : dataset}
            onChange={({ target: { value } }) => problem === Problems.REGRESSION ? setRegDataset(value) : setDataset(value)}
            label='Dataset'
          >
            {Object.keys(problem === Problems.REGRESSION ? RegDatasets : Datasets).map((d) => (
              <MenuItem key={d} value={d}>{d.toUpperCase()}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        {/* learning rate */}
        <FormControl size='small' variant='outlined' className={classes.controls}>
          <InputLabel id='learning-rate-label'>Learning rate</InputLabel>
          <Select
            labelId='learning-rate-label'
            value={learningRate}
            onChange={({ target: { value } }) => setLearningRate(value)}
            label='Learning rate'
          >
            <MenuItem value="0.00001">0.00001</MenuItem>
            <MenuItem value="0.0001">0.0001</MenuItem>
            <MenuItem value="0.001">0.001</MenuItem>
            <MenuItem value="0.003">0.003</MenuItem>
            <MenuItem value="0.01">0.01</MenuItem>
            <MenuItem value="0.03">0.03</MenuItem>
            <MenuItem value="0.1">0.1</MenuItem>
            <MenuItem value="0.3">0.3</MenuItem>
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="10">10</MenuItem>
          </Select>
        </FormControl>
        {/* regularization rate */}
        <FormControl size='small' variant='outlined' className={classes.controls}>
          <InputLabel id='regularization-rate-label'>Regularization rate</InputLabel>
          <Select
            labelId='regularization-rate-label'
            value={regularizationRate}
            onChange={({ target: { value } }) => setRegularizationRate(value)}
            label='Regularization rate'
          >
            <MenuItem value="0">0</MenuItem>
            <MenuItem value="0.001">0.001</MenuItem>
            <MenuItem value="0.003">0.003</MenuItem>
            <MenuItem value="0.01">0.01</MenuItem>
            <MenuItem value="0.03">0.03</MenuItem>
            <MenuItem value="0.1">0.1</MenuItem>
            <MenuItem value="0.3">0.3</MenuItem>
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="10">10</MenuItem>
          </Select>
        </FormControl>
        {/* timeline controls */}
        <ButtonGroup size='small' color='primary'>
          <IconButton aria-label='Reset' onClick={() => { resetNetwork() }}>
            <RotateLeftIcon />
          </IconButton>
          <IconButton aria-label={isPlaying ? 'Pause' : 'Play'} onClick={() => { togglePlaying() }}>
            {isPlaying ? (<PauseCircleOutlineIcon />) : (<PlayCircleOutlineIcon />)}
          </IconButton>
          <IconButton aria-label='Skip next' onClick={() => {
            oneStep()
          }}>
            <SkipNextIcon />
          </IconButton>
        </ButtonGroup>
        <TextField
          className={classes.controls}
          variant='outlined'
          label="Iterations"
          value={iter}
          size='small'
          InputProps={{ readOnly: true }}
        />
      </Grid>
    </Grid>
  )
}

export default Controls
