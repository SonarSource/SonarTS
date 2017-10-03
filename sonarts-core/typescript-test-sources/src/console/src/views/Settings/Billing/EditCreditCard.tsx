import * as React from 'react'
import CreditCardFront from './CreditCardFront'
import CreditCardBack from './CreditCardBack'
import {CreditCardInputDisplayState} from '../../../types/types'
import {Icon} from 'graphcool-styles'
import {ENTER_KEY, ESCAPE_KEY} from '../../../utils/constants'

interface State {
  displayState: CreditCardInputDisplayState
}

interface Props {
  creditCardNumber: string
  cardHolderName: string
  expirationDate: string
  cpc: string
  onCreditCardNumberChange: Function
  onCardHolderNameChange: Function
  onExpirationDateChange: Function
  onCPCChange: Function
  setEditingState: Function

  addressLine1: string
  addressLine2: string
  zipCode: string
  state: string
  city: string
  country: string

  creditCardDetailsValid: boolean
  addressDataValid: boolean

  onAddressDataChange: Function
  onSaveChanges: Function
}

export default class EditCreditCard extends React.Component<Props, State> {

  state = {
    displayState: 'CREDIT_CARD_DATA' as CreditCardInputDisplayState,
  }

  render() {
    return this.inputForCurrentDisplayState()
  }

  private inputForCurrentDisplayState = () => {

    if (this.state.displayState === 'CREDIT_CARD_DATA') {
      return (
        <div>
          <style jsx={true}>{`

          .toggleDisplayStateButton {
            @p: .absolute, .flex, .itemsCenter, .pointer;
            right: 75px;
            top: 260px;
          }
        `}</style>
          <div className='relative'>
            <CreditCardFront
              className='z1 absolute'
              cardHolderName={this.props.cardHolderName}
              creditCardNumber={this.props.creditCardNumber}
              expirationDate={this.props.expirationDate}
              isEditing={true}
              setEditingState={this.props.setEditingState}
              onCreditCardNumberChange={this.props.onCreditCardNumberChange}
              onCardHolderNameChange={this.props.onCardHolderNameChange}
              onExpirationDateChange={this.props.onExpirationDateChange}
              onKeyDown={this.handleKeyDown}
            />
            <CreditCardBack
              className='absolute'
              cpc={this.props.cpc}
              didChangeCPC={this.props.onCPCChange}
              style={{right: '75px', top: '20px'}}
              setEditingState={this.props.setEditingState}
              onKeyDown={this.handleKeyDown}
            />
            <div className={`toggleDisplayStateButton ${!this.props.creditCardDetailsValid && 'o50'}`}>
              <div
                className='blue'
                onClick={() => this.setState({displayState: 'ADDRESS_DATA'} as State)}
              >Edit Address</div>
              <Icon
                className='ml6'
                src={require('../../../assets/icons/blue_arrow_left.svg')}
                rotate={180}
              />
            </div>
          </div>
        </div>
      )
    } else if (this.state.displayState === 'ADDRESS_DATA') {
      return (
        <div>
          {this.addressDataInput()}
          {this.confirmButtons()}
        </div>
      )
    }

    return (
      <div>unknown display state</div>
    )
  }

  private addressDataInput = (): JSX.Element => {
    return (
      <div className=''>
        <style jsx={true}>{`

          .title {
            @p: .ttu, .f12, .fw6, .black30, .mb10, .mt16, .nowrap;
          }

          .inputField {
            @p: .blue, .fw3, .f20, .bgTransparent;
          }

          .wideInput {
            width: 300px;
          }

          .narrowInput {
            width: 150px;
          }

        `}</style>
        <div className='title'>Address Line 1</div>
        <input
          className='inputField'
          value={this.props.addressLine1}
          placeholder='Enter address line 1'
          onChange={(e: any) => this.props.onAddressDataChange('addressLine1', e.target.value)}
          type='text'
          onKeyDown={this.handleKeyDown}
          autoFocus={true}/>
        <div className='title'>Address Line 2</div>
        <input
          className='wideInput inputField'
          placeholder='Enter address line 2 (optional)'
          value={this.props.addressLine2}
          onChange={(e: any) => this.props.onAddressDataChange('addressLine2', e.target.value)}
          onKeyDown={this.handleKeyDown}
          type='text'/>
        <div className='flex'>
          <div>
            <div className='title'>Zipcode</div>
            <input
              className='narrowInput inputField'
              placeholder='Enter zipcode'
              value={this.props.zipCode}
              onChange={(e: any) => this.props.onAddressDataChange('zipCode', e.target.value)}
              type='text'/>
          </div>
          <div>
            <div className='title'>State</div>
            <input
              className='narrowInput inputField'
              placeholder='Enter state'
              value={this.props.state}
              onChange={(e: any) => this.props.onAddressDataChange('state', e.target.value)}
              onKeyDown={this.handleKeyDown}
              type='text'/>
          </div>
        </div>
        <div className='flex'>
          <div>
            <div className='title'>City</div>
            <input
              className='narrowInput inputField'
              placeholder='Enter city'
              value={this.props.city}
              onChange={(e: any) => this.props.onAddressDataChange('city', e.target.value)}
              onKeyDown={this.handleKeyDown}
              type='text'/>
          </div>
          <div>
            <div className='title'>Country</div>
            <input
              className='narrowInput inputField'
              placeholder='Enter country'
              value={this.props.country}
              onChange={(e: any) => this.props.onAddressDataChange('country', e.target.value)}
              onKeyDown={this.handleKeyDown}
              type='text'/>
          </div>
        </div>
      </div>
    )
  }

  private confirmButtons = (): JSX.Element => {
    return (
      <div className='flex mt25'>
        <style jsx={true}>{`
           .purchaseButton {
             @p: .white, .bgGreen, .br2, .buttonShadow, .ph16, .pv10, .pointer;
           }
        `}</style>
        <div
          className={`flex itemsCenter blue mr25 pr16 pv10 pointer`}
          onClick={() => {
            this.setState({displayState: 'CREDIT_CARD_DATA'} as State)
          }}
        >
          <Icon
            src={require('../../../assets/icons/blue_arrow_left.svg')}
            width={17}
            height={12}
          />
          <div className='ml6 nowrap'>Credit card details</div>
        </div>

        <div
          className={`purchaseButton ${!this.props.addressDataValid && 'o50'}`}
          onClick={() => this.props.onSaveChanges()}>
          Save changes
        </div>
      </div>
    )
  }

  private handleKeyDown = (e) => {
    if (e.keyCode === ENTER_KEY) {
      if (this.state.displayState === 'CREDIT_CARD_DATA') {
        if (this.props.creditCardDetailsValid) {
          this.setState({displayState: 'ADDRESS_DATA'} as State)
        }
      } else {
        if (this.props.addressDataValid) {
          this.props.onSaveChanges()
        }
      }

    } else if (e.keyCode === ESCAPE_KEY) {
      this.props.setEditingState(false, false)
    }
  }

}
