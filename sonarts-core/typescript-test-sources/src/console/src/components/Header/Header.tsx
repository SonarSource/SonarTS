import * as React from 'react'
import * as Relay from 'react-relay'
import { Project } from '../../types/types'
const classes: any = require('./Header.scss')

interface Props {
  children: Element
  viewer: any
  project: Project
  params: any
  left?: boolean
}

interface State {
  userDropdownVisible: boolean
  endpointLayoverVisible: boolean
}

class Header extends React.Component<Props, State> {

  state = {
    userDropdownVisible: false,
    endpointLayoverVisible: false,
  }

  render () {
    let { left } = this.props

    if (typeof left !== 'boolean') {
      left = true
    }
    return (
      <div className={classes.root}>
        {left ? (
          <div className={classes.left}>
            {this.props.children}
          </div>
        ) : (
          this.props.children
        )}
      </div>
    )
  }
}

export default Relay.createContainer(Header, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        user {
          id
          name
        }
      }
    `,
    project: () => Relay.QL`
      fragment on Project {
        id
      }
    `,
  },
})
