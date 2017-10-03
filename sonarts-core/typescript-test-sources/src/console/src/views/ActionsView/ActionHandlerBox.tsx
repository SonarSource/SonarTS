import * as React from 'react'
import {Icon} from 'graphcool-styles'
import {classnames} from '../../utils/classnames'
import Tooltip from 'rc-tooltip'
const classes: any = require('./ActionHandlerBox.scss')

interface Props {
  handlerWebhookUrl: string
  valid: boolean
  update: (payload: UpdateHandlerPayload) => void
  disabled: boolean
}

export interface UpdateHandlerPayload {
  handlerWebhookUrl?: string
}

export default class ActionHandlerBox extends React.Component<Props, {}> {

  render() {

    return (
      <div className={classnames(classes.root, this.props.disabled ? classes.disabled : '')}>

        <div className={classes.head}>
          <div className={classnames(classes.title)}>Handler</div>
          {!this.props.disabled && !this.props.valid &&
          <Tooltip
            placement={'bottom'}
            overlay={<span onClick={(e: any) => e.stopPropagation()}>
                Please enter a valid url.
              </span>}
          >
            <Icon
              width={24}
              height={24}
              src={require('assets/new_icons/warning.svg')}
              color={'#F5A623'}
            />
          </Tooltip>
          }
          {this.props.valid &&
            <Icon
              width={24}
              height={24}
              src={require('assets/new_icons/check.svg')}
              color={'#7ED321'}
            />
          }
        </div>

        <div className={classes.info}>
          Enter the URL to your webhook which will be called each time the action is triggered.
        </div>

        <div className={classes.input}>
          <input
            disabled={this.props.disabled}
            type='text'
            value={this.props.handlerWebhookUrl}
            onChange={(e: any) => this.props.update({ handlerWebhookUrl: e.target.value })}
            placeholder='Enter Webhook URL'
          />
        </div>

        <div className={classes.info}>
          You can find an example&nbsp;
          <a href='https://github.com/graphcool-examples/webhook-express-example' target='_blank'>here</a>.
          We recommend using <a href='https://webtask.io/' target='_blank'>Webtask</a> or&nbsp;
          <a href='http://docs.aws.amazon.com/lambda/latest/dg/welcome.html' target='_blank'>AWS Lambda</a>&nbsp;
          for your webhooks.
        </div>
      </div>
    )
  }
}
