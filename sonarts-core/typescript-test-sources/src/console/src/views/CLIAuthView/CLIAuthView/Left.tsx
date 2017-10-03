import * as React from 'react'
import { A } from '../../../components/Links'

interface Props {
  className?: string
}

export default class Left extends React.Component<Props, {}> {

  render() {
    return (
      <div
        className={`${this.props.className}`}
      >
        <style jsx={true}>{`

          .graphcool-cli-says {
            @p: .white50, .mono, .ml20;
            font-size: 16px;
            font-weight: 500;
          }

          .title {
            @p: .f38, .fw6, .white, .mt38;
          }

          .subtitle {
            @p: .f20, .white50, .mt38;
          }

          .call-to-action {
            @p: .blue, .ttu, .f14, .fw6, .pointer, .mt25;
          }

        `}</style>
        <div className='flex itemsCenter'>
          <img src={require('../../../assets/graphics/terminal.svg')}/>
          <div className='graphcool-cli-says'>graphcool-cli says...</div>
        </div>
        <div className='title'>Authenticate to continue.</div>
        <div className='subtitle'>
          Sign in to your existing account or easily create a new one.<br />
          It will only take a few seconds.
        </div>
        <A className='mt38' target='https://www.graph.cool'>Learn more on our website</A>
      </div>
    )
  }
}
