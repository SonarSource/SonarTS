import * as React from 'react'
import {PricingPlan} from '../../types/types'
import {billingInfo} from './Billing/billing_info'
import {Icon} from 'graphcool-styles'
import {numberWithCommas} from '../../utils/utils'

interface Props {
  plan: PricingPlan
  isCurrentPlan: boolean
  isSelected?: boolean
  className?: string
  onSelectPlan?: Function
  isDisplayedInConfirmPlan?: boolean
}

export default class PricingColumn extends React.Component<Props, {}> {

  render() {

    if (this.props.plan === 'enterprise') {
      return (
        <div className={`container ${this.props.className || ''}`}>
            <style jsx={true}>{`
            .container {
              @p: .flex, .flexColumn, .itemsCenter, .bgGreen;
              padding-top: 30px;
              width: 170px;
            }

            .marginTop62 {
              margin-top: 62px;
            }
          `}</style>
          <div className='flex flexColumn itemsCenter'>
            <Icon
              src={require('../../assets/icons/enterprise.svg')}
              color='white'
              width={56}
              height={47}
            />
            <div
              className='fw6 f16 ttu mt25'
              style={{color: this.secondaryTextColor()}}
            >
              enterprise
            </div>
            <div className='white pt60 ph25 fw6 f14 tc'>
              Unlimited Nodes, Operations and Seats
            </div>
          </div>
          <div className='marginTop62'>
            {this.actionButton('Talk To Sales')}
          </div>
        </div>
      )
    }

    return (
      <div
        className={`pricingColumnContainer
          ${this.props.className || ''}
          ${this.props.isDisplayedInConfirmPlan && 'width220 mb16'}`}
        style={{backgroundColor: this.backgroundColor()}}
      >
        <style global jsx={true}>{`

          .pricingColumnContainer {
            @p: .flex, .flexColumn, .itemsCenter, .pb25, .br2;
            width: 170px;
            padding-top: 20px;
          }

          .pricingColumnHeader {
            @p: .flex, .flexColumn, .itemsCenter, .pb25, .bb;
          }

          .paddingTop5 {
            padding-top: 5px;
          }

          .width220 {
            width: 220px;
          }

        `}</style>

        <div
          className='pricingColumnHeader'
          style={{borderColor: this.secondaryTextColor()}}
        >
          <div
            className='fw6 f16 ttu'
            style={{color: this.secondaryTextColor()}}
          >
            {billingInfo[this.props.plan].name}
          </div>
          {this.priceTag()}
        </div>

        <div className='pv25'>

          <div className='flex'>
            <Icon
              className='paddingTop5'
              src={this.nodesIcon()}
              width={20}
              height={20}
            />
            <div className='ml10'>
              <div
                className='f16 fw6'
                style={{color: this.primaryTextColor()}}
              >
                {this.storage()}
              </div>
              <div
                className='f12'
                style={{color: this.primaryTextColor()}}
              >
                Nodes
              </div>
            </div>
          </div>

          <div className='flex pt10'>
            <Icon
              className='paddingTop5'
              src={this.requestsIcon()}
              width={20}
              height={20}
            />
            <div className='ml10'>
              <div
                className='f16 fw6'
                style={{color: this.primaryTextColor()}}
              >
                {this.numberOfRequests()}
              </div>
              <div
                className='f12'
                style={{color: this.primaryTextColor()}}
              >
                Operations
              </div>
            </div>
          </div>

          <div className='flex itemsCenter pt10'>
            <Icon
              className='paddingTop5'
              src={this.seatsIcon()}
              width={20}
              height={20}
            />
            <div
              className='ml10 mt6 f16 fw6'
              style={{color: this.primaryTextColor()}}
            >
              {this.numberOfSeats()}
            </div>
            <div
              className='ml6 mt6 f12'
              style={{color: this.primaryTextColor()}}
            >
              Seats
            </div>
          </div>

        </div>

        {this.actionButton()}

      </div>
    )
  }

  private actionButton = (title?: string): JSX.Element => {
    if (this.props.isCurrentPlan) {
      return (
        <div
          className='ph16 pv6 f14 fw6 ttu'
          style={{color: this.primaryTextColor()}}
        >Current Plan</div>
      )
    }

    const actionButtonTitle = title || (this.props.isDisplayedInConfirmPlan ? 'Change Plan' : 'Choose Plan')
    return (
      <div
        className='ph16 pv6 f14 fw6 ttu buttonShadow bgWhite pointer br2'
        style={{color: this.primaryTextColor()}}
        onClick={() => this.props.onSelectPlan(this.props.plan)}
      >{actionButtonTitle}</div>
    )
  }

