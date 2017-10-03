import * as React from 'react'
import {connect} from 'react-redux'
import {Model, Project} from '../../../types/types'
import {ActionRowState} from '../../../types/databrowser/actionrow'
import NewNodeRow from './DataActionRow/NewNodeRow'
import DeleteNodeRow from './DataActionRow/DeleteNodeRow'

interface Props {
  width: number
  height: number
  headerHeight: number
  model: Model
  project: Project
  addNewNode: () => void
  hideNewRow: () => void
  actionRow: ActionRowState
  deleteSelectedNodes: () => void
  fieldColumnWidths: number
  params: any
  updateCalled: () => void
}

class DataActionRow extends React.Component<Props, {}> {
  render() {
    const { actionRow } = this.props

    switch (actionRow) {
      case ActionRowState.DeleteNode:
        return (
          <DeleteNodeRow
            headerHeight={this.props.headerHeight}
            height={this.props.height}
            deleteSelectedNodes={this.props.deleteSelectedNodes}
          />
        )
      default:
        return (
            <NewNodeRow
              {...this.props}
            />
        )
    }
  }
}

const MappedDataActionRow = connect(state => {
  const { actionRow } = state.databrowser.ui
  return { actionRow }
})(DataActionRow)

export default MappedDataActionRow
