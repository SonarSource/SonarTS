import * as React from 'react'
import {connect} from 'react-redux'
import {Model, Project} from '../../../../types/types'
import NewRow from '../NewRow'
import NewRowInactive from '../NewRowInactive'
import {Grid} from 'react-virtualized'
import {ActionRowState} from '../../../../types/databrowser/actionrow'
import {GridPosition} from '../../../../types/databrowser/ui'
import {createCellRenderer} from '../../../../components/InfiniteTable/InfiniteTable'

interface Props {
  width: number
  height: number
  headerHeight: number
  model: Model
  project: Project
  addNewNode: () => any
  hideNewRow: () => any
  fieldColumnWidths: {[key: string]: number}
  actionRow?: ActionRowState
  newRowActive: boolean
  selectedCell: GridPosition
  params: any
  updateCalled: () => void
}

interface State {

}

class NewNodeRow extends React.Component<Props, State> {
  renderAddCell = () => {
    if (this.props.newRowActive) {
        return (
          <NewRow
            model={this.props.model}
            projectId={this.props.project.id}
            columnWidths={this.props.fieldColumnWidths}
            add={this.props.addNewNode}
            cancel={this.props.hideNewRow}
            width={this.props.width}
            updateCalled={this.props.updateCalled}
          />
        )
    }

    return (
      <NewRowInactive
        params={this.props.params}
        model={this.props.model}
        columnWidths={this.props.fieldColumnWidths}
        height={this.props.height}
      />
    )
  }
  render() {
    return (
      <Grid
        width={this.props.width - (40 - 1)}
        height={this.props.height}
        style={{
          overflow: 'visible',
          position: 'absolute',
          left: 40,
          width: 'auto',
          top: this.props.headerHeight,
          zIndex: !this.props.newRowActive ? 2 : this.props.selectedCell.row === -1 ? 4 : 2,
        }}
        cellStyle={{position: 'absolute'}}
        rowHeight={this.props.height}
        columnCount={1}
        columnWidth={this.props.width - (40 - 1)}
        rowCount={1}
        cellRenderer={createCellRenderer(this.renderAddCell)}
      />
    )
  }
}

const MappedDataActionRow = connect(state => {
  return {
    newRowActive: state.databrowser.ui.newRowActive,
    selectedCell: state.databrowser.ui.selectedCell,
  }
})(NewNodeRow)

export default MappedDataActionRow
