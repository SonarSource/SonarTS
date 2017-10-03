import * as React from 'react'
import Left from './Left'
import Right from './Right'

export default class CLIAuthSuccessInitView extends React.Component<{}, {}> {

  render() {
    return (
      <div className='example-project'>
        <style jsx={true}>{`
            .example-project {
              @p: .w100, .h100, .flex, .fixed, .top0, .left0, .right0, .bottom0;
            }
        `}</style>
        <Left />
        <Right />
      </div>
    )
  }
}
