import * as React from 'react'
import * as Relay from 'react-relay'
import {$p, $v} from 'graphcool-styles'
import * as cx from 'classnames'
import styled from 'styled-components'
import {Project, Model, SearchProviderAlgolia} from '../../../../types/types'
import {withRouter} from 'react-router'
import mapProps from '../../../../components/MapProps/MapProps'

interface Props {
  models: Model[]
  selectedModel: Model
  onModelSelected: (mode: Model) => void
  editing: boolean
}

const SelectedModel = styled.div`
  &:before {
    content: "";
    position: absolute;
    left: -2px;
    top: 2px;
    background: ${$v.blue};
    height: 30px;
    width: 6px;
    border-radius: 2px;
  }
`

class AlgoliaIndexPopupModels extends React.Component<Props, {}> {
  render() {
    const {models, selectedModel, onModelSelected, editing} = this.props
    return (
      editing ? (
          <div className={cx($p.pv25, $p.bgBlack04, $p.w50)}>
            <div className={cx($p.f14, $p.black30, $p.ttu, $p.fw6, $p.ph25)}>Model</div>
            <SelectedModel
              className={cx(
                $p.f16,
                $p.fw6,
                $p.pv4,
                $p.black60,
                $p.relative,
                $p.overflowHidden,
                $p.ph25,
                $p.mt16,
              )}
            >{selectedModel.name}</SelectedModel>
          </div>
        ) : (
          <div className={cx($p.pv25, $p.bgBlack04, $p.w50)}>
            <div className={cx($p.f14, $p.black30, $p.ttu, $p.fw6, $p.ph25)}>Models</div>
            <div className={cx($p.mt16)}>
              {models.map(model => (
                model.id === selectedModel.id ? (
                  <SelectedModel
                    className={cx(
                      $p.f16,
                      $p.fw6,
                      $p.pv4,
                      $p.black60,
                      $p.relative,
                      $p.overflowHidden,
                      $p.ph25,
                      $p.pointer,
                    )}
                    key={model.id}
                    onClick={() => onModelSelected(model)}
                  >{model.name}</SelectedModel>
                  ) : (
                    <div
                      className={cx(
                        $p.f16,
                        $p.fw6,
                        $p.pv4,
                        $p.black30,
                        $p.ph25,
                        $p.pointer,
                      )}
                      key={model.id}
                      onClick={() => onModelSelected(model)}
                    >{model.name}</div>
                  )
              ))}
            </div>
          </div>
        )
    )
  }
}

const MappedAlgoliaIndexPopupModels = mapProps({
  models: props => props.project.models.edges.map(edge => edge.node),
})(withRouter(AlgoliaIndexPopupModels))

export default Relay.createContainer(MappedAlgoliaIndexPopupModels, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        models(first: 100) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
  },
})
