import * as React from 'react'
import * as Relay from 'react-relay'
import mapProps from '../../../../components/MapProps/MapProps'
import {ModelPermission, Model, Relation} from '../../../../types/types'
import RelationPermissionComponent from './RelationPermission'
import {$p} from 'graphcool-styles'

interface Props {
  permissions: ModelPermission[]
  relation: Relation
  params: any
}
// const sort = {
//   READ: 0,
//   CREATE: 1,
//   UPDATE: 2,
//   DELETE: 3,
// }

class ModelPermissionsList extends React.Component<Props, {}> {
  render() {
    const {permissions, relation, params} = this.props
    return (
      <div className={$p.pa16}>
        {permissions.map(permission =>
          <RelationPermissionComponent
            key={permission.id}
            permission={permission}
            relation={relation}
            params={params}
          />,
        )}
        {this.props.children}
      </div>
    )
  }
}

const MappedPermissionsList = mapProps({
  permissions: props => props.relation.permissions.edges.map(edge => edge.node),
  relation: props => props.relation,
})(ModelPermissionsList)

export default Relay.createContainer(MappedPermissionsList, {
  fragments: {
    relation: () => Relay.QL`
      fragment on Relation {
        permissions(first: 100) {
          edges {
            node {
              id
              ${RelationPermissionComponent.getFragment('permission')}
            }
          }
        }
        ${RelationPermissionComponent.getFragment('relation')}
      }
    `,
  },
})
