import * as React from 'react'
import * as Relay from 'react-relay'
import {Link} from 'react-router'
import {ServerlessFunction} from '../../types/types'
import NewToggleButton from '../../components/NewToggleButton/NewToggleButton'
import {withRouter} from 'react-router'
import {Icon, $v} from 'graphcool-styles'
import ToggleActiveRequestPipelineMutationFunction
  from '../../mutations/Functions/ToggleActiveRequestPipelineMutationFunction'
import {onFailureShowNotification} from '../../utils/relay'
import {showNotification} from '../../actions/notification'
import {ShowNotificationCallback} from '../../types/utils'
import {connect} from 'react-redux'
import * as moment from 'moment'
import RequestGraph from './RequestGraph'
import * as cn from 'classnames'
import {getIsInline} from './FunctionPopup/FunctionPopup'
import {getEventTypeFromFunction} from '../../utils/functions'
import ToggleServerSideSubscriptionFunction from '../../mutations/Functions/ToggleServerSideSubscriptionFunction'

interface Props {
  fn: ServerlessFunction
  params: any
  router: ReactRouter.InjectedRouter
  showNotification: ShowNotificationCallback
}

interface State {
  isActive: boolean
}

class FunctionRow extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
      isActive: props.fn.isActive,
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.fn.isActive !== nextProps.fn.isActive) {
      this.setState({isActive: nextProps.fn.isActive} as State)
    }
  }

  render() {
    const {fn, params: {projectName}} = this.props
    const link = `/${this.props.params.projectName}/functions/${this.props.fn.id}/edit`
    const isInline = getIsInline(fn)
    const eventType = getEventTypeFromFunction(fn)

    return (
      <tr key={fn.id} onClick={this.edit}>
        <style jsx={true}>{`
          .function {
            @p: .pa16, .bb, .bBlack10, .flex, .justifyBetween;
          }
          .function :global(a) {
            @p: .ml16;
          }
          tr {
            @p: .mh16;
          }
          tr:hover td {
            @p: .bgDarkBlue04;
          }
          td {
            @p: .pointer;
            border-bottom: 2px solid rgba(23,42,58,.06);
          }
          .toggle {
            @p: .flex, .itemsCenter;
          }
          .name {
            @p: .f16, .darkBlue;
          }
          .badge {
            @p: .br2, .bgBlack04, .f12, .fw6, .ttu, .black50, .ml10;
            padding: 2px 6px;
          }
          .event-type {
            @p: .f12, .fw6, .darkBlue40, .flex, .itemsCenter;
            letter-spacing: 0.4px;
          }
          .event-type span {
            @p: .ml10;
          }
          .bad, .good {
            @p: .f12, .fw6, .tr;
          }
          .good {
            @p: .green, .ml10;
          }
          .time {
            @p: .f14, .darkBlue50, .ml38;
          }
          .requests {
            @p: .flex, .itemsCenter;
          }
          .failed-count {
            @p: .buttonShadow, .br100, .bgRed, .white, .tc, .flex, .itemsCenter, .justifyCenter;
            @p: .f12, .fw6;
            line-height: 18px;
            min-width: 18px;
            height: 18px;
          }
          .failed-count-wrapper {
            @p: .absolute, .br100;
            border: 6px solid white;
            left: 15px;
            top: -16px;
          }
          td :global(a), td .toggle {
            @p: .ph20, .pv16, .db;
          }
          td.less-padding :global(a) {
            @p: .pv6;
          }
          .rp1 :global(.rp-step-1) {
            opacity: 1;
            fill: $blue;
          }
          .rp2 :global(.rp-step-2) {
            opacity: 1;
            fill: $blue;
          }
          .rp3 :global(.rp-step-3) {
            opacity: 1;
            fill: $blue;
          }
        `}</style>
        <td>
          <div className='toggle'>
          <NewToggleButton
              defaultChecked={this.state.isActive}
              onChange={this.toggle}
            />
          </div>
        </td>
        <td>
          <Link to={link}>
            <span className='name'>{fn.name}</span>
            <span className='badge'>{isInline ? 'Inline' : 'Webhook'}</span>
          </Link>
        </td>
        <td>
          <Link to={link}>
            {eventType === 'RP' && (
              <div className={cn(
                'event-type',
                {
                  'rp1': fn.binding === 'TRANSFORM_ARGUMENT',
                  'rp2': fn.binding === 'PRE_WRITE',
                  'rp3': fn.binding === 'TRANSFORM_PAYLOAD',
                },
              )}>
                <Icon
                  src={require('graphcool-styles/icons/fill/requestpipeline.svg')}
                  color={$v.darkBlue50}
                  width={55}
                />
                <span className='ttu'>Request Pipeline</span>
                <div className='badge ml10'>{fn.model.name}</div>
                <span className='darkBlue40 f14'>is</span>
                <div className='badge ml6'>{fn.operation.toLowerCase()}d</div>
              </div>
            )}
            {eventType === 'SSS' && (
              <div className='event-type'>
                <Icon
                  src={require('graphcool-styles/icons/fill/serversidesubscriptions.svg')}
                  color={$v.darkBlue50}
                  width={41}
                  height={23}
                />
                <span>Server-side Subscription</span>
              </div>
            )}
          </Link>
        </td>
        <td className='less-padding'>
          <Link to={link}>
            <div className='requests'>
              {fn.stats && fn.stats.requestHistogram && fn.stats.requestHistogram.length > 0 &&
                <RequestGraph stats={fn.stats} />
              }
              <div className='good'>{fn.stats.requestCount}</div>
              <div className='time'>{moment(fn.stats.lastRequest).fromNow()}</div>
            </div>
          </Link>
        </td>
        <td>
          <Link to={`/${this.props.params.projectName}/functions/${this.props.fn.id}/logs`}>
            {fn.stats.errorCount > 0 ? (
              <div className='relative'>
                <Icon
                  src={require('graphcool-styles/icons/fill/logsFailed.svg')}
                  color={$v.red}
                  width={24}
                  height={24}
                />
                <div className='failed-count-wrapper'>
                  <div className='failed-count'>{fn.stats.errorCount}</div>
                </div>
              </div>
            ) : (
              <Icon
                src={require('graphcool-styles/icons/fill/logs.svg')}
                color={$v.green}
                width={24}
                height={24}
              />
            )}
          </Link>
        </td>
      </tr>
    )
  }

  private edit = () => {
    // this.props.router.push()
  }

  private toggle = () => {
    // lets toggle
    this.setState(state => {
      return {
        isActive: !state.isActive,
      }
    })
    if (this.props.fn.binding) {
      Relay.Store.commitUpdate(
        new ToggleActiveRequestPipelineMutationFunction({
          functionId: this.props.fn.id,
          isActive: !this.props.fn.isActive,
        }),
        {
          onSuccess: () => {
            console.log('success at toggling')
          },
          onFailure: (transaction) => {
            onFailureShowNotification(transaction, this.props.showNotification)
          },
        },
      )
    } else {
      Relay.Store.commitUpdate(
        new ToggleServerSideSubscriptionFunction({
          functionId: this.props.fn.id,
          isActive: !this.props.fn.isActive,
        }),
        {
          onSuccess: () => {
            console.log('success at toggling')
          },
          onFailure: (transaction) => {
            onFailureShowNotification(transaction, this.props.showNotification)
          },
        },
      )
    }
  }
}

const ConnectedFunctionRow = connect(null, {showNotification})(FunctionRow)

export default Relay.createContainer(withRouter(ConnectedFunctionRow), {
  fragments: {
    fn: () => Relay.QL`
      fragment on Function {
        id
        name
        isActive
        inlineCode
        stats {
          errorCount
          lastRequest
          requestCount
          requestHistogram
        }
        ... on RequestPipelineMutationFunction {
          binding
          model {
            name
          }
          operation
        }
        ... on ServerSideSubscriptionFunction {
          query
        }
      },
    `,
  },
})
