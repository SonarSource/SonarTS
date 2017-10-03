import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import {closePopup} from '../../actions/popup'
import {ReduxAction} from '../../types/reducers'
import styled from 'styled-components'

interface Props {
  id?: string
  closePopup: (id: string) => ReduxAction
  onClickOutside?: (e: any) => void
}

const Container = styled.div`
  &::-webkit-scrollbar {
    display: none;
  }
`

class PopupWrapper extends React.Component<Props, {}> {
  refs: {
    container: Element,
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyDown)
  }

  keyDown = (e: KeyboardEvent) => {
    if (e.keyCode === 27 && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
      this.close(e)
    }
  }

  render() {
    return (
      <Container
        className='fixed left-0 right-0 top-0 bottom-0 z-999'
        style={{
          overflow: 'scroll',
        }}
        onClick={this.handleClick}
        ref='container'
      >
        {this.props.children}
      </Container>
    )
  }

  private handleClick = (e: any) => {

    const container: Element = ReactDOM.findDOMNode(this.refs.container)
    if (!container.children) {
      return
    }
    if (container.children[0] !== e.target) {
      return
    }

    this.close(e)
  }

  private close = (e: any) => {
    // hack.
    // we have the background div in each popup at the moment
    // so when the first child of this container is clicked,
    // close the popup
    if (typeof this.props.onClickOutside === 'function') {
      this.props.onClickOutside(e)
    }
    if (this.props.id && this.props.id.length > 0) {
      this.props.closePopup(this.props.id)
    }
  }
}

export default connect(null, {
  closePopup,
})(PopupWrapper)
