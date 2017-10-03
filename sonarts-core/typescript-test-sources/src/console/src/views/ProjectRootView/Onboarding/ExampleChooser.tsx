import * as React from 'react'
import * as cn from 'classnames'
import {Icon, $v} from 'graphcool-styles'

export interface Example {
  name: string
  path: string
  description: string
  logo1: string
  logo2: string
}

interface Props {
  examples: Example[]
  activeIndex: number
  onChangeExample: (index: number, tech: Example) => void
}

export default function ExampleChooser({examples, activeIndex, onChangeExample}: Props) {
  return (
    <div className='example-chooser'>
      <style jsx={true}>{`
        .example-chooser {
          @p: .flex, .mt38;
        }
        .example {
          @p: .br2, .o40, .bgWhite, .blue, .flex1, .flex, .flexColumn, .itemsCenter, .pv16, .ph10, .pointer;
          border: 2px solid $blue;
          transition: $duration all;
        }
        .example:not(.active):hover {
          @p: .o70;
        }
        .example + .example {
          @p: .ml10;
        }
        .example.active {
          @p: .o100, .white, .bgBlue;
        }
        .logos {
          @p: .flex, .justifyBetween, .w100, .itemsCenter;
        }
        span {
          @p: .f16, .fw6, .blue, .tc;
        }
        .active span {
          @p: .white;
        }
      `}</style>
      {examples.map((example, index) => (
        <div
          className={cn('example', {active: index === activeIndex})}
          onClick={() => onChangeExample(index, example)}
        >
          <div className='logos'>
            <Icon src={example.logo1} width={50} height={50} color={index === activeIndex ? $v.white : $v.blue} />
            <Icon src={example.logo2} width={50} height={50} color={index === activeIndex ? $v.white : $v.blue}/>
          </div>
          <span>{example.description}</span>
        </div>
      ))}
    </div>
  )
}
