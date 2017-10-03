import * as React from 'react'
import { Icon, $v } from 'graphcool-styles'
import { Button } from '../../components/Links'

interface Props {
}

export default class CLIAuthSuccessView extends React.Component<Props, {}> {

  render() {
    return (
      <div className='already-authenticated'>
        <style jsx={true}>{`
          .already-authenticated {
            @p: .flex, .fixed, .top0, .left0, .right0, .bottom0, .w100;
            background-image: radial-gradient(circle at 49% 49%, #172a3a, #0f202d);
          }

          .logo {
            @p: .absolute, .left0, .top0, .pl60, .pt60;
          }

          .content {
            @p: .flex, .flexColumn, .itemsCenter, .justifyCenter, .white, .w100, .mh60;
            width: 530px;
          }

          .title {
            @p: .f38, .fw6, .white;
          }

          .subtitle {
            @p: .f20, .white50, .mt20;
          }

          .line {
            @p: .o20, .w100, .mv38;
            height: 0px;
            border: solid 1px #ffffff;
          }

          .call-to-action {
            @p: .flex, .flexRow, .itemsCenter, .justifyCenter, .mt25, .bgGreen, .white,
              .ttu, .fw6, .pv10, .ph16, .br2, .pointer;
            max-width: 200px;
          }

          .info {
            @p: .f16, .white60;
          }
        `}</style>
        <div className='logo'>
          <Icon
            color={$v.green}
            width={34}
            height={40}
            src={require('../../assets/icons/logo.svg')}
          />
        </div>
        <div className='content'>
          <div>
            <div className='title'>Successfully authenticated ✅</div>
            <div className='subtitle'>You can now close this tab.</div>
            <div className='line'/>
            <div className='info'>You can also continue in the Console to see your projects.</div>
            <Button
              target='/'
              green
              className='mt25'>
              Open Console
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
