import * as React from 'react'
import CreditCardFront from './CreditCardFront'
import EditCreditCard from './EditCreditCard'
import {Invoice} from '../../../types/types'
import {mmDDyyyyFromTimestamp} from '../../../utils/utils'

interface Props {
  creditCardNumber: string
  cardHolderName: string
  expirationDate: string
  cpc: string
  onCreditCardNumberChange: Function
  onCardHolderNameChange: Function
  onExpirationDateChange: Function
  onCPCChange: Function

  isEditing: boolean
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

  invoices: Invoice[]
}

export default class CreditCardInformation extends React.Component<Props, {}> {

  render() {
    return (
      <div className={`container ${this.props.isEditing ? 'bgWhite height350' : 'bgBlack04'}`}>
        <style jsx={true}>{`

          .container {
            @p: .ph60, .pt38, .pb96, .w100, .bt;
            border-color: rgba( 229, 229, 229, 1);
          }

          .title {
            @p: .mb38, .black30, .fw6, .f14, .ttu;
          }

          .paddingBottom110 {
            padding-bottom: 110px;
          }

          .height350 {
            height: 350px;
          }

        `}</style>

        {this.props.isEditing ?
          (
            <div className={''}>
              <div className='title'>Credit Card Information</div>
              {this.creditCardInEditingState()}
            </div>
          )
          :
          (<div className='flex'>
            <div>
              <div className='title'>Credit Card Information</div>
              {this.creditCardInNonEditingState()}
            </div>
            <div>
              <div className='title ml38'>Payment History</div>
              {this.paymentHistory()}
            </div>
          </div>)

        }

      </div>
    )
  }

  private paymentHistory = () => {
    return (
      <div className='ml38'>
        <style jsx={true}>{`

          .row {
            @p: .flex, .justifyBetween, .bb, .w100, .pt10, .pb16;
            border-color: rgba( 229, 229, 229, 1);
          }

          .date {
            @p: .f16, .black50;
          }

          .price {
            @p: .f16, .blue, .ml38;
          }

        `}</style>
        {this.props.invoices.map((invoice, i) => {
          return (
            <div key={i} className='row'>
              <div className='date'>{mmDDyyyyFromTimestamp(invoice.timestamp)}</div>
              <div className='price'>$ {invoice.total.toFixed(2)}</div>
            </div>
          )
        })}
      </div>
    )
  }

  private creditCardInNonEditingState = (): JSX.Element => {

    return (
      <CreditCardFront
        cardHolderName={this.props.cardHolderName}
        creditCardNumber={this.props.creditCardNumber}
        expirationDate={this.props.expirationDate}
        isEditing={this.props.isEditing}
        setEditingState={this.props.setEditingState}
      />
    )
  }

  private creditCardInEditingState = (): JSX.Element => {
    return (
        <EditCreditCard
          creditCardNumber={this.props.creditCardNumber}
          cardHolderName={this.props.cardHolderName}
          expirationDate={this.props.expirationDate}
          cpc={this.props.cpc}
          onCreditCardNumberChange={this.props.onCreditCardNumberChange}
          onCardHolderNameChange={this.props.onCardHolderNameChange}
          onExpirationDateChange={this.props.onExpirationDateChange}
          onCPCChange={this.props.onCPCChange}
          setEditingState={this.props.setEditingState}
          addressLine1={this.props.addressLine1}
          addressLine2={this.props.addressLine2}
          zipCode={this.props.zipCode}
          state={this.props.state}
          city={this.props.city}
          country={this.props.country}
          creditCardDetailsValid={this.props.creditCardDetailsValid}
          addressDataValid={this.props.addressDataValid}
          onAddressDataChange={this.props.onAddressDataChange}
          onSaveChanges={this.props.onSaveChanges}
        />
    )
  }

}
