import * as React from 'react'
import {Model, Cardinality} from '../../types/types'
import {Icon} from 'graphcool-styles'
import {uppercaseFirstLetter} from '../../utils/utils'

interface Props {
  relationName: string | null
  leftSelectedModel: Model | null
  rightSelectedModel: Model | null
  selectedCardinality: Cardinality
  fieldOnLeftModelName: string | null
  fieldOnRightModelName: string | null
}

export default class MutationsInfoBox extends React.Component<Props, {}> {

  render() {
    return (
      <div className='container'>
        <style jsx={true}>{`
          .container {
            @inherit: .ba, .br2, .w100, .h100, .mb38;
            background-color: rgba(42,126,211,.04);
            border-color: rgba(42,126,211,.1);
          }

          .titleText {
            @inherit: .ml10, .blue, .f16;
            margin-top: -4px;
          }

        `}</style>
        <div className='flex pl16 pv16'>
          <Icon
            className='pointer'
            src={require('../../assets/icons/info_blue.svg')}
            width={19}
            height={19}
          />
          <div className='titleText'>
            Based on the relation name, the following mutations can be used to mutate the relation:
          </div>
        </div>
        {this.props.leftSelectedModel && this.props.rightSelectedModel && this.generateMutationInfo(true)}
        {this.props.leftSelectedModel && this.props.rightSelectedModel && this.generateMutationInfo(false)}
      </div>
    )
  }

  private generateMutationInfo = (set: boolean): JSX.Element => {
    let {relationName, fieldOnLeftModelName, fieldOnRightModelName,
      selectedCardinality, leftSelectedModel, rightSelectedModel} = this.props
    let relationPrefix
    if (selectedCardinality.startsWith('MANY') || selectedCardinality.endsWith('MANY')) {
      relationPrefix = set ? 'addTo' : 'removeFrom'
    } else {
      relationPrefix = set ? 'set' : 'unset'
    }
    relationName = relationName && relationName.length > 0 ? relationName : '[___]'
    const firstIdName = fieldOnRightModelName + leftSelectedModel.name + 'Id'
    const secondIdName = fieldOnLeftModelName + rightSelectedModel.name + 'Id'
    const payloadName = uppercaseFirstLetter(relationPrefix) + relationName + 'Payload'
    const mutationName = (<span className='blue'>{relationPrefix + relationName}</span>)
    const firstId = (<span className='purple'>{firstIdName}</span>)
    const secondId = (<span className='purple'>{secondIdName}</span>)
    const payload = (<span className='lightOrange'>{payloadName}</span>)
    const id =  (<span className='lightOrange'>ID</span>)
    return (
      <div className='ph16 pv8 black40 f16'>
        {mutationName}({firstId}: {id}!, {secondId}: {id}!): {payload}
      </div>
    )
  }
}
