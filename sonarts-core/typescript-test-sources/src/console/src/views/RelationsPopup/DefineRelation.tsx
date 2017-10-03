import * as React from 'react'
import ModelSelection from './ModelSelection'
import RelationInfo from './RelationInfo'
import {Model, Cardinality} from '../../types/types'

interface Props {
  models: Model[]
  leftSelectedModel: Model | null
  rightSelectedModel: Model | null
  selectedCardinality: Cardinality
  didSelectLeftModel: Function
  didSelectRightModel: Function
  didSelectCardinality: Function
  rightFieldName: string
  rightFieldType: string
  leftFieldName: string
  leftFieldType: string
  didChangeFieldNameOnLeftModel: (newFieldName: string) => void
  didChangeFieldNameOnRightModel: (newFieldName: string) => void
  fieldOnLeftModelName: string | null
  fieldOnRightModelName: string | null
  fieldOnLeftModelIsRequired: boolean
  fieldOnRightModelIsRequired: boolean
  didChangeFieldOnLeftModelIsRequired: (isRequired: boolean) => void
  didChangeFieldOnRightModelIsRequired: (isRequired: boolean) => void
  leftInputIsBreakingChange: boolean
  rightInputIsBreakingChange: boolean
  leftModelIsBreakingChange: boolean
  rightModelIsBreakingChange: boolean
  forbiddenFieldNamesForLeftModel: string[]
  forbiddenFieldNamesForRightModel: string[]
  isBeta: boolean
}

export default class DefineRelation extends React.Component<Props, {}> {

  render() {
    return (
      <div className='bgBlack02'>
        <ModelSelection
          models={this.props.models}
          leftSelectedModel={this.props.leftSelectedModel}
          rightSelectedModel={this.props.rightSelectedModel}
          selectedCardinality={this.props.selectedCardinality}
          didSelectLeftModel={this.props.didSelectLeftModel}
          didSelectRightModel={this.props.didSelectRightModel}
          didSelectCardinality={this.props.didSelectCardinality}
          rightFieldName={this.props.rightFieldName}
          rightFieldType={this.props.rightFieldType}
          leftFieldName={this.props.leftFieldName}
          leftFieldType={this.props.leftFieldType}
          didChangeFieldNameOnLeftModel={this.props.didChangeFieldNameOnLeftModel}
          didChangeFieldNameOnRightModel={this.props.didChangeFieldNameOnRightModel}
          fieldOnLeftModelName={this.props.fieldOnLeftModelName}
          fieldOnRightModelName={this.props.fieldOnRightModelName}
          leftInputIsBreakingChange={this.props.leftInputIsBreakingChange}
          rightInputIsBreakingChange={this.props.rightInputIsBreakingChange}
          leftModelIsBreakingChange={this.props.leftModelIsBreakingChange}
          rightModelIsBreakingChange={this.props.rightModelIsBreakingChange}
          forbiddenFieldNamesForLeftModel={this.props.forbiddenFieldNamesForLeftModel}
          forbiddenFieldNamesForRightModel={this.props.forbiddenFieldNamesForRightModel}
          fieldOnLeftModelIsRequired={this.props.fieldOnLeftModelIsRequired}
          fieldOnRightModelIsRequired={this.props.fieldOnRightModelIsRequired}
          didChangeFieldOnLeftModelIsRequired={this.props.didChangeFieldOnLeftModelIsRequired}
          didChangeFieldOnRightModelIsRequired={this.props.didChangeFieldOnRightModelIsRequired}
          isBeta={this.props.isBeta}
        />
        <RelationInfo
          leftModel={this.props.leftSelectedModel}
          rightModel={this.props.rightSelectedModel}
          cardinality={this.props.selectedCardinality}
          fieldOnLeftModelName={this.props.fieldOnLeftModelName}
          fieldOnRightModelName={this.props.fieldOnRightModelName}
        />
      </div>
    )
  }

}
