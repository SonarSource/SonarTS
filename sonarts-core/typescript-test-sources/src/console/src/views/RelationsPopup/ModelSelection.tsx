import * as React from 'react'
import ModelSelectionBox from './ModelSelectionBox'
import CardinalitySelection from './CardinalitySelection'
import {Cardinality, Model} from '../../types/types'
import {lowercaseFirstLetter} from '../../utils/utils'
import {Icon, $v} from 'graphcool-styles'

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
  fieldOnLeftModelIsRequired: boolean
  fieldOnRightModelIsRequired: boolean
  didChangeFieldOnLeftModelIsRequired: (isRequired: boolean) => void
  didChangeFieldOnRightModelIsRequired: (isRequired: boolean) => void
  fieldOnLeftModelName: string | null
  fieldOnRightModelName: string | null
  leftInputIsBreakingChange: boolean
  rightInputIsBreakingChange: boolean
  leftModelIsBreakingChange: boolean
  rightModelIsBreakingChange: boolean
  forbiddenFieldNamesForLeftModel: string[]
  forbiddenFieldNamesForRightModel: string[]
  isBeta: boolean
}

export default class ModelSelection extends React.Component<Props, {}> {

  render() {
    return (
      <div className='container'>
        <style jsx={true}>{`
          .container {
            @inherit: .flex, .ph38, .pt16, .justifyBetween;
            height: 275px;
          }

          .greenLine {
            @inherit: .bgLightgreen20;
            height: 2px;
            width: 70px;
          }

          .topMargin20 {
            margin-top: 0px;
          }

          .container :global(.intro-arrow) {
            @p: .absolute;
            margin-top: -42px;
            margin-left: 32px;
          }
        `}</style>
        <div className={`flex itemsCenter ${this.props.selectedCardinality.startsWith('MANY') && 'topMargin20'}`}>
          <ModelSelectionBox
            many={this.props.selectedCardinality.startsWith('MANY')}
            models={this.props.models}
            didSelectedModel={this.props.didSelectLeftModel}
            selectedModel={this.props.leftSelectedModel}
            relatedFieldName={this.props.fieldOnLeftModelName}
            relatedFieldType={this.props.rightSelectedModel && this.props.leftFieldType}
            didChangeFieldName={this.props.didChangeFieldNameOnLeftModel}
            inputIsBreakingChange={this.props.leftInputIsBreakingChange}
            modelIsBreakingChange={this.props.leftModelIsBreakingChange}
            forbiddenFieldNames={this.props.forbiddenFieldNamesForLeftModel}
            isRequired={this.props.fieldOnLeftModelIsRequired}
            didChangeIsRequired={this.props.didChangeFieldOnLeftModelIsRequired}
            isBeta={this.props.isBeta}
            singleCardinality={!this.props.selectedCardinality.endsWith('MANY')}
          />
          <div className='greenLine' />
        </div>
        <CardinalitySelection
          selectedCartinality={this.props.selectedCardinality}
          didSelectCardinality={this.props.didSelectCardinality}
        />
        <div
          className={`relative flex itemsCenter ${this.props.selectedCardinality.endsWith('MANY') && 'topMargin20'}`}
        >
          <div className='greenLine' />
          {!this.props.rightSelectedModel && (
            <Icon
              width={24}
              height={24}
              src={require('graphcool-styles/icons/fill/fullArrowRight.svg')}
              color={$v.blue50}
              className='intro-arrow'
            />
          )}
          <ModelSelectionBox
            many={this.props.selectedCardinality.endsWith('MANY')}
            models={this.props.models}
            didSelectedModel={this.props.didSelectRightModel}
            selectedModel={this.props.rightSelectedModel}
            relatedFieldName={this.props.fieldOnRightModelName}
            relatedFieldType={this.props.leftSelectedModel && this.props.rightFieldType}
            didChangeFieldName={this.props.didChangeFieldNameOnRightModel}
            inputIsBreakingChange={this.props.rightInputIsBreakingChange}
            modelIsBreakingChange={this.props.rightModelIsBreakingChange}
            forbiddenFieldNames={this.props.forbiddenFieldNamesForRightModel}
            isRequired={this.props.fieldOnRightModelIsRequired}
            didChangeIsRequired={this.props.didChangeFieldOnRightModelIsRequired}
            isBeta={this.props.isBeta}
            singleCardinality={!this.props.selectedCardinality.startsWith('MANY')}
          />
        </div>
      </div>
    )
  }

}
