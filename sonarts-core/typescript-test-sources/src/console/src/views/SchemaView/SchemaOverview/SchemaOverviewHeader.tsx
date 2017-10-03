import * as React from 'react'
import {Icon, $v} from 'graphcool-styles'
import {SchemaOverviewFilter} from './SchemaOverview'

interface Props {
  activeFilter: SchemaOverviewFilter
  onChangeFilter: (filter: SchemaOverviewFilter) => void
  projectId: string
  onOpenAddType: () => void
}

export default class SchemaOverviewHeader extends React.Component<Props, null> {
  render() {
    const {activeFilter, onChangeFilter} = this.props

    return (
      /*
        can later be extended with
        http://stackoverflow.com/questions/30087463/dotted-dashed-circle-shapes-using-css-not-
        rendering-right-in-chrome/30093139#30093139
        (if it should be like in the design)
      */
      <div className='schema-overview-header'>
        <style jsx>{`
          .schema-overview-header {
            @p: .flex, .itemsCenter, .pt16, .pl16, .pr16;
          }
          .add-type {
            @p: .flex1, .flex, .itemsCenter, .br2, .ph12, .o50, .pointer;
            border: 2px $white40 dashed;
            height: 38px;
            .text {
              @p: .ml10, .white80, .f16;
            }
            transition: $duration all;
          }
          .add-type:hover {
            @p: .o70;
          }
          .switches {
            @p: .ml25, .flex, .o60, .pointer;
            width: 55px;
            flex: 0 0 55px;
          }
          .schema-overview-header :global(.s) {
            @p: .ml6, .relative;
            top: 1px;
          }
          .schema-overview-header :global(i) {
            @p: .o40;
          }
          .schema-overview-header :global(i:hover) {
            @p: .o70;
          }
          .schema-overview-header :global(i.active) {
            @p: .o100;
          }
        `}</style>
        <div className='add-type' onClick={this.props.onOpenAddType}>
          <Icon
            src={require('assets/icons/roundAdd.svg')}
            stroke
            strokeWidth={2}
            color={$v.white}
            width={14}
            height={14}
          />
          <span className='text'>Add Type</span>
        </div>
        <div className='switches'>
          <Icon
            src={require('assets/icons/schema/overview.svg')}
            className={activeFilter === 'detail' ? 'active' : ''}
            color={$v.white}
            width={23}
            height={20}
            onClick={() => onChangeFilter('detail')}
          />
          <Icon
            className={'s' + (activeFilter === 'overview' ? ' active' : '')}
            src={require('assets/icons/schema/detail.svg')}
            color={$v.white}
            width={23}
            height={20}
            onClick={() => onChangeFilter('overview')}
          />
        </div>
      </div>
    )
  }
}
