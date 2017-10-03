
import * as React from 'react'
import {RelationPopupDisplayState} from '../../types/types'

interface Props {
  title: string
  selected: boolean
  onClick: Function // (displayState: RelationPopupDisplayState) => void
}

export default class CreateRelationHeaderTab extends React.Component<Props, {}> {

  render() {

    const selectedTabColor = 'green'
    const unselectedTabColor = 'black30'

    return (
      <div className='relative'>
        <style jsx={true}>{`

          .titleTab {
            @inherit: .pv16, .mh6, .ph10, .f12, .fw6, .ttu, .pointer;
          }

          .selectedTitle {
            border-bottom-color: rgba(42,189,60,.3);
            border-bottom-width: 3px;
            margin-bottom: -2px;
          }

        `}</style>

        <div
          className={`titleTab ${this.props.selected ? selectedTabColor : unselectedTabColor}`}
          onClick={() => this.props.onClick(this.displayStateForTitle())}
        >
          {this.props.title}
        </div>
        {this.props.selected && this.underlineSelection()}
      </div>
    )
  }

  private displayStateForTitle = (): RelationPopupDisplayState | null => {
    if (this.props.title === 'Set Mutations') {
      return 'SET_MUTATIONS' as RelationPopupDisplayState
    } else if (this.props.title === 'Define Relations') {
      return 'DEFINE_RELATION' as RelationPopupDisplayState
    }
    return null
  }

  private underlineSelection = (): JSX.Element => {
    const {selected, title} = this.props
    const backgroundColor = selected && title === 'Set Mutations' ? 'white' : 'rgba(250,250,250,1)'
    return (
      <div
        className='outerComponent'
        style={{
          backgroundColor: backgroundColor,
        }}
      >
        <style jsx={true}>{`
        .outerComponent {
          @p: .flex, .justifyCenter, .itemsCenter;
          position: absolute;
          width: 113%;
          height: 5px;
          z-index: 10;
          top: 48px;
          left: -5%;
        }

        .innerComponent {
          @p: .bgGreen30;
          width: 92%;
          height: 3px;
          z-index: 11;
          border-radius: 8px;
        }

      `}</style>
        <div className='innerComponent' />
      </div>
    )
  }

}
