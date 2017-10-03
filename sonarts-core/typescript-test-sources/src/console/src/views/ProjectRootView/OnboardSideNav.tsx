import * as React from 'react'
import {classnames} from '../../utils/classnames'
import {withRouter} from 'react-router'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {nextStep, previousStep, skip, showCurrentStep} from '../../actions/gettingStarted'
import {GettingStartedState, Step} from '../../types/gettingStarted'
import {Icon} from 'graphcool-styles'

interface Props {
  params: any
  router: ReactRouter.InjectedRouter
  gettingStartedState: GettingStartedState
  nextStep: () => Promise<any>
  previousStep: () => Promise<any>
  skip: () => Promise<any>
  showCurrentStep: (router: ReactRouter.InjectedRouter, params: any) => void
}

interface StepData {
  index: number
  text: string
}

class OnboardSideNav extends React.Component<Props, {}> {

  render() {
    const progress = 100 * this.props.gettingStartedState.progress.index / 5

    return (
      <div className='flex flex-column' style={{maxWidth: 300}}>
        <div className='relative flexAuto'>
          <div
            className='absolute o-30 pointer'
            style={{ top: 25, right: 25 }}
            onClick={this.skipGettingStarted}
          >
            <Icon width={13} height={13} color='#000' src={require('assets/new_icons/close.svg')}/>
          </div>
          <div className='f-25 black-40 fwb mh-25 mv-16'>Getting Started</div>
          <div className='f-16 black-50 mh-25 mb-38 lh-1-4'>
            Building Instagram in minutes.
          </div>
          <div
            className='br-1 absolute'
            style={{ background: '#009E4F', height: 14, bottom: -7, left: 16, right: 16 }}
          >
            <div
              className='h-100 bg-white br-1'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div style={{ flex: '1 0 auto' }} className='bg-black-05 w-100 flex flex-column justify-between'>
          <div className='ph-16 pv-38'>
            {this.renderStep({
              index: 1,
              text: 'Create a "Post" Model',
            })}
            {this.renderStep({
              index: 2,
              text: 'Define its fields',
            })}
            {this.renderStep({
              index: 3,
              text: 'Create 2 Posts',
            })}
            {this.renderStep({
              index: 4,
              text: 'Explore the Playground',
            })}
            {this.renderStep({
              index: 5,
              text: 'Run example app',
            })}
            {/*{(this.props.gettingStartedState.isCurrentStep('STEP4_WAITING_PART1') ||*/}
              {/*this.props.gettingStartedState.isCurrentStep('STEP4_WAITING_PART2')) &&*/}
              {/*<div className='bg-white br-2 dib f-16 mt-25 pv-10 ph-16 pointer' onClick={this.props.previousStep}>*/}
                {/*Show task again*/}
              {/*</div>*/}
            {/*}*/}
            {!this.props.gettingStartedState.step.includes('STEP5') && (
              <div
                className='bg-white br-2 dib f-16 mt-25 pv-10 ph-16 pointer'
                onClick={() => this.props.showCurrentStep(this.props.router, this.props.params)}
              >
                Continue in current Step
              </div>
            )}
          </div>
          <div>
            <div className='f-16 black-50 mh-25 mb-25 lh-1-4'>
              Got stuck? Please contact us, we are always trying to improve and love to help!
            </div>
            <img
              className='db'
              style={{ marginLeft: 93, marginBottom: 61 }}
              src={require('../../assets/graphics/onboarding-chat.svg')}
            />
          </div>
        </div>
      </div>
    )
  }

  private renderStep = (data: StepData) => {
    const { progress } = this.props.gettingStartedState
    const isActive = progress.index === data.index
    const isComplete = progress.index > data.index
    return (
      <div
        className={classnames(
          'flex black-30 mb-16 items-center w-100 pointer',
          {
            'white pointer': isActive,
            'strike': isComplete,
          },
        )}
        onClick={() => isActive && this.props.showCurrentStep(this.props.router, this.props.params)}
      >
        <div
          style={{ width: 23, height: 23, borderRadius: 11.5, fontSize: 12 }}
          className={classnames(
            'flex items-center justify-center ',
            {
              'accent': isActive || isComplete,
              'o-40': !isActive,
              'bg-white': isActive,
              'bg-black-50': isComplete,
              'black ba b--black': !isComplete && !isActive,
            },
          )}
        >
          {data.index}
        </div>
        <div className='mh-16'>{data.text}</div>
        {isActive && progress.total > 0 &&
        <div
          className='bg-black-10 white-60 fwb'
          style={{ fontSize: 12, padding: 4, marginLeft: 'auto' }}
        >
          {progress.done}/{progress.total}
        </div>
        }
        {isComplete &&
          <div style={{ marginLeft: 'auto' }}>
            <Icon
              width={13}
              height={13}
              color='#fff'
              src={require('assets/icons/check.svg')}
            />
          </div>
        }
      </div>
    )
  }

  private skipGettingStarted = () => {
    const skip = () => {
      this.props.skip()
        .then(() => {
          this.props.router.replace(`/${this.props.params.projectName}/models`)
        })
    }
    if (this.props.gettingStartedState.step === 'STEP5_DONE' as Step) {
      skip()
    }
    graphcoolConfirm('This will skip the getting started tour')
      .then(() => {
        skip()
      })
  }
}

const mapStateToProps = (state) => {
  return {
    gettingStartedState: state.gettingStarted.gettingStartedState,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({nextStep, previousStep, skip, showCurrentStep}, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(OnboardSideNav))
