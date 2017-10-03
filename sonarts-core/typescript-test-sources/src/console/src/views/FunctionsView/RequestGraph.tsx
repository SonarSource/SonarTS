import * as React from 'react'
import {FunctionStats} from '../../types/types'
import {LineChart} from 'react-svg-chart'

interface Props {
  stats: FunctionStats
}

interface State {

}

export default class RequestGraph extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {

    }
  }

  render() {
    const {requestHistogram} = this.props.stats

    const points = requestHistogram.map(value => ({
      value: value + 1,
    }))

    return (
      <div>
        <style jsx global>{`
          .line-chart {
            background: none;
            box-sizing: border-box;
          }
          .line-chart__grid-x line,
          .line-chart__grid-y line {
            @p: .dn;
          }
          .line-chart__line {
            stroke: $green;
            stroke-width: 1px;
          }
          .line-chart__point {
            @p: .dn;
          }
          .line-chart__label,
          .line-chart__value {
            fill: rgb( 55, 55, 55 );
            font-size: 18px;
          }
          .line-chart__value {
            @p: .dn;
          }
          .line-chart__value-bg {
            @p: .dn;
          }
        `}</style>
        <LineChart
          lines={[
            {
              points,
            },
          ]}
          width={200}
          height={30}
          pointSize={1}
          className='line-chart'
          labelSpacing={2}
          valueHeight={3}
          valueOffset={4}
          valueWidth={2}
          preserveAspectRatio='xMinYMid meet'
          showLabels={false}
        />
      </div>
    )
  }
}
