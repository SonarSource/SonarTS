import * as React from 'react'
import * as Relay from 'react-relay'
import {classnames} from '../../../utils/classnames'
import {valueToString, stringToValue} from '../../../utils/valueparser'
import styled, { keyframes } from 'styled-components'
import {Field} from '../../../types/types'
import NodeSelector from '../../../components/NodeSelector/NodeSelector'
import RelationsPopup from './RelationsPopup'
import {CellRequirements, getEditCell} from './Cell/cellgenerator'
import {TypedValue, ShowNotificationCallback} from '../../../types/utils'
import {isNonScalarList, isScalar} from '../../../utils/graphql'
import { Link } from 'react-router'
import {connect} from 'react-redux'
import CopyToClipboard from 'react-copy-to-clipboard'
import {
  nextCell, previousCell, nextRow, previousRow, stopEditCell, editCell, unselectCell, selectCell,
} from '../../../actions/databrowser/ui'
import {ReduxThunk, ReduxAction} from '../../../types/reducers'
import {GridPosition} from '../../../types/databrowser/ui'
import SelectNodesCell from './Cell/SelectNodesCell/SelectNodesCell'
const classes: any = require('./Cell.scss')
import { variables, particles } from 'graphcool-styles'
import * as cx from 'classnames'
import tracker from '../../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'

export type UpdateCallback = (success: boolean) => void

interface Props {
  field: Field
  projectId: string
  projectName: string
  nodeId: string
  value: any
  modelNamePlural: string
  update: (value: TypedValue, field: Field, callback: UpdateCallback) => void
  reload: () => void
  // rowSelected is the selection for deletion
  rowSelected?: boolean
  // rowHasCursor means the cursor is in the row
  rowHasCursor: boolean
  isReadonly: boolean
  addnew: boolean
  backgroundColor: string
  needsFocus?: boolean
  showNotification: ShowNotificationCallback
  rowIndex: number
  editing: boolean
  selected: boolean
  selectCell: (position: GridPosition) => ReduxAction
  unselectCell: () => ReduxAction
  editCell: (position: GridPosition) => ReduxAction
  stopEditCell: () => ReduxAction
  newRowActive: boolean

  nextCell: (fields: Field[]) => ReduxThunk
  previousCell: (fields: Field[]) => ReduxThunk
  nextRow: (fields: Field[], modelNamePlural: string) => ReduxThunk
  previousRow: (fields: Field[], modelNamePlural: string) => ReduxThunk

  position: GridPosition
  fields: Field[]

  loaded: boolean[]
  onChange?: (e: any) => void
}

interface State {
  copied: boolean
}

export class Cell extends React.PureComponent<Props, State> {

  refs: {
    [key: string]: any
    container: any, // needs to be any, as scrollIntoViewIfNeeded is not yet there
  }

  private escaped: boolean
  private saving: boolean

  constructor(props: Props) {
    super(props)

    this.escaped = false
    this.state = {
      copied: false,
    }
  }

