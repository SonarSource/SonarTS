import * as React from 'react'
import {$v, Icon} from 'graphcool-styles'
import {Cardinality} from '../../types/types'

interface Props {
  selectedCartinality: Cardinality
  didSelectCardinality: Function
}

export default class CardinalitySelection extends React.Component<Props, {}> {

  render() {

    const y = (this.yForCardinality(this.props.selectedCartinality) + 51) + 'px'
    const oneToOne = require('../../assets/icons/one_to_one.svg')
    const oneToOneGreen = require('../../assets/icons/one_to_one_green.svg')
    const oneToMany = require('../../assets/icons/one_to_many.svg')
    const oneToManyGreen = require('../../assets/icons/one_to_many_green.svg')
    const manyToMany = require('../../assets/icons/many_to_many.svg')
    const manyToManyGreen = require('../../assets/icons/many_to_many_green.svg')

    return (
      <div className='container move' style={{transform: 'translateY(' + y + ')'}}>
        <style jsx={true}>{`

          .container {
            @inherit: .flex, .flexColumn, .mh16;
          }

          .move {
            transition: .25s linear all;
          }

        `}</style>
        <div
          className='pointer'
          onClick={() => this.props.didSelectCardinality('ONE_TO_ONE')}
        >
          <Icon
            src={this.props.selectedCartinality === 'ONE_TO_ONE' ? oneToOneGreen : oneToOne}
            width={31}
            height={30}
          />
        </div>
        <div
          className='pointer'
          onClick={() => this.props.didSelectCardinality('ONE_TO_MANY')}
        >
          <Icon
            className='pv6'
            src={this.props.selectedCartinality === 'ONE_TO_MANY' ? oneToManyGreen : oneToMany}
            width={31}
            height={30}
          />
        </div>
        <div
          className='pointer'
          onClick={() => this.props.didSelectCardinality('MANY_TO_ONE')}
        >
          <Icon
            className='pv6'
            src={this.props.selectedCartinality === 'MANY_TO_ONE' ? oneToManyGreen : oneToMany}
            width={31}
            height={30}
            rotate={180}
          />
        </div>
        <div
          className='pointer'
          onClick={() => this.props.didSelectCardinality('MANY_TO_MANY')}
        >
          <Icon
            className='pv6'
            src={this.props.selectedCartinality === 'MANY_TO_MANY' ? manyToManyGreen : manyToMany}
            width={31}
            height={30}
          />
        </div>
      </div>
    )
  }

  private yForCardinality = (cardinality: Cardinality) => {
    switch (cardinality) {
      case 'ONE_TO_ONE': return 64
      case 'ONE_TO_MANY': return 27
      case 'MANY_TO_ONE': return -15
      case 'MANY_TO_MANY': return -57
      default: return 0
    }
  }

}
