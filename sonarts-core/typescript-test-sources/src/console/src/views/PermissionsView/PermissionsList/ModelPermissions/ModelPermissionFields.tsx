import * as React from 'react'
import * as Relay from 'react-relay'
import {ModelPermission, Field} from '../../../../types/types'
import {$p, variables} from 'graphcool-styles'
import * as cx from 'classnames'
import mapProps from '../../../../components/MapProps/MapProps'
import PermissionField from './PermissionField'
import styled from 'styled-components'
import ScrollBox from '../../../../components/ScrollBox/ScrollBox'
import {validPermissionField} from '../../../../utils/valueparser'

interface Props {
  permission: ModelPermission
  fields: Field[]
}

const Container = styled.div`
  &:after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 100%;
    background-color: ${variables.gray10};
    /* Permalink - use to edit this gradient: http://colorzilla.com/gradient-editor/#ffffff+0,ffffff+100&0+0,1+100 */
    background: -moz-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%);
    background: -webkit-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%);
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%);
  }
`

const InnerContainer = styled.div`
  &::-webkit-scrollbar {
   display: none;
  }
`

class ModelPermissionFields extends React.Component<Props, {}> {
  render() {
    const {permission: {fieldIds, applyToWholeModel, isActive}, fields} = this.props
    return (
      fields && fields.length > 0 && (
        <Container className={cx($p.flexAuto, $p.relative, $p.overflowHidden)}>
          <InnerContainer
            className={cx($p.relative, $p.flex, $p.flex1, $p.flexRow, $p.ml16, $p.itemsCenter, $p.overflowAuto)}
          >
            <div className={cx($p.black50, $p.fw6)}>
              {applyToWholeModel ? (
                'in all Fields'
              ) : (
                'in'
              )}
            </div>
            {!applyToWholeModel && fields.map(field =>
              <PermissionField
                key={field.id}
                disabled={!fieldIds.includes(field.id) || !isActive}
                field={field}
                className={$p.ml10}
              />,
            )}
          </InnerContainer>
        </Container>
      )
    )
  }
}

const MappedModelPermissionFields = mapProps({
  // filter out all relations
  fields: props => {
    return props.model.fields.edges.reduce(
      (list, edge) => {
        const {node} = edge
        if (validPermissionField(props.permission.operation, node)) {
          return list.concat(node)
        }

        return list
      },
      [],
    )
  },
})(ModelPermissionFields)

export default Relay.createContainer(MappedModelPermissionFields, {
  fragments: {
    permission: () => Relay.QL`
      fragment on ModelPermission {
        fieldIds
        operation
        applyToWholeModel
        isActive
      }
    `,
    model: () => Relay.QL`
      fragment on Model {
        fields(first: 100) {
          edges {
            node {
              id
              name
              isReadonly
              isList
              typeIdentifier
            }
          }
        }
      }
    `,
  },
})
