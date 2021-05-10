import Slider from '@material-ui/core/Slider'
import Typography from '@material-ui/core/Typography'

import { useStore } from './state'


const DataConfig = () => {
  // from global store
  const noise = useStore(state => state.noise)
  const setNoise = useStore(state => state.setNoise)

  const percTrainData = useStore(state => state.percTrainData)
  const setPercTrainData = useStore(state => state.setPercTrainData)

  const batchSize = useStore(state => state.batchSize)
  const setBatchSize = useStore(state => state.setBatchSize)

  return (
    <>
      <Typography id='train-test-ratio' gutterBottom>Train/Test Ratio: {`${percTrainData}%`}</Typography>
      <Slider
        value={percTrainData}
        onChange={(_, value) => setPercTrainData(value)}
        aria-labelledby='train-test-ratio'
        valueLabelDisplay='auto'
        step={10}
        marks
        min={10}
        max={90}
      />
      <Typography id='noise' gutterBottom>Noise: {noise}</Typography>
      <Slider
        value={noise}
        onChange={(_, value) => setNoise(value)}
        aria-labelledby='noise'
        valueLabelDisplay='auto'
        step={5}
        marks
        min={0}
        max={50}
      />
      <Typography id='batch-size' gutterBottom>Batch size: {batchSize}</Typography>
      <Slider
        value={batchSize}
        onChange={(_, value) => setBatchSize(value)}
        aria-labelledby='batch-size'
        valueLabelDisplay='auto'
        step={1}
        min={1}
        max={30}
      />
      {/* TODO: regen button */}
      {/* <div>
        <button class="basic-button" id="data-regen-button" title="Regenerate data">
          Regenerate
        </button>
      </div> */}
    </>
  )
}

export default DataConfig
