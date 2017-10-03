import * as React from 'react'
import {$v, Icon} from 'graphcool-styles'
import {numberWithCommas, numberWithCommasRounded, daysInMonth} from '../../../utils/utils'
import {PricingPlan} from '../../../types/types'
import {billingInfo} from './billing_info'

interface Props {
  plan: PricingPlan
  currentNumberOfRequests: number
  additionalCosts: number
}

export default class RequestUsageIndicator extends React.Component<Props, {}> {

  render() {
    const maxRequests = billingInfo[this.props.plan].maxRequests
    const maxString = numberWithCommas(maxRequests)
    const currentNumberOfRequestsString = numberWithCommas(this.props.currentNumberOfRequests)
    const icon = this.icon()
    const usedPercent = (this.props.currentNumberOfRequests / billingInfo[this.props.plan].maxRequests) * 100
    const estimatedPercent = (this.calculateEstimatedRequests() / billingInfo[this.props.plan].maxRequests) * 100
    const usedRequestsColor = this.barColor(1)
    const estimatedRequestsColor = this.barColor(.5)
    return (
      <div className='container'>
        <style jsx={true}>{`
          .container {
            @p: .hS16, .mt38, .mb25;
          }
        `}</style>
        <div
          className='w100 h100 mb10 br2'
          style={{
            background: `linear-gradient(to right,
              ${this.barColor(1)} 0%,
              ${this.barColor(1)} ${usedPercent}%,
              ${this.barColor(.5)} ${usedPercent}%,
              ${this.barColor(.5)} ${estimatedPercent}%,
              ${this.barColor(.1)} ${estimatedPercent}%,
              ${this.barColor(.1)} 100%)`,
        }}></div>
        <div className='flex itemsCenter justifyBetween mt16'>
          <div className='flex itemsCenter'>
            <Icon
              src={icon}
              width={20}
              height={20}
            />
            <div
              className={`ml6 f14 fw6`}
              style={{color: usedRequestsColor}}
            >{currentNumberOfRequestsString}</div>
            <div className='ml6 black50 f14'> / {maxString}</div>
          </div>
          {this.props.additionalCosts > 0 &&
            <div className={`f14 fw6 blue`}>{'+ $' + this.props.additionalCosts.toFixed(2)}</div>}
        </div>
        <div
          className='f14 fw6'
          style={{
            color: estimatedRequestsColor,
            paddingLeft: '27px',
          }}
        >~{numberWithCommasRounded(this.calculateEstimatedRequests(), 0)} estimated</div>
      </div>
    )
  }

  private calculateEstimatedRequests = () => {
    const today = new Date()
    const dd = today.getDate()
    const mm = today.getMonth() + 1
    const yyyy = today.getFullYear()
    const daysInCurrentMonth = daysInMonth(mm, yyyy)

    const avgRequestsPerDay = this.props.currentNumberOfRequests / dd
    const daysLeftInCurrentMonth = daysInCurrentMonth - dd
    const estimateForRestOfMonth = daysLeftInCurrentMonth * avgRequestsPerDay
    return this.props.currentNumberOfRequests + estimateForRestOfMonth
  }

  private estimatedPercentageOfTotal = () => {
    const total = billingInfo[this.props.plan].maxRequests
    const estimated = this.calculateEstimatedRequests()
    const ratio = total / estimated
    return ratio
  }

  private barColor = (opacity: number) => {
    if (this.props.plan.includes('free')) {
      const maxRequests = billingInfo[this.props.plan].maxRequests
      const estimatedRequests = this.calculateEstimatedRequests()
      if (this.props.currentNumberOfRequests > maxRequests) {
        return `rgba(242,92,84,${opacity})`
      } else if (estimatedRequests > maxRequests) {
        return `rgba(207,92,54,${opacity})`
      } else {
        return `rgba(39,174,96,${opacity})`
      }
    }
    return `rgba(42,126,210,${opacity})`
  }

  private icon = () => {
    if (this.props.plan.includes('free')) {
      const maxRequests = billingInfo[this.props.plan].maxRequests
      const estimatedRequests = this.calculateEstimatedRequests()
      if (this.props.currentNumberOfRequests > maxRequests) {
        return require('../../../assets/icons/operations_red.svg')
      } else if (estimatedRequests > maxRequests) {
        return require('../../../assets/icons/operations_orange.svg')
      } else {
        return require('../../../assets/icons/operations_green.svg')
      }
    }
    return require('../../../assets/icons/operations_blue.svg')
  }

}
