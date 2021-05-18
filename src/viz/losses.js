import React from 'react'
import PropTypes from 'prop-types'

// https://airbnb.io/visx/docs/xychart
import {
  Axis,
  LineSeries,
  Tooltip,
  XYChart,
  EventEmitterProvider,
  DataProvider,
} from '@visx/xychart'
import { curveStepAfter } from '@visx/curve'


const accessors = {
  xAccessor: d => d.x,
  yAccessor: d => d.y,
}

const dataProviderConfig = {
  xScale: { type: 'band' },
  yScale: { type: 'linear' },
}

export const Chart = ({
  dataKey,
  data,
}) => (
  <XYChart height={150} width={400}>
    <Axis orientation='bottom' numTicks={10} />
    <Axis orientation='left' numTicks={4} />
    <LineSeries
      dataKey={dataKey}
      data={data}
      xAccessor={accessors.xAccessor}
      yAccessor={accessors.yAccessor}
      curve={curveStepAfter}
    />
    <Tooltip
      showVerticalCrosshair
      snapTooltipToDatumY
      renderTooltip={({ tooltipData, colorScale }) => (
        <>
          <div style={{ color: colorScale(dataKey) }}>{dataKey}</div>
          <br />
          {accessors.xAccessor(tooltipData.datumByKey[dataKey].datum)}:{' '}
          {accessors.yAccessor(tooltipData.datumByKey[dataKey].datum).toFixed(5)}
        </>
      )}
    />
  </XYChart>
)
Chart.propTypes = {
  dataKey: PropTypes.string.isRequired,
  data: PropTypes.array,
}
Chart.defaultProps = { data: [] }

const Losses = ({ Tests, Trains }) => (
  <DataProvider {...dataProviderConfig}>
    <EventEmitterProvider>
      <Chart data={Tests} dataKey="Test Losses" />
      <br />
      <Chart data={Trains} dataKey="Train Losses" />
    </EventEmitterProvider>
  </DataProvider>
)
Losses.propTypes = {
  Tests: PropTypes.array,
  Trains: PropTypes.array,
}
Losses.defaultProps = {
  Tests: [],
  Trains: [],
}

export default Losses
