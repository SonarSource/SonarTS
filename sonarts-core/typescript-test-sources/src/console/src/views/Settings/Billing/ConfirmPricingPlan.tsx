import * as React from 'react'
import {Viewer} from '../../../types/types'
import PopupWrapper from '../../../components/PopupWrapper/PopupWrapper'
import {withRouter} from 'react-router'
import {Icon} from 'graphcool-styles'
import CreditCardInputSection from './CreditCardInputSection'
import * as Relay from 'react-relay'
import Loading from '../../../components/Loading/Loading'

interface State {
  isLoading: boolean
}

interface Props {
  router: ReactRouter.InjectedRouter
  viewer: Viewer
  projectName: string
  params: any
}

class ConfirmPricingPlan extends React.Component<Props, State> {

  state = {
    isLoading: false,
  }

  render() {

    const project = this.props.viewer.crm.crm.customer.projects.edges.find(edge => {
      return edge.node.name === this.props.projectName
    }).node
    const creditCard = project.projectBillingInformation.creditCard
    const subtitle = creditCard ? 'Please click the button to purchase your new plan.' :
      'Please enter your credit card information to proceed.'

    return (
      <PopupWrapper
        onClickOutside={this.close}
      >
        <style jsx={true}>{`
          .container {
            @p: .bgWhite;
            width: 800px;
          }

          .overlay {
            @p: .absolute, .flex, .itemsCenter, .justifyCenter, .z999;
            top: 0px;
            bottom: 0px;
            left: 0px;
            right: 0px;
            background-color: rgb(250,250,250);
            width: 800px;
          }

        `}</style>

        <div className='flex itemsCenter justifyCenter w100 h100 bgWhite90'>

          <div className='container buttonShadow relative'>

            {this.state.isLoading ?

              <div className='overlay'>
                <Loading />
              </div>

              :

              <div className='flex flexColumn itemsCenter'>
                <div
                  className='flex justifyEnd w100 pointer pt38'
                  onClick={() => this.close()}
                >
                  <Icon
                    className='mh25 closeIcon'
                    src={require('../../../assets/icons/close_modal.svg')}
                    width={25}
                    height={25}
                  />
                </div>
                <div className='f38 fw3'>Confirm plan</div>
                <div className='f16 black50 mt10 mb38'>{subtitle}</div>
                <CreditCardInputSection
                  plan={this.props.params.plan}
                  projectId={this.props.viewer.project.id}
                  projectName={this.props.params.projectName}
                  goBack={this.goBack}
                  setLoading={this.setLoading}
                  close={this.close}
                  viewer={this.props.viewer}
                />
              </div>
            }

          </div>

        </div>
      </PopupWrapper>
    )
  }

  private close = () => {
    this.props.router.goBack()
    this.props.router.goBack()
  }

  private goBack = () => {
    this.props.router.goBack()
  }

  private setLoading = (isLoading: boolean) => {
    this.setState({isLoading: isLoading})
  }

}

export default Relay.createContainer(withRouter(ConfirmPricingPlan), {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        project: projectByName(projectName: $projectName) {
          id
        },
        crm: user {
          name
          crm {
            customer {
              id
              projects(first: 1000) {
                edges {
                  node {
                    name
                    projectBillingInformation {
                      creditCard {
                        last4
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        },
        ${CreditCardInputSection.getFragment('viewer')}
      }
    `},
})
