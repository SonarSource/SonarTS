import * as React from 'react'
import {$v} from 'graphcool-styles'

interface Props {
  selectedIndex: number
  choices: [string]
  activeBackgroundColor: string
  onChange: (index: number, choice: string) => void
  inactiveBackgroundColor?: string
  inactiveTextColor?: string
}

export default class HorizontalSelect extends React.Component<Props, {}> {

  render() {

    const {activeBackgroundColor, selectedIndex, onChange, choices} = this.props
    const inactiveTextColor = this.props.inactiveTextColor || $v.gray30
    const inactiveBackgroundColor = this.props.inactiveBackgroundColor || $v.gray04

    return (
      <div className='container'>
        <style jsx={true}>{`
          .container {
            @inherit: .flex, .itemsCenter, .justifyCenter;
          }

          .element {
            @inherit: .relative, .pv4, .ph6, .pointer, .br2, .f12, .fw6, .ttu, .nowrap;
          }

        `}</style>
        {choices.map((choice, i) => {
          return (<div
            className='element'
            key={i}
            onClick={() => onChange(i, choice)}
            style={{
              backgroundColor: selectedIndex === i ? activeBackgroundColor : inactiveBackgroundColor,
              color: selectedIndex === i ? 'white' : inactiveTextColor,
              margin: selectedIndex === i ? '0 -2px' : '0',
              zIndex: selectedIndex === i ? 2 : 0,
            }}
          >
            {choice}
          </div>)
        })}
      </div>
    )
  }
}
