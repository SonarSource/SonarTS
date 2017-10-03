import * as React from 'react'
import {connect} from 'react-redux'
import {Icon} from 'graphcool-styles'
const classes: any = require('./DeleteNodeRow.scss')
import * as Immutable from 'immutable'
import {clearNodeSelection} from '../../../../actions/databrowser/ui'

interface Props {
  headerHeight: number
  height: number
  selectedNodeIds: Immutable.List<any>
  deleteSelectedNodes: () => any
  clearNodeSelection: () => any
}

interface State {
}

class DeleteNodeRow extends React.Component<Props, State> {
  render() {
    const nodes = this.props.selectedNodeIds.size
    return (
      <div
        className={`flex items-center bg-light-gray ${classes.red}`}
        style={{
          overflow: 'visible',
            position: 'fixed',
            paddingLeft: 10,
            left: 40 + 300,
            width: window.innerWidth - 300 - 40,
            top: this.props.headerHeight + 66 + 60 + 1,
            height: this.props.height,
        }}
      >
        <Icon width={16} height={16} src={require('assets/icons/delete.svg')} className='mr1' />
        <span>Delete {nodes} node{nodes > 1 ? 's' : ''}?</span>
        <div
          style={{
            marginLeft: 'auto',
            marginRight: 0,
            width: 200,
            textAlign: 'right',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
            <div className={`${classes.button}`} onClick={this.props.clearNodeSelection}>
              <span>Cancel</span>
            </div>
            <div className={`${classes.button} ${classes.red}`} onClick={this.props.deleteSelectedNodes}>
              <span>Delete</span>
            </div>
        </div>
      </div>
    )
  }
}

const MappedDataActionRow = connect(
  state => {
    return {
      selectedNodeIds: state.databrowser.ui.selectedNodeIds,
    }
  },
  {
    clearNodeSelection,
  },
)(DeleteNodeRow)

export default MappedDataActionRow
