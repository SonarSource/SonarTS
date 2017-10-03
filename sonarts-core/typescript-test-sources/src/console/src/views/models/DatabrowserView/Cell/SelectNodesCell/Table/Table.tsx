import * as React from 'react'
import { InfiniteLoader, Table, Column } from 'react-virtualized'
import {Model} from '../../../../../../types/types'
import * as Relay from 'react-relay'
import {calculateFieldColumnWidths} from '../../../../utils'
import headerRenderer from './headerRenderer'
import {Icon} from 'graphcool-styles'
import * as cn from 'classnames'

interface Props {
  rows: any[]
  fields: any[]
  rowCount: number
  loadMoreRows: (settings: {startIndex: number, stopIndex: number}) => void
  onRowSelection: (input: {index: number}) => void
  scrollToIndex?: number
  model: Model
  showOption: boolean
}

interface State {
  height: number
  rowHeight: number
  overscanRowCount: number
  selectedRow: number
}

function pZ(n: number) {
  return n < 10 ? `0${n}` : n
}

class TableComponent extends React.Component<Props, State> {

  widths: {[fieldName: string]: number}

  constructor(props) {
    super(props)

    this.state = {
      height: 400,
      rowHeight: 54,
      overscanRowCount: 20,
      selectedRow: -1,
    }

    global['t'] = this
    // due to the nature of how this component is used, we can safely assume that the field props won't change
    this.widths = calculateFieldColumnWidths(window.innerWidth - 200, props.fields, props.rows)
  }

  render() {
    const { rowCount, fields, rows, showOption } = this.props
    const { height, rowHeight, overscanRowCount } = this.state

    return (
      <div className={cn('popup-table', {single: !showOption})}>
        <style jsx global>{`
          .popup-table {
            @p: .bgBlack02, .overflowXScroll, .relative, .w100;
            padding-top: 30px;
          }
          .popup-table .table-row {
            @p: .flex, .pointer;
            &:focus {
              outline: none;
            }
          }
          .popup-table .table-row.selected {
            @p: .bgBlue, .white;
          }
          .ReactVirtualized__Table__Grid {
            @p: .bgWhite;
            box-shadow: 0 1px 4px rgba(0,0,0,.1);
          }
          .table-header {
            @p: .fw6;
          }
          .ReactVirtualized__Table__headerColumn {
            @p: .ph25, .pv16, .bbox, .overflowHidden, .toe, .black60;
          }
          .ReactVirtualized__Table__rowColumn {
            @p: .overflowHidden, .toe, .br, .bb, .bBlack10, .nowrap;
          }
          .ReactVirtualized__Table__rowColumn + .ReactVirtualized__Table__rowColumn {
            @p: .ph25, .pv16;
          }
          .table-row.selected .ReactVirtualized__Table__rowColumn {
            @p: .bn;
          }
          .popup-table.single .ReactVirtualized__Table__rowColumn {
            @p: .ph25, .pv16;
          }
        `}</style>
        <InfiniteLoader
          isRowLoaded={this.isRowLoaded}
          loadMoreRows={this.props.loadMoreRows}
          rowCount={rowCount}
        >
          {({ onRowsRendered, registerChild }) => (
            <Table
              headerHeight={54}
              height={height}
              noRowsRenderer={this.noRowsRenderer}
              overscanRowCount={overscanRowCount}
              rowHeight={rowHeight}
              rowCount={rowCount}
              rowGetter={this.rowGetter}
              headerClassName='table-header'
              ref={registerChild}
              width={fields.map(field => this.widths[field.name]).reduce((acc, value) => (acc + value), 0)}
              onRowsRendered={onRowsRendered}
              onRowClick={this.props.onRowSelection}
              rowClassName={this.rowClassName}
              scrollToIndex={this.props.scrollToIndex}
            >
              {showOption && (
                <Column
                  key='option'
                  label='Select'
                  dataKey='Select'
                  width={54}
                  cellRenderer={this.optionCellRenderer}
                  headerRenderer={() => null}
                />
              )}
              {fields.map(field => (
                <Column
                  key={field.name}
                  label={field.name}
                  dataKey={field.name}
                  width={this.widths[field.name]}
                  headerRenderer={headerRenderer(field)}
                />
              ))}
            </Table>
          )}
        </InfiniteLoader>
      </div>
    )
  }

  private optionCellRenderer = ({rowData}) => {
    const active = rowData.selected === 'true'
    return (
      <div className='option-cell'>
        <style jsx>{`
          .option-cell {
            @p: .flex, .itemsCenter, .justifyCenter;
            height: 54px;
            width: 54px;
          }
          .option {
            @p: .flex, .itemsCenter, .justifyCenter, .br100, .ba, .bBlack10;
            width: 25px;
            height: 25px;
          }
          .option.active {
            @p: .bn, .bgWhite20;
          }
        `}</style>
        <div className={cn('option', {active})}>
          {active && (
            <Icon
              src={require('graphcool-styles/icons/fill/check.svg')}
              color='white'
              width={17}
              height={17}
            />
          )}
        </div>
      </div>
    )
  }

  private rowClassName = ({index}) => {
    return `table-row ${this.props.rows[index] && this.props.rows[index].selected ? 'selected' : ''}`
  }

  private noRowsRenderer = () => {
    return (
      <div className='no-rows'>
        <style jsx>{`
         .no-rows {
           @p: .w100, .h100, .flex, .justifyCenter, .itemsCenter;
         }
        `}</style>
        <div>
          No {this.props.model.namePlural}
        </div>
      </div>
    )
  }

  private rowGetter = ({ index }) => {
    let row = this.props.rows[index]
    if (!row) {
      return {}
    }

    return Object.keys(row).reduce(
      (prev, current) => {
        prev[current] = this.textToString(row[current])
        return prev
      },
      {},
    )
  }

  private textToString(value) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '[]'
      }
      if (value[0] && value[0].id) {
        const values = value as any[]
        return `[${value.map(v => `"${v.id}"`).join(',')}]`
      }
    }
    if (typeof value === 'object' && value && value.hasOwnProperty('id')) {
      return String(value['id'])
    }
    if (value instanceof Date) {
      return `${pZ(value.getMonth() + 1)}/${pZ(value.getDate())}/${value.getFullYear().toString().slice(2,4)} ` +
        `${value.getHours()}:${pZ(value.getMinutes())}:${pZ(value.getSeconds())}`
    }
    return String(value)
  }

  // private cellRenderer = ({key, style, columnIndex, rowIndex}) => {
  //   const field = this.props.fields[columnIndex]
  //   const {selectedRow} = this.state
  //   return (
  //     <div
  //       key={key}
  //       style={style}
  //       className={`cell ${selectedRow === rowIndex ? 'selected' : ''}`}
  //       onClick={() => this.selectRow(rowIndex)}
  //     >
  //       <style jsx>{`
  //         .cell {
  //           @p: .bbox, .pv16, .ph25, .f16;
  //           &.selected {
  //             @p: .bgBlue, .white;
  //           }
  //         }
  //       `}</style>
  //       {this.textToString(this.props.rows[rowIndex][field])}
  //     </div>
  //   )
  // }

  // private selectRow(rowIndex: number) {
  //   this.setState({selectedRow: rowIndex} as State)
  // }

  private isRowLoaded = ({index}) => {
    const loaded = Boolean(this.props.rows[index])
    return loaded
  }
}

export default Relay.createContainer(TableComponent, {
  fragments: {
    model: () => Relay.QL`
      fragment on Model {
        id
        namePlural
      }
    `,
  },
})
