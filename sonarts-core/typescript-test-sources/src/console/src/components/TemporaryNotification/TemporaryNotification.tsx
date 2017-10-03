import * as React from 'react'
import {closePopup} from '../../actions/popup'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
const classes = require('./TemporaryNotification.scss')

interface Props {
  children: Element | string
  id: string
  closePopup: (id: string) => any
}

class TemporaryNotification extends React.Component<Props, {}> {

  componentDidMount() {
    setTimeout(
      () => this.props.closePopup(this.props.id),
      1500,
    )
  }

  render() {
    return (
      <div className='relative w-100 h-100' style={{pointerEvents: 'none'}}>
        <div className={classes.center} style={{pointerEvents: 'none'}}>
          <div className={classes.fadeOut} style={{pointerEvents: 'none'}}>
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ closePopup }, dispatch)
}

export default connect(null, mapDispatchToProps)(TemporaryNotification)
