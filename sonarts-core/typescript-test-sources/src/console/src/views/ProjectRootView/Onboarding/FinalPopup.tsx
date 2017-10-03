import * as React from 'react'
import * as Modal from 'react-modal'
import {fieldModalStyle} from '../../../utils/modalStyle'
import {connect} from 'react-redux'
import {nextStep, skip} from '../../../actions/gettingStarted'
import {GettingStartedState} from '../../../types/gettingStarted'
import SelectExample from './SelectExample'
import OnboardingFinale from './OnboardingFinale'

interface Props {
  nextStep: () => any
  skip: any
  gettingStartedState: GettingStartedState
  projectId: string
}

interface State {

}

const modalStyle = {
  overlay: fieldModalStyle.overlay,
  content: {
    ...fieldModalStyle.content,
    width: 900,
  },
}

class FinalPopup extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {

    }
  }

  render() {
    const step = this.props.gettingStartedState.skipped ? undefined : this.props.gettingStartedState.step

    console.log(step)

    return (
      <Modal
        isOpen
        style={modalStyle}
        contentLabel='Onboarding Finale'
        onRequestClose={this.close}
      >
        <div className='intro-popup'>
          <style jsx={true}>{`
            .intro-popup {
              @p: .flex, .flexColumn, .itemsCenter, .justifyCenter, .bgWhite, .relative;
            }
          `}</style>
          {(step === 'STEP5_SELECT_EXAMPLE' || step === 'STEP5_WAITING') && (
            <SelectExample step={step} projectId={this.props.projectId} />
          )}
          {step === 'STEP5_DONE' && (
            <OnboardingFinale nextStep={this.props.nextStep} />
          )}
        </div>
      </Modal>
    )
  }

  private close = () => {
    const step = this.props.gettingStartedState.skipped ? undefined : this.props.gettingStartedState.step
    if (step === 'STEP5_DONE') {
      this.props.nextStep()
    }
  }
}

export default connect(
  state => ({
    gettingStartedState: state.gettingStarted.gettingStartedState,
  }),
  {nextStep, skip},
)(FinalPopup)