  private backgroundColor = (): string => {

    if (this.props.isSelected) {
      return 'white'
    }

    if (this.props.isCurrentPlan) {
      return 'rgba(0,0,0,.04)'
    }

    switch (this.props.plan) {
      case '2017-02-free': return 'rgba(241,143,1,.1)'
      case '2017-02-project': return 'rgba(28,191,50,.07)'
      case '2017-02-startup': return 'rgba(28,191,50,.07)'
      case '2017-02-growth': return 'rgba(28,191,50,.07)'
      case 'enterprise': return 'rgba(39,174,96,1)'
      default: return ''
    }
  }

  private storage = () => {
    const storage = billingInfo[this.props.plan].maxStorage >= 1000 ?
      (billingInfo[this.props.plan].maxStorage / 1000) + ' GB' :
      billingInfo[this.props.plan].maxStorage + ' MB'
    return storage
  }

  private numberOfRequests = (): string => {
    const maxRequests = billingInfo[this.props.plan].maxRequests
    return numberWithCommas(maxRequests)
  }

  private numberOfSeats = (): string => {
    const maxSeats = billingInfo[this.props.plan].maxSeats
    if (maxSeats < 0) {
      return '∞'
    }
    return maxSeats.toString()
  }

  private primaryTextColor = (): string => {
    if (this.props.isCurrentPlan) {
      return 'rgba(0,0,0,.5)'
    }

    switch (this.props.plan) {
      case '2017-02-free': return 'rgba(241,143,1,1)'
      case '2017-02-project': return 'rgba(39,174,96,1)'
      case '2017-02-startup': return 'rgba(39,174,96,1)'
      case '2017-02-growth': return 'rgba(39,174,96,1)'
      case 'enterprise': return 'rgba(0,0,0,.5)'
      default: return ''
    }
  }

  private secondaryTextColor = (): string => {
    if (this.props.isCurrentPlan) {
      return 'rgba(0,0,0,.25)'
    }

    switch (this.props.plan) {
      case '2017-02-free': return 'rgba(241,143,1,.5)'
      case '2017-02-project': return 'rgba(28,191,50,.5)'
      case '2017-02-startup': return 'rgba(28,191,50,.5)'
      case '2017-02-growth': return 'rgba(28,191,50,.5)'
      case 'enterprise': return 'rgba(255,255,255,.5)'
      default: return ''
    }
  }

  private priceTag = (): JSX.Element => {
    if (this.props.plan === '2017-02-free') {
      return (
        <div
          className='f38 fw3'
          style={{color: this.primaryTextColor()}}
        >
          Free
        </div>
      )
    } else {
      const price = '$' + billingInfo[this.props.plan].price
      return (
        <div className='flex itemsEnd'>
          <div
            className='f38 fw3'
            style={{color: this.primaryTextColor()}}
          >
            {price}
          </div>
          <div
            className='f20'
            style={{color: this.secondaryTextColor()}}
          >
            /mo
          </div>
        </div>
      )
    }
  }

  private nodesIcon = () => {
    if (this.props.isCurrentPlan) {
      const icon = require('../../assets/icons/nodes_gray.svg')
      return icon
    }

    switch (this.props.plan) {
      case '2017-02-free': return require('../../assets/icons/nodes_orange.svg')
      case '2017-02-project': return require('../../assets/icons/nodes_green.svg')
      case '2017-02-startup': return require('../../assets/icons/nodes_green.svg')
      case '2017-02-growth': return require('../../assets/icons/nodes_green.svg')
      default: return ''
    }
  }

  private requestsIcon = () => {
    if (this.props.isCurrentPlan) {
      const icon = require('../../assets/icons/requests_gray.svg')
      return icon
    }

    switch (this.props.plan) {
      case '2017-02-free': return require('../../assets/icons/requests_orange.svg')
      case '2017-02-project': return require('../../assets/icons/requests_green.svg')
      case '2017-02-startup': return require('../../assets/icons/requests_green.svg')
      case '2017-02-growth': return require('../../assets/icons/requests_green.svg')
      default: return ''
    }
  }

  private seatsIcon = () => {
    if (this.props.isCurrentPlan) {
      const icon = require('../../assets/icons/requests_gray.svg')
      return icon
    }

    switch (this.props.plan) {
      case '2017-02-free': return require('../../assets/icons/requests_orange.svg')
      case '2017-02-project': return require('../../assets/icons/requests_green.svg')
      case '2017-02-startup': return require('../../assets/icons/requests_green.svg')
      case '2017-02-growth': return require('../../assets/icons/requests_green.svg')
      default: return ''
    }
  }

}
