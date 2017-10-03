import * as React from 'react'
import * as Modal from 'react-modal'
import {fieldModalStyle} from '../../../utils/modalStyle'
import {Button} from '../../../components/Links'
import {connect} from 'react-redux'
import {nextStep, skip} from '../../../actions/gettingStarted'

interface Props {
  nextStep: () => any
  skip: any
}

interface State {

}

const modalStyle = {
  overlay: fieldModalStyle.overlay,
  content: {
    ...fieldModalStyle.content,
    width: 588,
  },
}

class IntroPopup extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {

    }
  }

  render() {
    return (
      <Modal
        isOpen
        style={fieldModalStyle}
      >
        <div className='intro-popup'>
          <style jsx={true}>{`
            .intro-popup {
              @p: .flex, .flexColumn, .itemsCenter, .justifyCenter, .bgWhite, .pa38, .tc;
            }
            h2 {
              @p: .f16, .fw6, .darkBlue50, .ttu;
            }
            h1 {
              @p: .f32, .fw6, .darkBlue, .mt16;
            }
            p {
              @p: .darkBlue70, .f16, .mv38;
              max-width: 450px;
            }
            .skip {
              @p: .pointer, .underline, .darkBlue40, .dib, .mt25, .f16;
            }
          `}</style>
          <h2>First Steps</h2>
          <h1>Let’s build a GraphQL Backend for Instagram in 5 minutes</h1>
          <p>
            Let’s get started by building a backend for a simple Instagram clone. To keep our example light,
            our Instagram posts only consist of a picture and some hashtags.
          </p>
          <Button button onClick={this.props.nextStep}>
            Start Onboarding
          </Button>
          <div className='skip' onClick={this.props.skip}>Skip</div>
        </div>
      </Modal>
    )
  }
}

export default connect(null, {nextStep, skip})(IntroPopup)
