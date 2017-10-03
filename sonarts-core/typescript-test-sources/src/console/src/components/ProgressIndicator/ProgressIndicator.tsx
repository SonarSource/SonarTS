import * as React from 'react'
import { connect } from 'react-redux'

interface Props {
  total: number
  title: string
  progress: number
}

class ProgressIndicator extends React.Component<Props, {}> {
  render() {
    const percentage = (this.props.progress / this.props.total) * 100
    return (
      <div className='flex bg-black-50 w-100 h-100 justify-center items-center'>
        <div className='pa2 bg-white'>
          <div className='f3'>
            {this.props.title}
          </div>
          <div className='f4 mt4'>
            {percentage.toFixed(2)}%
        </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    progress: state.progressIndicator.progress,
  }
}

export default connect(mapStateToProps)(ProgressIndicator)
