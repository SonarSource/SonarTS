import * as React from 'react'
import {withRouter} from 'react-router'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {GettingStartedState} from '../../../types/gettingStarted'
import {nextStep, skip} from '../../../actions/gettingStarted'

interface Props {
  params: any
  router: ReactRouter.InjectedRouter
  nextStep: () => any
  skip: any
  gettingStartedState: GettingStartedState
  firstName: string
  id: string
}

class OnboardingPopup extends React.Component<Props, {}> {

  render() {
    return (
      <div
        className='flex justify-center items-center h-100 bg-white-90'
        style={{ pointerEvents: 'all', width: 'calc(100% - 266px)' }}
      >
        <div className='bg-white br-2 flex shadow-2' style={{ maxWidth: 'calc(90vw - 266px)' }}>
          <div className='w-70 pa-60 tc fw1'>
            <div className='ttu' style={{ letterSpacing: 2 }}>Getting Started</div>
            <div className='f-38 lh-1-4 mv-25'>
              Let's build a GraphQL backend<br />
              for Instagram in 5 minutes
            </div>
            <div className='lh-1-4 mv-16'>
              Hi {this.props.firstName}, let's get started by building a backend for a simple Instagram clone.{' '}
              To keep our example light, our Instagram posts only consist of a picture and some hashtags.{' '}
              After setting up the schema and creating some example posts,{' '}
              we are ready to put the backend to work and query all posts that contain a specific hashtag.
            </div>
            <div className='w-100 flex justify-center flex-column items-center'>
              <div
                className='br-2 mv-25 bg-accent white f-25 pv-16 ph-96 fw4 pointer ttu'
                onClick={this.getStarted}
              >
                Start Onboarding
              </div>
              <div
                className='mt3 underline pointer dim'
                onClick={this.skipGettingStarted}
              >
                Skip
              </div>
            </div>
          </div>
          <div className='w-30 bg-black-05 pv-38 flex justify-center'>
            <img src={require('../../../assets/graphics/instagram.svg')}/>
          </div>
        </div>
      </div>
    )
  }

  private skipGettingStarted = (): void => {
    graphcoolConfirm('You are skipping the getting started tour.')
      .then(() => {
        // TODO: fix this hack
        Promise.resolve(this.props.skip())
          .then(() => {
            this.props.router.replace(`/${this.props.params.projectName}/models`)
          })
      })
  }

  private getStarted = (): void => {
    if (this.props.gettingStartedState.isCurrentStep('STEP0_OVERVIEW')) {
      this.props.nextStep()
    }
  }

}

const mapStateToProps = (state) => {
  return {
    gettingStartedState: state.gettingStarted.gettingStartedState,
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({nextStep, skip}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(OnboardingPopup))
