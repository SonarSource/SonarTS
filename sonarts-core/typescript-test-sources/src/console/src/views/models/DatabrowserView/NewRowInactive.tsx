import * as React from 'react'
import {connect} from 'react-redux'
import {toggleNewRow} from '../../../actions/databrowser/ui'
import {Model, Field} from '../../../types/types'
import {Icon} from 'graphcool-styles'
import {classnames} from '../../../utils/classnames'
import {SYSTEM_MODELS} from '../../../constants/system'
const classes: any = require('./NewRowInactive.scss')
import Tether from '../../../components/Tether/Tether'
import {Link} from 'react-router'
import {idToBeginning} from '../../../utils/utils'

interface Props {
  columnWidths: {[key: string]: number}
  model: Model
  toggleNewRow: (fields: Field[], modelNamePlural: String) => any
  height: number
  params: any
}

interface State {
  active: boolean
}

class NewRowInactive extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
      active: this.isActive(),
    }
  }

  componentDidMount() {
    this.setActive()
  }

  componentDidReceiveProps() {
    this.setActive()
  }

  render() {
    const fields = this.props.model.fields.edges
      .map((edge) => edge.node)
      .sort(idToBeginning)

    return (
      <div
        className={classnames(classes.root, {
          [classes.active]: this.state.active,
        })}
      >
      {SYSTEM_MODELS.includes(this.props.model.name) ? (
        <div
          className={classes.cell}
          style={{
            width: '100%',
            paddingLeft: 15,
          }}
        >
        </div>
      ) : (
        <div
          className={classnames(classes.root, {
            [classes.active]: this.state.active,
          })}
          onClick={(e: any) => {
            this.toggleNewRow(fields)
          }}
        >
          {fields.map((field, index) => {
            if (index === fields.length - 1) {
              return (
                <Tether
                  style={{
                    pointerEvents: 'none',
                  }}
                  steps={[{
                    step: 'STEP3_CLICK_ADD_NODE2',
                    title: `Awesome! Let's create one more.`,
                    description: 'Hint: You can also use your keyboard to navigate between fields (Tab or Shift+Tab) and submit (Enter).', // tslint:disable-line
                  }]}
                  offsetX={0}
                  offsetY={-10}
                  width={351}
                  horizontal='left'
                  key='STEP3_CLICK_ADD_NODE2'
                  zIndex={1000}
                >
                  {this.renderField(field, index, fields)}
                </Tether>
              )
            } else {
              return (
                this.renderField(field, index, fields)
              )
            }
          })}
        </div>
      )}
        <Link
          style={{
            width: 250,
            height: this.props.height,
          }}
          className={classes.loading}
          to={`/${this.props.params.projectName}/schema/${this.props.params.modelName}/create`}
        >
          <div></div>
        </Link>
      </div>
    )
  }
  private renderField = (field, index, fields) => {
    return (
      <div
        key={field.id}
        style={{
          width: this.props.columnWidths[field.name] + (index === fields.length - 1 ? 1 : 0),
          height: this.props.height,
        }}
        className={classnames(classes.cell, {
          [classes.last]: index === fields.length - 1,
        })}
      >
        {index === 0 && (
          <div className={classes.add}>
            <Tether
              style={{
                pointerEvents: 'none',
              }}
              steps={[{
                step: 'STEP3_CLICK_ADD_NODE1',
                title: 'Create a Node',
                description: 'Items in your data belonging to a certain model are called nodes. Create a new post node and provide values for the "imageUrl" and "description" fields.', // tslint:disable-line
              }]}
              offsetX={0}
              offsetY={-10}
              width={351}
              horizontal='left'
            >
              <Icon
                width={12}
                height={12}
                src={require('assets/new_icons/add-plain.svg')}
              />
            </Tether>
            <span>
              add new node ...
            </span>
          </div>
        )}
      </div>
    )
  }

  private isActive = () => {
    const { model } = this.props

    return (!model.isSystem && !SYSTEM_MODELS.includes(model.name))
  }

  private setActive = () => {
    const active = this.isActive()

    this.setState({
      active,
    })
  }

  private toggleNewRow = (fields: Field[]) => {
    // TODO get isSystem properly from the system api
    if (this.state.active) {
      this.props.toggleNewRow(fields, this.props.model.namePlural)
    }
  }

}
export default connect(null, {
  toggleNewRow,
})(NewRowInactive)