  render(): JSX.Element {
    const rootClassnames = classnames({
      [classes.root]: true,
      [classes.null]: this.props.value === null,
      [classes.editing]: this.props.editing,
      [classes.selected]: this.props.selected,
      [classes.rowselected]: this.props.rowSelected,
      [classes.rowhascursor]: this.props.rowHasCursor && !this.props.addnew,
    })
    const {rowIndex, field} = this.props

    const newSingleScalarField = isNewSingleScalarField(rowIndex, field)
    return (
      <div
        style={{
          alignItems: 'center',
          overflow: 'visible',
        }}
        className={rootClassnames}
        onClick={() => (newSingleScalarField || this.props.selected)
          ? this.startEditing() : this.props.selectCell(this.props.position)}
        onDoubleClick={(e) => {
          this.stopEvent(e)
          this.startEditing()
        }}
        ref='container'
      >
        <div className={cx(classes.border, particles.flexAuto)}>
          {this.renderContent()}
        </div>
      </div>
    )
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selected === true && this.props.selected === false) {
      this.refs.container.scrollIntoViewIfNeeded()
    }
  }

  private startEditing = (): void => {
    if (this.props.editing) {
      return
    }
    if (!this.props.field.isReadonly) {
      this.props.editCell(this.props.position)
    }
  }

  private cancel = (shouldReload: boolean = false): void => {
    this.props.stopEditCell()
    if (shouldReload) {
      this.props.reload()
    }
  }

  private save = (value: TypedValue, keepEditing: boolean = false): void => {
    if (this.saving) {
      return
    }
    this.saving = true

    if (this.props.isReadonly) {
      this.saving = false
      return
    }

    if (this.escaped) {
      this.escaped = false
      this.saving = false
      return
    }

    if (this.props.field.isRequired && value === null) {
      const valueString = valueToString(value, this.props.field, true)
      this.props.showNotification({
        message: `'${valueString}' is not a valid value for field ${this.props.field.name}`,
        level: 'error',
      })
      if (keepEditing) {
        this.props.editCell(this.props.position)
      } else {
        this.props.stopEditCell()
      }
      this.saving = false
      return
    }

    if (this.props.value === value) {
      if (keepEditing) {
        this.props.editCell(this.props.position)
      } else {
        this.props.stopEditCell()
      }
      this.saving = false
      return
    }

    tracker.track(ConsoleEvents.Databrowser.Cell.saved())

    if (keepEditing) {
      this.props.editCell(this.props.position)
    } else {
      this.props.stopEditCell()
    }

    this.props.update(value, this.props.field, () => {
      this.saving = false
    })
  }

  private stopEvent = (e: any) => {
    e.preventDefault()
    if (typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation()
    }
    if (typeof e.stopPropagation === 'function') {
      e.stopPropagation()
    }
  }

  private onKeyDown = (e: any): void => {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(e)
    }
    if (e.shiftKey && e.keyCode !== 9) {
      return
    }

    // stopEvent is needed, as the event could bubble up to the keyDown listener we attached
    // in the DatabrowserView
    // for some events, stopImmediatePropagation is needed. But not all events provide that interface,
    // as we get browser based events and synthetic React events
    // so we have so check for the existence of the function

    switch (e.keyCode) {
      case 37:
        this.stopEvent(e)
        this.save(stringToValue(e.target.value, this.props.field))
        this.props.previousCell(this.props.fields)
        tracker.track(ConsoleEvents.Databrowser.Cell.selected({source: {keyCode: 37}}))
        break
      case 38:
        this.stopEvent(e)
        this.save(stringToValue(e.target.value, this.props.field))
        this.props.previousRow(this.props.fields, this.props.modelNamePlural)
        tracker.track(ConsoleEvents.Databrowser.Cell.selected({source: {keyCode: 38}}))
        break
      case 9:
      case 39:
        this.stopEvent(e)
        this.save(stringToValue(e.target.value, this.props.field))
        // go back for shift+tab
        if (e.shiftKey) {
          this.props.previousCell(this.props.fields)
          tracker.track(ConsoleEvents.Databrowser.Cell.selected({source: {keyCode: 9}}))
        } else {
          this.props.nextCell(this.props.fields)
          tracker.track(ConsoleEvents.Databrowser.Cell.selected({source: {keyCode: 39}}))
        }
        break
      case 40:
        this.stopEvent(e)
        this.save(stringToValue(e.target.value, this.props.field))
        this.props.nextRow(this.props.fields, this.props.modelNamePlural)
        tracker.track(ConsoleEvents.Databrowser.Cell.selected({source: {keyCode: 40}}))
        break
      case 13:
        // in the new row case, the row needs the event, so let it bubble up
        if (!this.props.newRowActive) {
          this.stopEvent(e)
        }
        this.save(stringToValue(e.target.value, this.props.field))
        break
      case 27:
        this.stopEvent(e)
        this.escaped = true
        this.cancel()
        break
    }
  }

  private renderNew = (): JSX.Element => {
    const invalidStyle = classnames([classes.value, classes.id])
    if (this.props.field.isReadonly) {
      return (
        <span className={invalidStyle}>{this.props.field.name} will be generated</span>
      )
    }

    if (!isScalar(this.props.field.typeIdentifier)) {
      return (
        <span className={invalidStyle}>Should be added later</span>
      )
    }

    return this.renderExisting()
  }

  private renderExisting = (): JSX.Element => {
    if (this.props.editing) {
      const reqs: CellRequirements = {
        field: this.props.field,
        value: this.props.value,
        projectId: this.props.projectId,
        nodeId: this.props.nodeId,
        methods: {
          save: this.save,
          onKeyDown: this.onKeyDown,
          cancel: this.cancel,
        },
      }
      return getEditCell(reqs)
    }
    const valueString = valueToString(this.props.value, this.props.field, true)
    // Do not use 'defaultValue' because it won't force an update after value change
    const CellLink = styled(Link)`
      padding: ${variables.size06};
      background: ${variables.blue};
      font-size: ${variables.size10};
      font-weight: 600;
      letter-spacing: 1px;
      color: ${variables.white};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;
      border-radius: 2px;
      transition: color ${variables.duration} linear, background ${variables.duration} linear;
      top: 10px;
      right: 8px;
      position: absolute;

      &:hover {
        color: ${variables.white};
        background: ${variables.blue80};
      }
    `
    const movingCopyIndicator = keyframes`
      0% {
        opacity: 0;
        transform: translate(420%, 0);
      }

      50% {
        opacity: 1;
      }

      100% {
        opacity: 0;
        transform: translate(420%, -50px);
      }
    `

    const CopyIndicator = styled.div`
      position: fixed;
      transform: translate(420%, 0);
      animation: ${movingCopyIndicator} .7s linear
    `
    const cellLinkUrl = () => `/${this.props.projectName}/models/${this.props.field.relatedModel.name}/databrowser?q=${valueString}` // tslint:disable-line

    return (
      <span
        className={classes.value}
        style={{
          cursor: 'default',
        }}
        onKeyDown={this.onKeyDown}
      >
        {valueString}
        {this.props.field.typeIdentifier === 'Relation' &&
        !this.props.field.isList &&
          this.props.value !== null &&
          this.props.selected &&
          (
            <CellLink to={cellLinkUrl()}>
              {`Go to ${this.props.field.relatedModel.name}`}
            </CellLink>
        )}
        {this.props.field.isReadonly &&
         this.props.selected &&
          (
          <div>
            <CopyToClipboard text={valueString} onCopy={() => {
              this.setState({copied: true} as State)
              tracker.track(ConsoleEvents.Databrowser.Cell.copied())
            }}>
              <CellLink
                onClick={e => e.preventDefault()}
              >
                {'Copy'}
              </CellLink>
            </CopyToClipboard>
            {this.state.copied && (
              <CopyIndicator
                className={cx(
                  particles.o0,
                  particles.absolute,
                  particles.f14,
                  particles.fw6,
                  particles.blue,
                )}
              >
                Copied
              </CopyIndicator>
            )}
          </div>
        )}
      </span>
    )
  }

  private renderContent(): JSX.Element {
    if (this.props.addnew) {
      return this.renderNew()
    } else {
      return this.renderExisting()
    }
  }
}

