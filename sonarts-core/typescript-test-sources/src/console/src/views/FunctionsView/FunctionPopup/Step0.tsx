import * as React from 'react'
import FieldHorizontalSelect from '../../models/FieldPopup/FieldHorizontalSelect'
import {Icon, $v} from 'graphcool-styles'
import {EventType, eventTypes} from './FunctionPopup'
import InfoBox from './InfoBox'
import Info from '../../../components/Info'
import Select from './Select'
import {Model} from '../../../types/types'

interface Props {
  eventType: EventType | null
  onChangeEventType: (eventType: EventType) => void
  sssModelName: string
  onChangeSSSModel: (e: any) => void
  models: Model[]
}

interface State {
}

export default class Step0 extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
      eventType: null,
    }
  }

  render() {
    const {eventType, onChangeEventType, sssModelName, onChangeSSSModel, models} = this.props
    const choices = [
      <div className='flex itemsCenter'>
        <Icon
          src={require('graphcool-styles/icons/fill/serversidesubscriptions.svg')}
          width={40}
          height={20}
          color={$v.darkBlue50}
        />
        <div className='ml16'>
          Server-Side Subscription
        </div>
      </div>,
      <div className='flex itemsCenter'>
        <Icon
          src={require('graphcool-styles/icons/fill/requestpipeline.svg')}
          width={40}
          height={20}
          color={$v.darkBlue50}
        />
        <div className='ml16'>
          Request Pipeline
        </div>
      </div>,
      <Info customTip={
        <div className='flex itemsCenter'>
          <Icon
            src={require('graphcool-styles/icons/fill/cron.svg')}
            width={20}
            height={20}
            color={$v.darkBlue50}
          />
          <div className='ml16'>
            Cron Job
          </div>
        </div>
      }>
        <span>
          <style jsx={true}>{`
            span {
              @p: .wsNormal;
            }
          `}</style>
          Cron Jobs will soon be available
        </span>
      </Info>,
    ]
    return (
      <div className='step0'>
        <style jsx>{`
          .step0 {
          }
          .intro {
            @p: .pl38, .pr38, .black50;
            margin-top: 8px;
          }
          .sss-intro {
            @p: .darkBlue50;
          }
        `}</style>
        <div className='intro'>
          Choose the type of function, you want to define.
          For sure there’s a lot more we could tell as an introduction here.
        </div>
        <FieldHorizontalSelect
          activeBackgroundColor={$v.blue}
          inactiveBackgroundColor='#F5F5F5'
          choices={choices}
          selectedIndex={eventTypes.indexOf(eventType)}
          inactiveTextColor={$v.gray30}
          onChange={(index) => onChangeEventType(eventTypes[index])}
          spread
          disabledIndeces={[2]}
        />
        {eventType === 'SSS' && (
          <div className='flex itemsCenter ml38 mb38'>
            <div className='sss-intro'>Use one of your types to act as a trigger:</div>
            <Select
              value={sssModelName}
              onChange={onChangeSSSModel}
              className='ml38'
            >
              {models.map(model => (
                <option value={model.name} key={model.name}>{model.name}</option>
              ))}
            </Select>
          </div>
        )}
        <div className='mh38 mb38'>
          <InfoBox>
            {this.getInfoText()}
          </InfoBox>
        </div>
      </div>
    )
  }

  private getInfoText = () => {
    const {eventType} = this.props

    if (eventType === 'RP') {
      return `The Request Pipeline let’s you transform data at each step of  of the data processing process.
      Read more about what you can do at each step.`
    }

    if (eventType === 'SSS') {
      return `Server-side subscriptions give you the ability to react to events like mutations.
      You could for example send emails everytime a user signs up.`
    }

    return 'You can’t change the function type after you created the function.'
  }
}
