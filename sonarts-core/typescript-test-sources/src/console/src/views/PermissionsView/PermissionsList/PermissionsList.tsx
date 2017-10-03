import * as React from 'react'
import * as Relay from 'react-relay'
import {Model} from '../../../types/types'
import mapProps from '../../../components/MapProps/MapProps'
import ModelPermissions from './ModelPermissions/ModelPermissions'
import {$p} from 'graphcool-styles'
import * as cx from 'classnames'
import ScrollBox from '../../../components/ScrollBox/ScrollBox'
import styled from 'styled-components'

interface Props {
  models: Model[]
  params: any
}

class PermissionsList extends React.Component<Props, {}> {
  render() {
    const {models, params} = this.props
    return (
        <div className={cx($p.bgWhite, $p.bt, $p.bBlack10, $p.b)}>
          {models.map((model, index) =>
            <ModelPermissions
              params={params}
              key={model.id}
              model={model}
              style={
                index === models.length - 1 ? {
                  marginBottom: 100,
                } : {}
              }
            />,
          )}
          {this.props.children}
        </div>
    )
  }
}

const MappedPermissionsList = mapProps({
  models: props => props.project.models.edges.map(edge => edge.node),
})(PermissionsList)

export default Relay.createContainer(MappedPermissionsList, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        name
        models(first: 100) {
          edges {
            node {
              id
              ${ModelPermissions.getFragment('model')}
            }
          }
        }
      }
    `,
  },
})
