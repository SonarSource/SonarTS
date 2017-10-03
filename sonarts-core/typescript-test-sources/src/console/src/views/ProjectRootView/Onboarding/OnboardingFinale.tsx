import * as React from 'react'
import {Icon, $v} from 'graphcool-styles'
import {A, Button} from '../../../components/Links'

interface Props {
  nextStep: () => void
}

interface State {

}

export default class OnboardingFinale extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {

    }
  }

  componentDidMount() {
    const snd = new Audio(require('../../../assets/success.mp3') as string)
    snd.volume = 0.6
    snd.play()
  }

  render() {
    return (
      <div className='onboarding-finale'>
        <style jsx>{`
          .onboarding-finale {
            @p: .w100, .pt60;
          }
          h1 {
            @p: .hf32, .fw6, .darkBlue, .flex, .itemsCenter, .justifyCenter;
          }
          .success {
            @p: .mr10;
            font-size: 50px;
            font-family: AppleColorEmoji, 'Open-Sans';
          }
          .intro {
            @p: .pl60, .flex, .flexColumn, .itemsCenter, .justifyCenter;
            padding-right: 48px;
          }
          .close {
            @p: .absolute, .pointer, .pa38, .top0, .right0;
          }
          p {
            @p: .f16, .darkBlue70;
          }
          .intro p {
            @p: .tc, .mv38;
            max-width: 600px;
          }
          .share {
            @p: .ph60, .pv38, .flex, .justifyBetween, .itemsCenter;
            border-top: 2px solid $darkBlue07;
            border-bottom: 2px solid $darkBlue07;
          }
          h2 {
            @p: .f20, .darkBlue70, .fw6;
          }
          .twitter-btn {
            @p: .buttonShadow, .white, .pv12, .ph16, .ttu, .f16, .fw6, .flex, .itemsCenter, .noUnderline, .br2;
            background: #1da1f2;
          }
          .twitter-btn span {
            @p: .ml10;
          }

          /* Resources */
          .resources {
            @p: .bgDarkBlue04, .flex;
          }
          .left {
            @p: .flexFixed, .pl60, .pt25, .pb38;
            border-right: 2px solid $darkBlue07;
            padding-right: 48px;
          }
          h3 {
            @p: .ttu, .fw6, .f14, .darkBlue50, .mb10;
            letter-spacing: 0.5px;
          }
          .right {
            @p: .flexAuto, .pt25;
            padding-left: 20px;
          }
          .right h3 {
            @p: .ml38;
          }
          .guide {
            @p: .overlayShadow, .bgWhite, .mt16, .flex, .flexColumn;
            padding: 16px 20px;
            width: 300px;
            transition: transform .25s ease, box-shadow .25s ease;
          }
          .guide:hover {
            box-shadow: 0px 2px 13px 0px rgba(0,0,0,0.12);
            transform: translate3D(0,-1px,0);
          }
          .guide h2 {
            @p: .darkBlue, .flex, .itemsCenter, .tl;
          }
          .guide h2 span {
            @p: .ml10;
          }
          .guide p {
            @p: .darkBlue, .mt16, .f14;
          }
          .go-to-docs {
            @p: .pa38;
          }
        `}</style>
        <div className='intro'>
          <h1>
            <span className='success'>🎉 </span>
            Congratulations
          </h1>
          <p>
            You did dit! We prepared a lot of resources that you can read to learn more about Graphcool and GraphQL
            in general.
          </p>
          <div
            className='close'
            onClick={this.props.nextStep}
          >
            <Icon
              src={require('graphcool-styles/icons/stroke/cross.svg')}
              stroke
              strokeWidth={2}
              color={$v.gray40}
              width={26}
              height={26}
            />
          </div>
        </div>
        <div className='share'>
          <h2>If you liked it, share it on twitter</h2>
          <a
            className='twitter-btn'
            href={`https://twitter.com/home?status=%40graphcool's%20onboarding%20jus` +
            `t%20nailed%20it.%20Really%20impressed.`}
            target='_blank'
          >
            <Icon src={require('assets/icons/twitter.svg')} color={$v.white} width={32} height={32} />
            <span>Tweet something</span>
          </a>
        </div>
        <div className='resources'>
          <div className='left'>
            <h3>Interactive Guides</h3>
            <a className='guide' href='https://www.learnrelay.org/'>
              <h2>
                <Icon
                  src={require('graphcool-styles/icons/fill/relayLogo.svg')}
                  width={50}
                  height={50}
                  color='#f26b00'
                />
                <span>Learn Relay</span>
              </h2>
              <p>Learn everything about Facebook's GraphQL Client Relay</p>
            </a>
            <a className='guide' href='https://www.learnapollo.com/'>
              <h2>
                <Icon
                  src={require('graphcool-styles/icons/fill/apolloLogo.svg')}
                  width={50}
                  height={50}
                  color={$v.darkBlue}
                />
                <span>Learn Apollo</span>
              </h2>
              <p>Learn the Apollo Client basics in an interactive Tutorial</p>
            </a>
            <a className='guide' href='https://www.graph.cool/freecom/'>
              <h2>
                <img width={40} height={40} src={require('assets/graphics/freecom.svg')} alt=''/>
                <span>Freecom</span>
              </h2>
              <p>Learn how to build a free Intercom clone with modern technologies</p>
            </a>
          </div>
          <div className='right'>
            <h3>Next Steps</h3>
            <Step
              title='Advanced Query Parameters'
              description={'Learn more about Graphcools powerful filter API that ' +
              'allows you to specify exactly what you want.'}
              to={'https://www.graph.cool/docs/tutorials/designing-powerfu' +
              'l-apis-with-graphql-query-parameters-aing7uech3/'}
            />
            <Step
              title='Authentication & Authorization'
              description={'Graphcool provides a powerful Auth mechanism that supports Facebook, Google etc.' +
              ' that you can leverage in your app'}
              to='https://www.graph.cool/docs/reference/auth/overview-wejileech9/'
            />
            <Step
              title='Functions'
              description={'GraphQL is a powerful technology. But sometimes you want ' +
              'custom logic. With functions you can extend Graphcool to your needs.'}
              to='https://www.graph.cool/docs/reference/functions/overview-boo6uteemo/'
            />
            <div className='go-to-docs'>
              <A target='https://graph.cool/docs/'>Go to Docs</A>
            </div>
          </div>
        </div>
      </div>

    )
  }
}

interface StepProps {
  title: string
  description: string
  to: string
}

function Step({title, description, to}) {
  return (
    <a href={to} target='_blank' className='step'>
      <style jsx>{`
        .step {
          @p: .bb, .bDarkBlue06, .flex, .itemsCenter, .pl38, .mt16, .pr25, .darkBlue70;
          transition: transform .25s background-color;
          padding-bottom: 20px;
        }
        .content {
          @p: .mr25;
        }
        p {
          @p: .mt10, .f14;
        }
        h2 {
          @p: .fw6, .f20, .mb10, .nowrap;
          letter-spacing: 0.5px;
        }
        .step:hover {
          @p: .darkBlue80;
        }
        .step:hover :global(.arrow) {
          animation: move 1s ease infinite;
        }

        @keyframes move {
          0% {
            transform: translate3D(0,0,0);
          }

          50% {
            transform: translate3D(3px,0,0);
          }

          100% {
            transform: translate3D(0,0,0);
          }
        }
      `}</style>
      <div className='content'>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <Icon
        src={require('graphcool-styles/icons/fill/fullArrowRight.svg')}
        color={$v.blue}
        width={14}
        height={11}
        className='arrow'
      />
    </a>
  )
}
