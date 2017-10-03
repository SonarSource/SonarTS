import * as React from 'react'
import {Icon} from 'graphcool-styles'
import Tooltip from 'rc-tooltip'
import {BreakingChangeIndicatorStyle} from '../../types/types'
import Info from '../../components/Info'

interface Props {
  className?: string
  indicatorStyle: BreakingChangeIndicatorStyle
  width: number
  height: number
  offsets: number[] // distances for the indicators from the top/right (depending on indicatorStyle) in %
  plain: boolean[] // false if indicator should have the exclamation point
  messages?: JSX.Element[] // will be displayed in a tooltip on hovering the indicator
}

export default class BreakingChangeIndicator extends React.Component<Props, {}> {

  render() {
    const breaking = require('../../assets/icons/breaking.svg')
    const breakingPlain = require('../../assets/icons/breaking_plain.svg')

    const {indicatorStyle, offsets, messages, plain, width, height} = this.props
    return (
      <div
        className={`relative ${this.props.className || ''}`}
      >
        <style jsx={true}>{`

            .breakingChangeIndicatorRight {
              @inherit: .absolute;
              left: 99%;
            }

            .breakingChangeIndicatorTop {
              @inherit: .absolute;
              top: -20%;
            }

        `}</style>
        {offsets.map((offset, i) =>
          (<div
            key={i}
            className={`z1 ${indicatorStyle === 'RIGHT' ?
             'breakingChangeIndicatorRight' : 'breakingChangeIndicatorTop'}`}
            style={indicatorStyle === 'RIGHT' ? {top: offset + '%'} : {left: offset + '%'}}
          >
            {messages && messages.length === offsets.length ?
              (<Info
                offsetX={40}
                cursorOffset={10}
                customTip={
                  <Icon
                    className='pointer'
                    src={plain[i] ? breakingPlain : breaking}
                    width={width}
                    height={height}
                    rotate={indicatorStyle === 'TOP' && -90}
                  />
                }
              >
                {messages[i]}
              </Info>)
              :
              (
                <Icon
                  src={plain[i] ? breakingPlain : breaking}
                  width={width}
                  height={height}
                  rotate={indicatorStyle === 'TOP' && -90}
                />
              )
            }
          </div>),
        )}
        {this.props.children}
      </div>
    )
  }
}
