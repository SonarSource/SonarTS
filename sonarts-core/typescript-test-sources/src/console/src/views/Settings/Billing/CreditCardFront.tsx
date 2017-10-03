import * as React from 'react'
import {Icon} from 'graphcool-styles'

interface State {

}

interface Props {
  className?: string
  creditCardNumber: string
  cardHolderName: string
  expirationDate: string
  isEditing: boolean
  shouldDisplayVisaLogo?: boolean
  setEditingState?: Function
  onCreditCardNumberChange?: Function
  onCardHolderNameChange?: Function
  onExpirationDateChange?: Function
  onKeyDown?: Function
}

export default class CreditCardFront extends React.Component<Props, State> {

  render() {
    return (
      <div className={`container ${this.props.className || ''}`}>
        <style jsx={true}>{`

          .container {
            @p: .bgBlue, .ph16;
            border-radius: 5px;
            height: 220px;
            width: 350px;
          }

        `}</style>

        {this.topPart()}
        {this.bottomPart()}
      </div>
    )
  }

  private topPart = () => {

    if (!this.props.isEditing) {
      return (
        <div className='topNonEditing'>
          <style jsx={true}>{`
          .topNonEditing {
            @p: .flex, .pt16, .justifyBetween;
            height: 110px;
          }
        `}</style>
          <div
            onClick={() => this.props.setEditingState(true)}
          >
            {this.props.setEditingState && <Icon
              className='pointer'
              src={require('../../../assets/icons/edit_credit_card.svg')}
              width={26}
              height={26}
            />}
          </div>
          <Icon
            src={require('../../../assets/icons/visa.svg')}
            width={62}
            height={20}
          />
        </div>
      )
    } else if (this.props.isEditing && !this.props.shouldDisplayVisaLogo) {
      return (
        <div className='topEditing'>
          <style jsx={true}>{`

            .topEditing {
              @p: .pt16, .pr10, .flex, .justifyEnd;
              height: 110px;
            }

            .buttons {
              @p: .flex, .itemsCenter;
              height: 35px;
            }

          `}</style>
          <div className='buttons'>
            <div
              onClick={() => this.props.setEditingState(false, false)}
            >
              <Icon
                className='pointer'
                src={require('../../../assets/icons/cross_white.svg')}
                width={16}
                height={16}
              />
            </div>
            <div
              onClick={() => this.props.setEditingState(false, true)}
            >
              <Icon
                className='pointer ml16'
                src={require('../../../assets/icons/confirm_white.svg')}
                width={35}
                height={35}
              />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className='topEditing'>
        <style jsx={true}>{`
          .topEditing {
            @p: .pt16, .pr10, .flex, .justifyEnd;
            height: 110px;
          }
        `}</style>
        <Icon
          src={require('../../../assets/icons/visa.svg')}
          width={62}
          height={20}
        />
      </div>
    )

  }

  private bottomPart = () => {

    return (

      !this.props.isEditing ?

        <div
          className='bottomNonEditing'
          style={{marginTop: '-20px'}}
        >
          <style jsx={true}>{`

            .creditCardNumber {
              @p: .f20, .white;
              font-family: 'OCR A Std';
            }

            .bottomNonEditing {
              @p: .flex, .flexColumn, .ph10;
            }

            .creditCardFont {
              font-family: 'OCR A Std';
            }

          `}</style>
          <div className='creditCardNumber'>{this.props.creditCardNumber}</div>
          <div className='flex justifyBetween mt16'>
            <div>
              <div className='f12 fw6 white30 ttu nowrap'>Card Holder</div>
              <div className='f16 white creditCardFont mt6'>{this.props.cardHolderName}</div>
            </div>
            <div>
              <div className='f12 fw6 white30 ttu'>Expires</div>
              <div className='f16 white creditCardFont mt6'>{this.props.expirationDate}</div>
            </div>
          </div>
        </div>

        :

        <div
          className='bottomEditing'
          style={{marginTop: '-20px'}}
        >
          <style jsx={true}>{`

            .bottomNonEditing {
              @p: .flex, .flexColumn, .ph10;
            }

            .creditCardFont {
              font-family: 'OCR A Std';
            }

            .inputField {
              @p: .br2, .ba, .bDashed, .bWhite30, .bgTransparent, .pt10, .pb6, .ph10;
            }

            .expirationDateInputField {
              @p: .tc;
              max-width: 85px;
            }

            .cardHolderInputField {
              max-width: 200px;
            }

          `}</style>
          <input
            className='inputField f20 creditCardFont white'
            onChange={(e: any) => {
              this.props.onCreditCardNumberChange(e.target.value)
            }}
            placeholder='XXXX XXXX XXXX XXXX'
            value={this.props.creditCardNumber}
            autoFocus={true}
            tabIndex={1}
            onKeyDown={(e) => this.props.onKeyDown(e)}
          />
          <div className='flex justifyBetween mt10 mr16 mb10'>
            <div>
              <div className='f12 fw6 white30 ttu nowrap'>Card Holder</div>
              <input
                className='cardHolderInputField inputField f16 creditCardFont white'
                placeholder='John Appleseed'
                onChange={(e: any) => this.props.onCardHolderNameChange(e.target.value) }
                value={this.props.cardHolderName}
                tabIndex={2}
                onKeyDown={(e) => this.props.onKeyDown(e)}
              />
            </div>
            <div className=''>
              <div className='f12 fw6 white30 ttu nowrap'>Expires</div>
              <input
                className='expirationDateInputField inputField f16 creditCardFont white'
                placeholder='MM/YY'
                onChange={(e: any) => this.props.onExpirationDateChange(e.target.value) }
                value={this.props.expirationDate}
                tabIndex={3}
                onKeyDown={(e) => this.props.onKeyDown(e)}
              />
            </div>
          </div>
        </div>
    )
  }

}
