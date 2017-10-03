import * as React from 'react'
import * as cn from 'classnames'

interface Props {
  options: string[]
  activeIndex: number
  onChangeIndex: (index: number) => void
}

const Tabs = ({options, activeIndex, onChangeIndex}: Props) => (
  <div className='tabs'>
    <style jsx={true}>{`
      .tabs {
        @p: .flexFixed, .buttonShadow, .flex, .bgWhite;
      }
      .tab {
        @p: .ttu, .bgWhite, .pv6, .ph16, .tracked, .black50, .pointer, .fw6;
        transition: $duration linear all;
      }
      .tab:hover {
        @p: .bgBlack10;
      }
      .tab.active {
        @p: .bgBlue, .white;
      }
    `}</style>
    {options.map((option, index) => (
      <div key={option} className={cn('tab', {active: index === activeIndex})} onClick={() => onChangeIndex(index)}>
        {option}
      </div>
    ))}
  </div>
)

export default Tabs
