import * as React from 'react'
import * as Modal from 'react-modal'
import {fieldModalStyle} from '../../utils/modalStyle'
import {ConsoleEvents} from 'graphcool-metrics'
import FloatingInput from '../../components/FloatingInput/FloatingInput'
import Loading from '../../components/Loading/Loading'
import FieldHorizontalSelect from '../models/FieldPopup/FieldHorizontalSelect'
import {$v} from 'graphcool-styles'
import {validateProjectName} from '../../utils/nameValidator'
import AddProjectMutation from '../../mutations/AddProjectMutation'
import * as Relay from 'react-relay'
import tracker from '../../utils/metrics'
import {onFailureShowNotification} from '../../utils/relay'
import {connect} from 'react-redux'
import {showNotification} from '../../actions/notification'
import {withRouter} from 'react-router'
import {ShowNotificationCallback} from '../../types/utils'
import * as Bluebird from 'bluebird'
import {Region} from '../../types/types'

interface Props {
  onRequestClose: () => void
  customerId: string
  router: any
  showNotification: ShowNotificationCallback
  isBeta: boolean
}

interface State {
  projectName: string
  showError: boolean
  loading: boolean
  selectedIndex: number
  times: number[]
}

const modalStyling = {
  ...fieldModalStyle,
  content: {
    ...fieldModalStyle.content,
    width: 450,
  },
}

const regions = ['eu-west-1', 'us-west-2', 'ap-northeast-1']
const regionsEnum: Region[] = ['EU_WEST_1', 'US_WEST_2', 'AP_NORTHEAST_1']
const choices = ['EU (Ireland)', 'US West (Oregon)', 'Asia Pacific (Tokyo)']

class AddProjectPopup extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      projectName: '',
      showError: false,
      loading: false,
      selectedIndex: 0,
      times: [],
    }
  }
  componentDidMount() {
    if (this.props.isBeta) {
      let times = []
      Bluebird.map(
        regions,
        (region, index) => {
          const randomString1 = btoa(String(Math.random() * 10000000 | 0))
          const randomString2 = btoa(String(Math.random() * 10000000 | 0))
          // the first request is always slow, so send 2
          return fetch(`https://dynamodb.${region}.amazonaws.com/ping?x=${randomString1}`)
            .then(() => {
              const timer = performance.now()
              return fetch(`https://dynamodb.${region}.amazonaws.com/ping?x=${randomString2}`)
                .then(() => {
                  const time = performance.now() - timer
                  return time
                })
            })
        },
        {
          concurrency: 1,
        },
      )
      .then(results => {
        const minIndex = results.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0)
        this.setState({
          selectedIndex: minIndex,
          times: results,
        } as State)
      })
    }
  }
  render() {
    const {onRequestClose, isBeta} = this.props
    const {showError, projectName, loading, times} = this.state
    const error = !validateProjectName(this.state.projectName)

    const infos = regions.map((_, index) => {
      const time = times[index]
      if (time) {
        return `${Math.round(time)} ms`
      } else {
        return `~ ms`
      }
    })

    return (
      <Modal
        isOpen
        contentLabel='Alert'
        style={modalStyling}
        onRequestClose={onRequestClose}
      >
        <style jsx>{`
          .add-project {
            @p: .buttonShadow, .relative, .bgWhite;
          }
          .body {
            @p: .pa38;
          }
          .footer {
            @p: .pa25, .flex, .justifyBetween, .itemsCenter, .bt, .bBlack10;
            background: rgb(250,250,250);
          }
          .button {
            @p: .br2, .pointer;
            padding: 9px 16px 10px 16px;
          }
          .warning {
            @p: .white, .bgLightOrange;
          }
          .cancel {
            @p: .black50;
          }
          .green {
            @p: .white, .bgGreen;
          }
          .button.disabled {
            @p: .bgBlack20;
          }
          .title {
            @p: .f38, .fw3, .tc, .pb25;
          }
          .add-project :global(.label) {
            @p: .f16, .pa16, .black50, .fw3;
          }
          .add-project :global(.input) {
            @p: .pa16, .br2, .bn, .mb10, .f25, .fw3;
            line-height: 1.5;
          }
          .error {
            @p: .f14, .red;
          }
          .loading {
            @p: .absolute, .top0, .left0, .right0, .bottom0, .z2, .bgWhite80, .flex, .justifyCenter, .itemsCenter;
          }
          .select-region {
            @p: .pt38, .bt, .bBlack10;
          }
          h2 {
            @p: .fw4, .tc, .black60, .mb38, .pb16;
          }
        `}</style>
        <div className='add-project'>
          <div className='body'>
            <div className='title'>New Project</div>
            <FloatingInput
              labelClassName='label'
              className='input'
              label='Project Name'
              placeholder='Choose a project name'
              value={projectName}
              onChange={this.onChangeProjectName}
              onKeyDown={(e: any) => {
                if (e.keyCode === 13) {
                  this.addProject()
                }
              }}
              autoFocus
            />
            {showError && error && (
              <div className='error'>
                The project name must begin with an uppercase letter
              </div>
            )}
          </div>
          {isBeta && (
            <div className='select-region'>
              <h2>Choose a Region</h2>
              <FieldHorizontalSelect
                activeBackgroundColor={$v.blue}
                inactiveBackgroundColor='#F5F5F5'
                choices={choices}
                infos={infos}
                selectedIndex={this.state.selectedIndex}
                inactiveTextColor={$v.gray30}
                onChange={this.onSelectIndex}
              />
            </div>
          )}
          <div className='footer'>
            <div className='button cancel' onClick={onRequestClose}>Cancel</div>
            <div className={'button green' + (error ? ' disabled' : '')} onClick={this.addProject}>Ok</div>
          </div>
          {loading && (
            <div className='loading'>
              <Loading />
            </div>
          )}
        </div>
      </Modal>
    )
  }

  private onChangeProjectName = e => {
    this.setState({projectName: e.target.value} as State)
  }

  private onSelectIndex = i => {
    this.setState({selectedIndex: i} as State)
  }

  private addProject = () => {
    const {projectName, selectedIndex} = this.state
    if (!validateProjectName(projectName)) {
      return this.setState({showError: true} as State)
    }
    this.setState(
      {loading: true} as State,
      () => {
        if (projectName) {
          Relay.Store.commitUpdate(
            new AddProjectMutation({
              projectName,
              customerId: this.props.customerId,
              region: regionsEnum[selectedIndex],
            }),
            {
              onSuccess: () => {
                tracker.track(ConsoleEvents.Project.created({name: projectName}))
                this.setState({loading: false} as State)
                this.props.router.replace(`${projectName}`)
              },
              onFailure: (transaction) => {
                this.setState({loading: false} as State)
                onFailureShowNotification(transaction, this.props.showNotification)
              },
            },
          )
        }
      },
    )
  }
}

export default connect(null, {showNotification})(withRouter(AddProjectPopup))
