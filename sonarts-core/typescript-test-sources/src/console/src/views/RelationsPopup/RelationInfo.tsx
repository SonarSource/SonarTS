import * as React from 'react'
import {$v, Icon} from 'graphcool-styles'
import {Relation, Model, Cardinality} from '../../types/types'
import {lowercaseFirstLetter} from '../../utils/utils'

interface Props {
  leftModel?: Model
  rightModel?: Model
  cardinality?: Cardinality
  fieldOnLeftModelName: string
  fieldOnRightModelName: string
}

interface State {
  expanded: boolean
}

export default class RelationInfo extends React.Component<Props, State> {

  state = {
    expanded: false,
  }

  render() {
    return !this.state.expanded ?
      (
        <div className='flex justifyEnd pr16 pb16 mt10 h100'>
          <div
            className={`pointer ${(!this.props.leftModel || !this.props.rightModel) && 'o0'}`}
            onClick={() => this.setState({expanded: true})}
          >
            <Icon
              src={require('../../assets/icons/info_blue.svg')}
              width={29}
              height={29}
            />
          </div>
        </div>
      )
      :
      (
        <div className='pb38 mh16'>

          <div className='container'>
            <style jsx={true}>{`

              .container {
                @inherit: .ba, .br2, .w100, .h100;
                /* background-color: rgba(42,126,211,.04); */
                background-color: rgba(246,250,254,1);
                border-color: rgba(42,126,211,.1);
              }

              .titleText {
                @inherit: .ml16, .blue, .f16;
                margin-top: -6px;
              }

            `}</style>
            <div className='flex pl16 pv16'>
              <Icon
                className='pointer'
                src={require('../../assets/icons/info_blue.svg')}
                width={19}
                height={19}
                onClick={() => this.setState({expanded: false} as State)}
              />
              <div className='titleText'>
                {this.generateFirstInfoSentence()}
                {this.generateSecondInfoSentence()}
                {this.generateThirdInfoSentence()}
              </div>
            </div>
          </div>
        </div>
      )
  }

  private generateFirstInfoSentence = (): JSX.Element => {
    const {cardinality, leftModel, rightModel} = this.props
    const firstCardinality = cardinality.startsWith('ONE') ? 'One' : 'Many'
    const isOrAre = firstCardinality === 'Many' ? 'are' : 'is'
    const secondCardinality = cardinality.endsWith('ONE') ? 'one' : 'many'
    const firstModel = cardinality.startsWith('ONE') ? leftModel.name : leftModel.namePlural
    const secondModel = cardinality.endsWith('ONE') ? rightModel.name : rightModel.namePlural
    return (
      <div className='infoLine'>
        <style jsx={true}>{`
          .infoLine {
            @inherit: .pv4, .f16, .black50, .nowrap;
          }
        `}</style>
        <span className='green'>{firstCardinality + ' '}</span>
        <span className='blue'>{firstModel + ' '}</span>
        <span>{isOrAre} related to </span>
        <span className='green'>{secondCardinality + ' '}</span>
        <span className='blue'>{secondModel }</span>
      </div>
    )
  }

  private generateSecondInfoSentence = (): JSX.Element => {
    const {cardinality, leftModel, rightModel} = this.props
    const firstModelName = leftModel.name + '\'s'
    const oneOrMany = cardinality.endsWith('MANY') ? 'many' : 'one'
    const secondModelName = cardinality.endsWith('MANY') ? rightModel.namePlural : rightModel.name
    return (
      <div className='infoLine'>
        <style jsx={true}>{`
          .infoLine {
            @inherit: .pv4, .f16, .black50, .nowrap;
          }
          .purpleColor {
            color: rgba(164,3,111,1);
          }

        `}</style>
        <span className='blue'>{firstModelName + ' '}</span>
        <span>field</span>
        <span className='purpleColor'>{' ' + this.props.fieldOnLeftModelName + ' '}</span>
        <span>represents</span>
        <span className='green'>{' ' + oneOrMany + ' '}</span>
        <span className='blue'>{secondModelName}</span>
      </div>
    )
  }

  private generateThirdInfoSentence = (): JSX.Element => {
    const {cardinality, leftModel, rightModel} = this.props
    const firstModelName = rightModel.name + '\'s'
    const oneOrMany = cardinality.startsWith('MANY') ? 'many' : 'one'
    const secondModelName = cardinality.startsWith('MANY') ? leftModel.namePlural : leftModel.name
    return (
      <div className='infoLine'>
        <style jsx={true}>{`
          .infoLine {
            @inherit: .pv4, .f16, .black50, .nowrap;
          }
          .purpleColor {
            color: rgba(164,3,111,1);
          }
        `}</style>
        <span className='blue'>{firstModelName + ' '}</span>
        <span>field</span>
        <span className='purpleColor'>{' ' + this.props.fieldOnRightModelName + ' '}</span>
        <span>represents</span>
        <span className='green'>{' ' + oneOrMany + ' '}</span>
        <span className='blue'>{secondModelName}</span>
      </div>
    )
  }

}
