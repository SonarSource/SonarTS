import * as React from 'react'
import mapProps from '../../../components/MapProps/MapProps'
import * as Relay from 'react-relay'
import * as Modal from 'react-modal'
import modalStyle from '../../../utils/modalStyle'
import {Log, ServerlessFunction} from '../../../types/types'
import {withRouter} from 'react-router'
import {range} from 'lodash'
import {Icon, $v} from 'graphcool-styles'
import LogComponent from './Log'

interface Props {
  logs: Log[]
  node: ServerlessFunction
  router: ReactRouter.InjectedRouter
}

interface State {

}

const customModalStyle = {
  overlay: modalStyle.overlay,
  content: {
    ...modalStyle.content,
    width: '100vw',
  },
}

class FunctionLogsComponent extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {

    }
  }

  render() {
    const {logs, node} = this.props
    return (
      <Modal
        contentLabel='Function Logs'
        style={customModalStyle}
        isOpen
        onRequestClose={this.close}
      >
        <style jsx={true}>{`
          .function-logs {
            @p: .overflowHidden, .pa60;
            height: 100vh;
            background-color: rgba(23,42,58,.94)
          }
          .logs {
            @p: .overflowAuto;
            max-height: calc(100vh - 100px);
          }
          .log {
            @p: .mt25, .br2, .bgLightOrange, .pa16;
          }
          table {
            @p: .w100;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .head {
            @p: .justifyBetween, .flex, .pa25;
          }
          .title {
            @p: .white40, .f16, .fw6, .ttu, .ml16;
          }
          th {
            @p: .white40, .ttu, .fw6, .f14, .ph10, .pv12, .bb, .bWhite10, .tl;
            letter-spacing: 0.6px;
          }
          th:first-child {
            @p: .pl25;
            width: 250px;
          }
          th:nth-child(2) {
            width: 120px;
          }
          th:last-child {
            @p: .pr25;
            width: 120px;
          }
          .logs :global(tr:first-child) :global(td) {
            @p: .pt16;
          }
          .head :global(i) {
            @p: .pointer;
          }
          .empty {
            @p: .white80, .tc, .pa25, .f20;
          }
      `}</style>
        <div className='function-logs'>
          <div className='head'>
            <div className='flex itemsCenter'>
              <Icon
                src={require('graphcool-styles/icons/fill/logs.svg')}
                color={$v.white40}
                width={24}
                height={24}
              />
              <div className='title'>
                Logs
              </div>
            </div>
            <Icon
              src={require('graphcool-styles/icons/stroke/cross.svg')}
              stroke
              strokeWidth={3}
              color={$v.white}
              width={26}
              height={26}
              onClick={this.close}
            />
          </div>
          <div className='logs'>
            {logs.length > 0 ? (
              <table>
                <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Duration</th>
                  <th>Message</th>
                  <th>Time Ago</th>
                </tr>
                </thead>
                <tbody>
                {logs.map(log => (
                  <LogComponent log={log} key={log.id} />
                ))}
                </tbody>
              </table>
            ) : (
              <div className='empty'>There are no logs for this function yet</div>
            )}
          </div>
        </div>
      </Modal>
    )
  }

  private close = () => {
    this.props.router.goBack()
  }
}

const MappedFunctionLogs = mapProps({
  project: props => props.viewer.project,
  logs: props => props.node.logs.edges.map(edge => edge.node),
})(withRouter(FunctionLogsComponent))

export const FunctionLogs = Relay.createContainer(MappedFunctionLogs, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
        project: projectByName(projectName: $projectName) {
          id
          name
        }
        user {
          crm {
            information {
              isBeta
            }
          }
        }
      }
    `,
    node: () => Relay.QL`
      fragment on Node {
        id
        ... on Function {
          name
          logs(last: 500) {
            edges {
              node {
                id
                duration
                message
                requestId
                timestamp
                status
              }
            }
          }
        }
      }
    `,
  },
})
