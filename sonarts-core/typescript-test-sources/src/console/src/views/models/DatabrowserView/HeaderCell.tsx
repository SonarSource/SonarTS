import * as React from 'react'
import * as Relay from 'react-relay'
import {Icon} from 'graphcool-styles'
import {Link} from 'react-router'
import {getFieldTypeName} from '../../../utils/valueparser'
import {isScalar} from '../../../utils/graphql'
import {Field} from '../../../types/types'
import {classnames} from '../../../utils/classnames'
import {connect} from 'react-redux'
import tracker from '../../../utils/metrics'
const classes: any = require('./HeaderCell.scss')
import {ConsoleEvents, SortOrder} from 'graphcool-metrics'
import {setFieldPopupSource} from '../../../actions/popupSources'
import {FieldPopupSource} from 'graphcool-metrics/dist'

interface Props {
  field: Field
  sortOrder?: string
  toggleSortOrder: () => void
  params: any
  setFieldPopupSource: (source: FieldPopupSource) => void
}

class HeaderCell extends React.Component<Props, {}> {

  constructor(props) {
    super(props)
  }

  render() {
    const {field, sortOrder, params} = this.props

    let type = getFieldTypeName(field)
    if (field.isList) {
      type = `[${type}]`
    }
    if (field.isRequired) {
      type = `${type}!`
    }

    let editUrl = `/${params.projectName}/schema/${params.modelName}/edit/${field.name}`
    if (!isScalar(field.typeIdentifier)) {
      editUrl = `/${params.projectName}/schema/relations/edit/${field.relation.name}`
    }

    return (
      <div
        style={{ width: '100%' }}
        className={classes.root}
      >
        <div className={classes.row}>
          <div className='sort-wrapper'>
            <style jsx>{`
              .sort-wrapper {
                width: 31px;
              }
            `}</style>
            {isScalar(field.typeIdentifier) && !field.isList && (
              <div
                onClick={this.toggleSortOrder}
                className={`${classes.sort} ${sortOrder ? classes.active : ''}`}
              >
                <Icon
                  src={require('assets/icons/arrow.svg')}
                  width={11}
                  height={6}
                  rotate={sortOrder === 'DESC' ? 180 : 0}
                />
              </div>
            )}
          </div>
          <div className={classnames(classes.fieldName, {
            [classes.nonsystem]: !field.isSystem,
          })}>
            {field.name}
            <span className={classes.type}>{type}</span>
            {!field.isSystem &&
            <Link
              to={editUrl}
              className={classes.edit}
              onClick={() => {
                this.props.setFieldPopupSource('databrowser')
                tracker.track(ConsoleEvents.Databrowser.editFieldClicked())
              }}
            >
              <Icon
                width={16}
                height={16}
                src={require('assets/icons/edit.svg')}
              />
            </Link>
            }
          </div>
        </div>
      </div>
    )
  }

  private toggleSortOrder = () => {
    if (isScalar(this.props.field.typeIdentifier)) {
      this.props.toggleSortOrder()
      tracker.track(ConsoleEvents.Databrowser.sorted({
        order: this.props.sortOrder as SortOrder,
        fieldName: this.props.field.name,
      }))
    }
  }

}

const ConnectedHeaderCell = connect(null, {
  setFieldPopupSource,
})(HeaderCell)

export default Relay.createContainer(ConnectedHeaderCell, {
    fragments: {
        field: () => Relay.QL`
          fragment on Field {
            id
            name
            isList
            typeIdentifier
            isSystem
            isRequired
            enumValues
            relatedModel {
              name
            }
            relation {
              name
            }
          }
        `,
    },
})
