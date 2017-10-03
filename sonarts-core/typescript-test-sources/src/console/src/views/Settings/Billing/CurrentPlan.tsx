import * as React from 'react'
import {Link} from 'react-router'
import {Viewer} from '../../../types/types'
import {billingInfo} from './billing_info'

interface State {

}

interface Props {
  exceedsAllowedStorage?: boolean
  exceedsAllowedRequests?: boolean
  plan: string
  viewer?: Viewer
  projectName: string
}

export default class CurrentPlan extends React.Component<Props, State> {

  state = {}

  render() {

    const {exceedsAllowedStorage, exceedsAllowedRequests, plan} = this.props

    const planInfoBoxColors = exceedsAllowedStorage || exceedsAllowedRequests ? 'redTitle' : 'greenTitle'
    const actionButtonColor = exceedsAllowedStorage || exceedsAllowedRequests ? 'blue' : 'black50'

    let exceedingIndicationString = ''
    if (exceedsAllowedStorage && exceedsAllowedRequests) {
      exceedingIndicationString = 'storage space and requests'
    } else if (exceedsAllowedStorage && !exceedsAllowedRequests) {
      exceedingIndicationString = 'storage space'
    } else if (exceedsAllowedRequests && !exceedsAllowedStorage) {
      exceedingIndicationString = 'requests'
    }

    return (
      <div className='flex flexColumn itemsCenter'>
        {(exceedsAllowedStorage || exceedsAllowedRequests) &&
        <div className='pt60 ph96'>
          <div className='fw3 f25 red tc mb25'>You ran out of {exceedingIndicationString}.</div>
          <div className='f16 red o60 tc'>
            In order to continue using graph.cool,
            you need to either reduce the traffic of your app,
            or upgrade your plan.
          </div>
        </div>
        }
        <div className='container'>
          <style jsx={true}>{`

          .container {
            @p: .flex, .justifyBetween, .itemsCenter, .w100, .pa38, .br2;
          }

          .title {
            @p: .fw3, .f25;
          }

          .redTitle {
            @p: .red;
            background-color: rgba(242,92,84,.1);
          }

          .greenTitle {
            @p: .green, .bgLightgreen10;
          }

          .actionButton {
            @p: .pa10, .buttonShadow, .ttu, .f14, .fw6, .black50, .bgWhite, .pointer;
          }

        `}</style>

          <div className={`container ${planInfoBoxColors}`}>
            <div className={`title`}>{billingInfo[plan].name}</div>
            <Link
              to={`/${this.props.projectName}/settings/billing/change-plan/${this.props.plan}`}
            >
              <div className={`actionButton ${actionButtonColor}`}>
                {plan.includes('free') ? 'Upgrade' : 'Change'} Plan
              </div>
            </Link>
          </div>
        </div>
      </div>

    )
  }

}