function isNewSingleScalarField(rowIndex, field) {
  return rowIndex === -1 && isScalar(field.typeIdentifier) && !field.isList
}

const MappedCell = connect(
  (state, props) => {
    const {rowIndex, field, addnew, selected} = props
    const { selectedCell, editing, newRowActive, writing } = state.databrowser.ui

    const newSingleScalarField = isNewSingleScalarField(rowIndex, field)
    const cellEditing = selected && !writing && (editing || newSingleScalarField)

    return {
      editing: cellEditing,
      position: {
        row: rowIndex,
        field: field.name,
      },
      newRowActive,
      rowHasCursor: selectedCell.row === rowIndex,
    }
  },
  {
    selectCell,
    unselectCell,
    editCell,
    stopEditCell,
    nextCell,
    previousCell,
    nextRow,
    previousRow,
  },
)(Cell)

export default Relay.createContainer(MappedCell, {
  fragments: {
    field: () => Relay.QL`
      fragment on Field {
        id
        name
        isList
        isRequired
        isReadonly
        typeIdentifier
        enumValues
        model {
          id
          name
        }
        relatedModel {
          ${SelectNodesCell.getFragment('model')}
          id
          name
        }
        reverseRelationField {
          isList
          name
        }
        relationSide
        relation {
          fieldOnLeftModel {
            id
            name
          }
          fieldOnRightModel {
            id
            name
          }
        }
        ${RelationsPopup.getFragment('originField')}
      }
    `,
  },
})
