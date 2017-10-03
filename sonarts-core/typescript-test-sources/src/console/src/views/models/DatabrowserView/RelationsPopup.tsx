import * as React from 'react'
import * as Relay from 'react-relay'
import * as Immutable from 'immutable'
import {Field, Node} from '../../../types/types'
import {isScalar} from '../../../utils/graphql'
import {getLokka} from '../../../utils/simpleapi'
import {Icon} from 'graphcool-styles'
import * as cx from 'classnames'
import PopupWrapper from '../../../components/PopupWrapper/PopupWrapper'
import {particles} from 'graphcool-styles'
import {updateCell} from '../../../actions/databrowser/data'
const classes: any = require('./RelationsPopup.scss')
import {connect} from 'react-redux'
import {GridPosition} from '../../../types/databrowser/ui'
import {TypedValue, NonScalarValue} from '../../../types/utils'
import {unionBy} from 'lodash'

interface Props {
  projectId: string
  originField: Field
  originNodeId: string
  onCancel: () => void
  updateCell: (payload: {
    position: GridPosition,
    value: TypedValue,
  }) => void
  nodes: Immutable.List<Immutable.Map<string, any>>
}

interface NodeWrapper {
  isRelated: boolean
  node: Node
}

enum Selection { All, Related, Unrelated }

interface State {
  nodes: Immutable.List<NodeWrapper>
  selection: Selection
  filter: string
  success: boolean
}

class RelationsPopup extends React.Component<Props, State> {

  private lokka: any

  constructor(props: Props) {
    super(props)

    this.state = {
      nodes: Immutable.List<NodeWrapper>(),
      selection: Selection.All,
      filter: '',
      success: false,
    }

    this.lokka = getLokka(props.projectId)

    this.reload()
  }

  render() {
    const relatedFields = this.props.originField.relatedModel.fields
    const filter = this.state.filter.toLowerCase()
    const filteredNodes = this.state.nodes
      .filter(({isRelated}) => {
        switch (this.state.selection) {
          case Selection.All:
            return true
          case Selection.Related:
            return isRelated
          case Selection.Unrelated:
            return !isRelated
        }
      })
      .filter(({node}) => (
        relatedFields.edges
          .map((edge) => edge.node)
          .filter((field) => isScalar(field.typeIdentifier) && node[field.name])
          .some((field) => node[field.name].toString().toLowerCase().includes(filter))
      ))

    return (
      <PopupWrapper onClickOutside={this.props.onCancel}>
        <div
          className={cx(
            particles.flex,
            particles.bgBlack50,
            particles.w100,
            particles.h100,
            particles.justifyCenter,
            particles.itemsCenter,
          )}
        >
          <div className={classes.root}>
            <div className={classes.header}>
              <div className={classes.filter}>
                <Icon
                  src={require('assets/new_icons/search.svg')}
                  width={30}
                  height={30}
                />
                <input
                  type='text'
                  placeholder='Filter...'
                  value={this.state.filter}
                  onChange={(e: any) => this.setState({ filter: e.target.value } as State)}
                />
              </div>
              <div className={classes.selection}>
                <div
                  className={`${this.state.selection === Selection.All ? classes.active : ''}`}
                  onClick={() => this.setState({ selection: Selection.All } as State)}
                >
                  All
                </div>
                <div
                  className={`${this.state.selection === Selection.Related ? classes.active : ''}`}
                  onClick={() => this.setState({ selection: Selection.Related } as State)}
                >
                  Related
                </div>
                <div
                  className={`${this.state.selection === Selection.Unrelated ? classes.active : ''}`}
                  onClick={() => this.setState({ selection: Selection.Unrelated } as State)}
                >
                  Unrelated
                </div>
              </div>
            </div>
            <div className={classes.list}>
              {filteredNodes.map(({isRelated, node}) => (
                <div
                  key={node.id}
                  className={`${classes.item} ${isRelated ? classes.related : ''}`}
                  onClick={() => this.toggleRelation(isRelated, node.id)}
                >
                  <div className={classes.check}>
                    <Icon
                      width={23}
                      height={23}
                      src={require('assets/new_icons/check.svg')}
                    />
                  </div>
                  <div>{JSON.stringify(node, null, 2)}</div>
                </div>
              ))}
            </div>
            <div className={classes.footer}>
              {this.state.success &&
              <div className={classes.savedIndicator}>
                All changes saved
              </div>
              }
              <div className={classes.close} onClick={this.props.onCancel}>
                Close
              </div>
            </div>
          </div>
        </div>
      </PopupWrapper>
    )
  }

