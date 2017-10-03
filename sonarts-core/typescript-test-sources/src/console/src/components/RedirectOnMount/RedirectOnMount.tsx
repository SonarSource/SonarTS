import * as React from 'react'
import {withRouter} from 'react-router'
import {debounce} from 'lodash'

interface Props {
  to: string
  router: ReactRouter.InjectedRouter
}

// using lastMount to prevent infinite instant reloading
const replace = debounce(
  (router: ReactRouter.InjectedRouter, to: string) => {
    router.replace(to)
  },
  30000,
  {
    leading: true,
  },
)

class RedirectOnMount extends React.Component<Props, {}> {

  componentWillMount () {
    replace(this.props.router, this.props.to)
  }

  render () {
    return null
  }
}

export default withRouter(RedirectOnMount)
