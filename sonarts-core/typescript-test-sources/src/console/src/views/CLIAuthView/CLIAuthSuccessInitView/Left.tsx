import * as React from 'react'
import { Icon, $v } from 'graphcool-styles'
import { Button } from '../../../components/Links'

export default class Left extends React.Component<{}, {}> {

  render() {
    return (
      <div className='example-project-left'>
        <style jsx={true}>{`

            .example-project-left {
              @p: .w100, .flex, .itemsCenter;
              background-image: radial-gradient(circle at 49% 49%, #172a3a, #0f202d);
            }

            .logo {
              @p: .absolute;
              top: 60px;
              left: 60px
            }

            .title {
              @p: .f38, .fw6, .white;
            }

            .content {
              @p: .flex, .justifyCenter, .white, .w100, .mv60;
            }

            .subtitle {
              @p: .f20, .white50, .mt20;
            }

            a {
              @p: .blue, .noUnderline;
            }

            .line {
              @p: .o20, .w100, .mb38;
              height: 0;
              border: solid 1px #ffffff;
            }

            .info {
              @p: .f16, .white60;
              max-width: 530px;
            }

            .info a {
              @p: .blue, .noUnderline;
            }

        `}</style>
        <div className='logo'>
          <Icon
            color={$v.green}
            width={34}
            height={40}
            src={require('../../../assets/icons/logo.svg')}
          />
        </div>
        <div className='content'>
          <div>
            <div className='title'>Your project is ready</div>
            <div className={`subtitle mt96`}>
              Successfully authenticated. <b>You can now close this tab.</b><br />
              You'll find your GraphQL endpoints in your terminal.
            </div>
            <iframe
              className='mv38'
              width='560'
              height='315'
              src='https://www.youtube.com/embed/sf0ZkyalSTg'
              frameBorder='0'
              allowFullScreen
            />
            <div className='line'/>
            <div className='info'>
              You can also continue in the Console to edit your project or read the docs to learn more.
            </div>
            <Button
              target='/'
              hideArrow
              green
              className='mt25 mr10'>Open Console</Button>
          </div>
        </div>
      </div>
    )
  }

}