  private reload = () => {
    const relatedModel = this.props.originField.relatedModel
    const originModel = this.props.originField.model

    const fieldNames = relatedModel.fields.edges
      .map(({node}) => node)
      .map((field) => isScalar(field.typeIdentifier)
        ? field.name
        : `${field.name} { id }`)
      .join(' ')
    const query = `
      {
        all${relatedModel.namePlural} {
          ${fieldNames}
        }
        ${originModel.name}(id: "${this.props.originNodeId}") {
          ${this.props.originField.name} {
            ${fieldNames}
          }
        }
      }
    `

    return this.lokka.query(query)
      .then((results) => {
        const allNodes: any[] = results[`all${relatedModel.namePlural}`]
        const resultModelEntries = results[originModel.name]
        const relatedNodes: any[] = resultModelEntries === null ? [] : resultModelEntries[this.props.originField.name]
        const nodes = allNodes.map((node) => ({
          node,
          isRelated: relatedNodes.some((relatedNode) => relatedNode.id === node.id),
        }))

        this.setState({nodes: Immutable.List(nodes)} as State)
      })
  }

  private toggleRelation(isRelated: boolean, nodeId: string): void {
    const relationName = this.props.originField.relation.name
    const relatedModelName = this.props.originField.relatedModel.name
    const relatedFieldName = this.props.originField.reverseRelationField.name
    const originModelName = this.props.originField.model.name
    const originFieldName = this.props.originField.name

    const mutationPrefix = isRelated ? 'removeFrom' : 'addTo'
    let mutationArg1
    let mutationArg2
    let payloadName
    if (originModelName === relatedModelName && originFieldName === relatedFieldName) {
      mutationArg1 = `${relatedFieldName}1${originModelName}Id`
      mutationArg2 = `${originFieldName}2${relatedModelName}Id`
      payloadName = `${relatedFieldName}1${originModelName}`
    } else {
      mutationArg1 = `${relatedFieldName}${originModelName}Id`
      mutationArg2 = `${originFieldName}${relatedModelName}Id`
      payloadName = `${relatedFieldName}${originModelName}`
    }

    const mutation = `{
      ${mutationPrefix}${relationName}(
        ${mutationArg1}: "${this.props.originNodeId}"
        ${mutationArg2}: "${nodeId}"
      ) {
        ${payloadName}{
          id
        }
      }
    }`
    this.lokka.mutate(mutation)
      .then(this.reload)
      .then(() => {
        this.handleSuccess(isRelated, nodeId)
      })
      .catch(err => {
        if (err.rawError && err.rawError[0] && err.rawError[0].code === 3012) {
          this.reload()
          this.handleSuccess(isRelated, nodeId)
        }
        console.error(err)
      })

  }

  private handleSuccess(isRelated: boolean, nodeId: string) {
    this.setState({success: true} as State)

    // update related node in databrowser
    const {nodes, originField, originNodeId} = this.props
    const i = nodes.findIndex(node => node.get('id') === nodeId)
    const position = {
      row: i,
      field: originField.reverseRelationField.name,
    } as GridPosition
    let value
    if (originField.reverseRelationField.isList) {
      const relatedNode = nodes.find(node => node.get('id') === nodeId).toJS()
      let oldValue = relatedNode[originField.reverseRelationField.name]
      oldValue = Array.isArray(oldValue) ? oldValue : []
      if (isRelated) {
        value = oldValue.filter(val => val.id !== originNodeId)
      } else {
        value = unionBy(oldValue, [{id: originNodeId}], val => val.id)
      }
    } else {
      if (isRelated) {
        value = null
      } else {
        value = {
          id: originNodeId,
        }
      }
    }
    this.props.updateCell({
      position, value,
    })
  }
}

const ReduxRelationsPopup = connect(
  state => ({
    nodes: state.databrowser.data.nodes,
  }),
  {updateCell},
)(RelationsPopup)

export default Relay.createContainer(ReduxRelationsPopup, {
  fragments: {
    originField: () => Relay.QL`
      fragment on Field {
        name
        isList
        relatedModel {
          id
          name
          namePlural
          fields(first: 1000) {
            edges {
              node {
                typeIdentifier
                name
              }
            }
          }
        }
        reverseRelationField {
          isList
          name
        }
        model {
          name
        }
        relation {
          name
        }
      }
    `,
  },
})
