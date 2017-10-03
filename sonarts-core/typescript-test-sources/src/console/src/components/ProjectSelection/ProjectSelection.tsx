const classes: any = require('./ProjectSelection.scss')

import * as React                   from 'react'
import { Link }                     from 'react-router'
import { connect }                  from 'react-redux'
import ClickOutside                 from 'react-click-outside'
import * as cx                      from 'classnames'
import styled                       from 'styled-components'
import {ConsoleEvents}              from 'graphcool-metrics'
import * as cookiestore             from 'cookiestore'
import cuid                         from 'cuid'
import {
  $p,
  variables,
  Icon,
}                                   from 'graphcool-styles'

import ScrollBox                    from '../../components/ScrollBox/ScrollBox'
import tracker                      from '../../utils/metrics'
import {Project, Model}             from '../../types/types'
import {ShowNotificationCallback}   from '../../types/utils'
import {Popup}                      from '../../types/popup'
import {showNotification}           from '../../actions/notification'
import {showPopup}                  from '../../actions/popup'
import CloneProjectPopup            from '../../views/ProjectRootView/CloneProjectPopup'

interface Props {
  params: any
  add: () => void
  selectedProject: Project
  projects: Project[]
  router: any
  model: Model
  project: Project
  showNotification: ShowNotificationCallback
  showPopup: (popup: Popup) => void
  sidebarExpanded: boolean
}

interface State {
  expanded: boolean,
  userDropdownVisible: boolean,
}

const expandedRoot = `
  background: ${variables.green} !important
`

const Root = styled.div`
  flex: 0 0 auto;
  height: 64px;
  &:hover {

  }
  ${props => props.expanded && expandedRoot}

`

const turnedArrow = `
  transform: rotate(180deg);
  background: ${variables.gray20};
  svg {
    position: relative;
    top: 1px;
  }
`

const Arrow = styled.div`
  svg {
    stroke: ${variables.white};
    stroke-width: 4px;
  }
  
  border-radius: 100%;
  background-color: rgb(16,33,47);
  width: 26px;
  height: 26px;

  ${props => props.turned && turnedArrow }
`

const SettingsLink = styled(Link)`
  padding: ${variables.size10};
  background: ${variables.gray10};
  font-size: ${variables.size14};
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 1px;
  color: ${variables.white60};
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 2px;
  transition: color ${variables.duration} linear, background ${variables.duration} linear;

  svg {
    fill: ${variables.white60};
    transition: fill ${variables.duration} linear;
  }

  > div {
    margin-left: 10px;
  }

  &:hover {
    color: ${variables.white};
    background: ${variables.gray20};

    svg {
      fill: ${variables.white};
    }
  }
`

const activeListItem = `
  color: ${variables.white};

  &:before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: ${variables.size06};
    background: ${variables.white};
    border-radius: 0 2px 2px 0;
  }
`

const ListItem = styled(Link)`
  transition: color ${variables.duration} linear;

  svg {
    display: none;
    fill: ${variables.white};
  }

  &:hover {
    color: ${variables.white};

    svg {
      display: block;
    }
  }

  ${props => props.active && activeListItem}
`

const AddProject = styled.div`
  margin: -3px -4px 0 0;

  svg {
    stroke: ${variables.white};
    stroke-width: 4px;
  }
`

class ProjectSelection extends React.PureComponent<Props, State> {

  state = {
    expanded: false,
    userDropdownVisible: false,
  }

  shouldComponentUpdate: any

  constructor (props) {
    super(props)
  }

