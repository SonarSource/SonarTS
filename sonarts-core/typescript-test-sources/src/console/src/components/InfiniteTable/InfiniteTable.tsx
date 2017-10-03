import * as React from 'react'
import * as Immutable from 'immutable'
import {InfiniteLoader, Grid} from 'react-virtualized'
import {Model, Project, FieldWidths} from '../../types/types'
import DataActionRow from '../../views/models/DatabrowserView/DataActionRow'
import {GridPosition} from '../../types/databrowser/ui'

interface Props {
  minimumBatchSize?: number
  threshold?: number
  width: number
  height: number
  scrollTop?: number
  columnCount: number
  columnWidth: (input: any) => number
  loadMoreRows: (input: any) => Promise<any>
  addNew: boolean
  onScroll?: (input: any) => void
  model: Model
  project: Project
  newRowActive: boolean

  loadedList: Immutable.List<boolean>

  rowCount: number
  rowHeight: number
  cellRenderer: (input: any) => JSX.Element | string
  loadingCellRenderer: (input: any) => JSX.Element | string

  headerHeight: number
  headerRenderer: (input: any) => JSX.Element | string
  fieldColumnWidths: FieldWidths

  addRowHeight: number

  hideNewRow: () => void
  addNewNode: () => void

  deleteSelectedNodes: () => any

  selectedCell: GridPosition
  params: any

  updateCalled: () => void
}

export function createCellRenderer (cellRenderer) {
  // console.warn('cellRenderer udpate needed')

  return function cellRendererWrapper ({ key, style, ...rest }) {
    return (
      <div
        className='Grid__cell'
        key={key}
        style={style}
      >
        {cellRenderer(rest)}
      </div>
    )
  }
}

export default class InfiniteTable extends React.Component<Props, {}> {

  render() {
    return (
      <div style={{height: '100%', position: 'relative'}}>
        <InfiniteLoader
          minimumBatchSize={this.props.minimumBatchSize}
          threshold={this.props.threshold}
          rowCount={this.props.rowCount}
          loadMoreRows={this.loadMoreRows}
          isRowLoaded={({index}) => {
            const loaded = this.props.loadedList.get(index)
            return loaded
          }}
          >
          {({onRowsRendered, registerChild}) => (
            <div
              style={{display: 'flex', flexDirection: 'row', height: '100%', position: 'relative'}}
            >
              <Grid
                columnWidth={this.props.columnWidth}
                columnCount={this.props.columnCount}
                height={this.props.headerHeight}
                cellRenderer={createCellRenderer(this.props.headerRenderer)}
                cellStyle={{position: 'absolute', marginTop: '-1px'}}
                rowHeight={this.props.headerHeight}
                rowCount={1}
                style={{overflowX: 'visible', overflowY: 'visible', width: 'auto', position: 'relative'}}
                width={this.props.width}
              />
              <DataActionRow
                width={this.props.width}
                height={47}
                headerHeight={this.props.headerHeight}
                model={this.props.model}
                project={this.props.project}
                addNewNode={this.props.addNewNode}
                hideNewRow={this.props.hideNewRow}
                fieldColumnWidths={this.props.fieldColumnWidths}
                deleteSelectedNodes={this.props.deleteSelectedNodes}
                ref={registerChild}
                params={this.props.params}
                updateCalled={this.props.updateCalled}
              />
              <Grid
                ref={registerChild}
                width={this.props.width}
                height={this.props.height - this.props.headerHeight - this.props.addRowHeight}
                style={{
                  overflow: 'visible',
                  position: 'absolute',
                  width: 'auto',
                  left: 0,
                  zIndex: 3,

                  // WARNING: Due to https://bugs.chromium.org/p/chromium/issues/detail?id=20574
                  // it's not possible to use transform here yet, because we have popups as children
                  // we need to refactor the popup infrastructure before
                  top: this.props.headerHeight +
                    this.props.addRowHeight +
                    ((this.props.newRowActive &&
                      this.props.loadedList.size > 0) ? 10 : 0),
                  transition: '.3s all',
                }}
                cellStyle={{position: 'absolute'}}
                rowHeight={this.props.rowHeight}
                columnCount={this.props.columnCount}
                columnWidth={this.props.columnWidth}
                rowCount={this.props.rowCount}
                cellRenderer={createCellRenderer(this.renderCell)}
                onSectionRendered={(section) => this.onGridRowsRendered(section, onRowsRendered)}
                scrollToRow={this.props.selectedCell.row}
                overscanRowCount={20}
              />
            </div>
          )}
        </InfiniteLoader>
      </div>
    )
  }

  private renderCell = (input) => {
    if (this.props.loadedList.get(input.rowIndex)) {
      return this.props.cellRenderer(input)
    } else {
      return this.props.loadingCellRenderer(input)
    }
  }

  private loadMoreRows = (input) => {
    return new Promise((resolve, reject) => {
      this.props.loadMoreRows(input).then(() => {
        resolve(true)
      })
    })
  }

  private onGridRowsRendered = (section, onRowsRendered) => {
    onRowsRendered({
      startIndex: section.rowStartIndex,
      stopIndex: section.rowStopIndex,
      overscanStartIndex: section.rowOverscanStartIndex,
      overscanStopIndex: section.rowOverscanStopIndex,
    })
  }
}
