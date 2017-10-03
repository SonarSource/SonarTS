import * as React from 'react'
import * as Relay from 'react-relay'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {nextStep} from '../../../actions/gettingStarted'
import {GettingStartedState} from '../../../types/gettingStarted'
import {StateTree, ReduxAction} from '../../../types/reducers'
import Cell from './Cell'
import {TypedValue} from '../../../types/utils'
import {Model, Field, TetherStep} from '../../../types/types'
import {getFirstInputFieldIndex, getDefaultFieldValues} from '../utils'
import {Icon} from 'graphcool-styles'
import {classnames} from '../../../utils/classnames'
import * as Immutable from 'immutable'
const classes: any = require('./NewRow.scss')
import Tether from '../../../components/Tether/Tether'
import {nextCell} from '../../../actions/databrowser/ui'
import {GridPosition} from '../../../types/databrowser/ui'
import tracker from '../../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'
import {idToBeginning} from '../../../utils/utils'

interface Props {
  model: Model
  projectId: string
  columnWidths: {[key: string]: number}
  add: (fieldValues: { [key: string]: any }) => void
  cancel: (e: any) => void
  gettingStarted: GettingStartedState
  nextStep: () => any
  nextCell: (fields: Field[]) => ReduxAction
  selectedCell: GridPosition
  width: number
  loading: boolean
  loaded: Immutable.List<boolean>
  writing: boolean
  updateCalled: () => void
}

interface State {
  fieldValues: { [key: string]: any }
  shouldFocus?: boolean
}

class NewRow extends React.Component<Props, State> {

  constructor(props) {
    super(props)
    this.state = {
      fieldValues: getDefaultFieldValues(props.model.fields.edges.map((edge) => edge.node)),
      shouldFocus: true,
    }
  }

  keyDown = (e: any) => {
    if (e.keyCode === 13) {
      this.add()
    }
  }

  getFields = () => {
    return this.props.model.fields.edges
      .map((edge) => edge.node)
      .sort(idToBeginning)
  }

  componentDidMount() {
    tracker.track(ConsoleEvents.Databrowser.AddNode.opened())
  }

  render() {
    const fields = this.getFields()

      // .sort(compareFields) // TODO remove this once field ordering is implemented
    const inputIndex = getFirstInputFieldIndex(fields)
    const loading = this.props.writing
    const { step } = this.props.gettingStarted

    return (
      <div
        className={classnames(classes.root, {
          [classes.loading]: loading,
        })}
        style={{
          width: this.props.width - 250 - 40,
          border: '4px solid ' + this.props.loading ? 'red' : 'transparent',
        }}
        onKeyDown={this.keyDown}
      >
        {fields.map((field, index) => {
          return (
            this.renderCell(field, index, inputIndex, fields)
          )
        })}
        <div
          className={classnames(classes.buttons, {
            [classes.loading]: loading,
          })}
        >
          <button onClick={(e: any) => {
            this.props.cancel(e)
            tracker.track(ConsoleEvents.Databrowser.AddNode.canceled())
          }}>
            <Icon
              width={24}
              height={24}
              src={require('assets/new_icons/remove.svg')}
              className={classes.cancel}
            />
          </button>

          <Tether
            steps={[{
              step: 'STEP3_CLICK_SAVE_NODE1',
              title: 'Save the node',
            }]}
            width={280}
            offsetX={5}
            offsetY={-10}
            zIndex={2000}
            horizontal='right'
          >
            <button onClick={this.add}>
              <Icon
                width={24}
                height={24}
                src={require('assets/new_icons/check.svg')}
                className={classes.add}
              />
            </button>
          </Tether>
        </div>
      </div>
    )
  }

  private renderCell = (field, index, inputIndex, fields) => (
    <div
      key={field.id}
      style={{width: this.props.columnWidths[field.name]}}
    >
      <Cell
        needsFocus={this.state.shouldFocus ? index === inputIndex : false}
        selected={this.props.selectedCell.row === -1 && this.props.selectedCell.field === field.name}
        addnew={true}
        field={field}
        fields={fields}
        width={this.props.columnWidths[field.name]}
        update={this.update}
        value={this.state.fieldValues[field.name] ? this.state.fieldValues[field.name].value : ''}
        cancel={this.props.cancel}
        projectId={this.props.projectId}
        modelNamePlural={this.props.model.namePlural}
        reload={() => null}
        rowIndex={-1}
        onChange={this.props.updateCalled}
      />
    </div>
  )

  private add = () => {
    // don't add when we're loading already new data
    if (this.props.writing) {
      return
    }
    const allRequiredFieldsGiven = this.state.fieldValues
      .mapToArray((fieldName, obj) => obj)
      .reduce((acc, {field, value}) => acc && (value !== null || !field.isRequired), true)
    if (allRequiredFieldsGiven) {
      tracker.track(ConsoleEvents.Databrowser.AddNode.submitted())
      this.props.add(this.state.fieldValues)
    }
  }

  private update = (value: TypedValue, field: Field, callback) => {
    this.props.updateCalled()

    const {fieldValues} = this.state
    fieldValues[field.name].value = value
    this.setState({fieldValues, shouldFocus: false} as State)
    callback()
  }
}

const mapStateToProps = (state: StateTree) => {
  return {
    gettingStarted: state.gettingStarted.gettingStartedState,
    writing: state.databrowser.ui.writing,
    selectedCell: state.databrowser.ui.selectedCell,
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ nextStep, nextCell }, dispatch)
}

const MappedNewRow = connect(mapStateToProps, mapDispatchToProps)(NewRow)

export default Relay.createContainer(MappedNewRow, {
  fragments: {
    model: () => Relay.QL`
      fragment on Model {
        fields(first: 1000) {
          edges {
            node {
              id
              name
              defaultValue
              enumValues
              typeIdentifier
              isList
              isReadonly
              ${Cell.getFragment('field')}
            }
          }
        }
      }
    `,
  },
})