  render () {
    const {expanded} = this.state
    return (
      <ClickOutside
        onClickOutside={(e) => {
          this.close()
        }}
      >
        <Root
          expanded={expanded}
          className={cx($p.relative, $p.w100, $p.h100, $p.white, $p.z5, $p.bgDarkBlue)}
        >
          <div
            onClick={this.toggle}
            className={cx($p.h100, $p.w100, $p.f20, $p.flex, $p.itemsCenter)}
          >
            <div
            className={cx($p.bgGreen, $p.flex, $p.itemsCenter, $p.justifyCenter, $p.pointer, $p.flexFixed)}
              style={{
                width: '67px',
                height: '67px',
                borderBottomRightRadius: '2px',
              }}
            >
              <Icon
                width={30}
                height={35}
                src={require('assets/icons/logo.svg')}
                color='#fff'
              />
            </div>
            {this.props.sidebarExpanded && (
              <div
                className={cx($p.flex, $p.itemsCenter, $p.ph16, $p.pointer, $p.w100, $p.flexAuto)}
              >
                <div className={cx('project-name-wrapper', {expanded})}>
                  <style jsx>{`
                    .project-name-wrapper {
                      @p: .overflowHidden, .w100, .relative;
                    }
                    .project-name-wrapper:after {
                      @p: .absolute, .right0, .top0, .bottom0;
                      pointer-events: none;
                      content: "";
                      width: 20px;
                      background: linear-gradient(to right, rgba(23,42,58, 0), rgba(23,42,58, 1));
                    }
                    .project-name-wrapper.expanded:after {
                      background: linear-gradient(to right, $green0, $green);
                    }
                    .project-name {
                      @p: .nowrap, .overflowAuto;
                    }
                  `}</style>
                  <div className='project-name' title={this.props.selectedProject.name}>
                    {this.props.selectedProject.name}
                  </div>
                  {this.collaboratorElement()}
                </div>
                <Arrow
                  turned={expanded}
                  className={cx($p.flex, $p.itemsCenter, $p.justifyCenter, $p.brPill, $p.flexFixed)}
                  style={{
                    marginRight: '-3px',
                  }}
                  onclick={this.closeProjectsList}
                >
                  <Icon
                    width={18}
                    height={18}
                    stroke
                    src={require('graphcool-styles/icons/stroke/arrowDown.svg')}
                  />
                </Arrow>
              </div>
            )}
          </div>
          {expanded &&
          <div className={cx($p.absolute, $p.w100, $p.vh100, $p.bgGreen, $p.flex, $p.flexColumn)}>
            <div className={cx($p.pa25, $p.flex, $p.justifyBetween)}>
              <SettingsLink to={`/${this.props.params.projectName}/settings`}>
                <Icon width={16} height={16} src={require('graphcool-styles/icons/fill/settings.svg')}/>
                <div>Settings</div>
              </SettingsLink>
              <SettingsLink className={cx($p.ml10)} onClick={this.openUserDropdown}>
                <Icon width={16} height={16} src={require('graphcool-styles/icons/fill/user.svg')}/>
                <div>Account</div>
                {this.state.userDropdownVisible &&
                <ClickOutside onClickOutside={(e) => {
                      e.stopPropagation()
                      this.closeUserDropdown()
                    }}>
                  <div className={classes.userDropdown}>
                    <Link
                      to={`/${this.props.params.projectName}/account`}
                      onClick={this.closeUserDropdown}
                    >
                      Account
                    </Link>
                    <div onClick={this.logout}>
                      Logout
                    </div>
                  </div>
                </ClickOutside>
                }

              </SettingsLink>
            </div>
            <div
              className={cx($p.relative, $p.bgBlack07)}
              style={{
                  flexGrow: 2,
                }}
            >
              <ScrollBox
                style={{
                    height: 'calc(100vh - 155px)',
                  }}
              >
                <div className={cx(
                    $p.lhSolid,
                    $p.flex,
                    $p.itemsCenter,
                    $p.tracked,
                    $p.ttu,
                    $p.fw6,
                    $p.white80,
                    $p.mt38,
                    $p.ml25,
                    $p.mb16,
                  )}>
                  All Projects
                </div>
                {this.props.projects.map((project) => (
                  <ListItem
                    key={project.name}
                    className={cx(
                        $p.relative,
                        $p.db,
                        $p.f20,
                        $p.fw4,
                        $p.ph25,
                        $p.pv16,
                        $p.white60,
                        $p.flex,
                        $p.justifyBetween,
                        $p.itemsCenter,
                      )}
                    onClick={() => this.onSelectProject(project.id)}
                    to={`/${project.name}`}
                    active={project.id === this.props.selectedProject.id}
                  >
                    <div className={cx($p.ml10, $p.toe, $p.overflowHidden)}>{project.name}</div>
                    <Link
                      to={`/${project.name}/clone`}
                      title='Duplicate'
                    >
                      <Icon
                        src={require('graphcool-styles/icons/fill/duplicate.svg')}
                      />
                    </Link>
                  </ListItem>
                ))}
                <AddProject
                  className={cx(
                      $p.absolute,
                      $p.top38,
                      $p.right25,
                      $p.lhSolid,
                      $p.ba,
                      $p.brPill,
                      $p.bWhite,
                      $p.pointer,
                      $p.o80,
                    )}
                  onClick={this.props.add}
                >
                  <Icon width={18} height={18} stroke src={require('graphcool-styles/icons/stroke/add.svg')}/>
                </AddProject>
              </ScrollBox>
            </div>
          </div>
          }
        </Root>
      </ClickOutside>
    )
  }

  private close = () => {
    if (this.state.expanded) {
      this.setState({ expanded: false } as State)
    }
  }

  private toggle = () => {
    this.setState({ expanded: !this.state.expanded } as State)
  }

  private onSelectProject = (id: string) => {
    this.toggle()

    tracker.track(ConsoleEvents.Project.selected({id}))
  }

  private closeProjectsList = () => {
    this.setState({expanded: false} as State)
  }

  private openUserDropdown = () => {
    this.setState({userDropdownVisible: true} as State)
  }

  private closeUserDropdown = () => {
    this.setState({userDropdownVisible: false} as State)
  }

  private async logout () {
    try {
      await tracker.track(ConsoleEvents.logout())

      tracker.reset()
    } catch (e) {
      cookiestore.remove('graphcool_auth_token')
      cookiestore.remove('graphcool_customer_id')
      window.location.pathname = '/'
      return
    }

    cookiestore.remove('graphcool_auth_token')
    cookiestore.remove('graphcool_customer_id')
    window.location.pathname = '/'
  }

  private collaboratorElement = (): JSX.Element => {
    if (this.props.selectedProject.seats.edges.length <= 1) {
      return (
        <Link
          to={`/${this.props.selectedProject.name}/settings/team`}
          onClick={(e) => {
            e.stopPropagation() // don't toggle
          }}
        >
          <div className='flex itemsCenter'>
            <Icon
              src={this.state.expanded ?
                require('' +
                 'chrome../../assets/icons/add_member_white.svg') : require('../../assets/icons/add_member.svg')}
              width={13}
              height={13}
            />
            <div className={`f12 pointer ml4 ${this.state.expanded ? 'white' : 'blue'}`}>
              add collaborators
            </div>
          </div>
        </Link>
      )
    }

    return (
      <div className='flex itemsCenter '>
        <style jsx={true}>{`
          .white33 {
            color: rgba(255,255,255,.33);
          }
        `}</style>
        <Icon
          src={require('../../assets/icons/member.svg')}
          width={13}
          height={13}
        />
        <div className='f12 white33 ml4 mt4'>{this.props.selectedProject.seats.edges.length} seats</div>
      </div>
    )
  }
}

export default connect(null, {
  showNotification,
  showPopup,
})(ProjectSelection)
