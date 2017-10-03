import * as React from 'react'
import RequestUsageIndicator from './RequestUsageIndicator'
import UsedSeats from './Seats'
import NodeUsageIndicator from './NodeUsageIndicator'
import {$v} from 'graphcool-styles'
import {billingInfo} from './billing_info'
import {PricingPlan} from '../../../types/types'
import {todayString} from '../../../utils/utils'

interface Props {
  plan: PricingPlan

  usedSeats: string[]

  lastInvoiceDate: string

  currentNumberOfRequests: number
  usedStoragePerDay: number[]

  overageRequests: number
  overageStorage: number
}

export default class Usage extends React.Component<Props, {}> {

  render() {

    const maxSeats = billingInfo[this.props.plan].maxSeats

    const period = '(' + this.props.lastInvoiceDate + ' - ' + todayString() + ')'

    return (
      <div className='container'>
        <style jsx={true}>{`

          .container {
            @p: .flex, .flexColumn, .ph60;
          }

          .title {
            @p: .black30, .fw6, .f14, .ttu;
          }

        `}</style>
        <div className='title'>{'Usage ' + period}</div>
        <NodeUsageIndicator
          plan={this.props.plan}
          usedStoragePerDay={this.props.usedStoragePerDay}
          additionalCosts={this.calculateAdditionalCostsForStorage()}
        />
        <RequestUsageIndicator
          plan={this.props.plan}
          currentNumberOfRequests={this.props.currentNumberOfRequests}
          additionalCosts={this.calculateAdditionalCostsForRequests()}
        />
        {this.calculateTotalOverageCosts() > 0 &&
        <div
          className='w100 ttu f14 flex justifyEnd'
        >
          <div className='bt tr pt6'
               style={{
            borderColor: $v.blue50,
            color: $v.blue50,
            width: '200px',
            marginTop: '38px',
          }}
          >
            Overage total <span className='blue fw6 ml6'>  + ${(this.calculateTotalOverageCosts()).toFixed(2)}</span>
          </div>
        </div>}
        <UsedSeats
          className={`mb38 ${this.calculateAdditionalCostsForRequests() > 0 ? 'mt25' : 'mt96'}`}
          seats={this.props.usedSeats}
          maxSeats={maxSeats}
        />
      </div>
    )
  }

  private calculateTotalOverageCosts = (): number => {
    return this.calculateAdditionalCostsForStorage() + this.calculateAdditionalCostsForRequests()
  }

  private calculateAdditionalCostsForRequests = () => {
    const pricePerAdditionalRequest = billingInfo[this.props.plan].pricePerThousandAdditionalRequests
    const penaltyFactor = Math.ceil((this.props.overageRequests / 1000))
    const sum = penaltyFactor * pricePerAdditionalRequest
    const sumInDollars = sum / 100
    return sumInDollars
  }

  private calculateAdditionalCostsForStorage = () => {
    const pricePerAdditionalNode = billingInfo[this.props.plan].pricePerAdditionalMB
    const penaltyFactor = Math.ceil((this.props.overageStorage / 1000))
    const sum = penaltyFactor * pricePerAdditionalNode
    const sumInDollars = sum / 100
    return sumInDollars
  }

}
