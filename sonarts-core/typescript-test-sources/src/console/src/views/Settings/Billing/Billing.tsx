import * as React from 'react'
import CurrentPlan from './CurrentPlan'
import Usage from './Usage'
import CreditCardInformation from './CreditCardInformation'
import {chunk, mmDDyyyyFromTimestamp} from '../../../utils/utils'
import * as Relay from 'react-relay'
import {Viewer, Invoice} from '../../../types/types'
import {creditCardNumberValid, expirationDateValid, cpcValid,
  minCPCDigits, minCreditCardDigits, maxCPCDigits, maxCreditCardDigits} from '../../../utils/creditCardValidator'
import SetCreditCardMutation from '../../../mutations/SetCreditCardMutation'
import Loading from '../../../components/Loading/Loading'
import {ShowNotificationCallback} from '../../../types/utils'
import {connect} from 'react-redux'
import {showNotification} from '../../../actions/notification'
import {bindActionCreators} from 'redux'
import {onFailureShowNotification} from '../../../utils/relay'

interface State {
  newCreditCardNumber: string
  newCardHolderName: string
  newExpirationDate: string
  newCPC: string
  isEditingCreditCardInfo: boolean

  newAddressLine1: string
  newAddressLine2: string
  newZipCode: string
  newState: string
  newCity: string
  newCountry: string

  creditCardDetailsValid: boolean
  addressDataValid: boolean

  isLoading: boolean
}

interface Props {

  viewer: Viewer
  node: Node
  location: any
  params: any
  projectName: string

  cpc: string
  children: JSX.Element

  relay: any

  showNotification: ShowNotificationCallback
}

class Billing extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {

      newCreditCardNumber: '',
      newCardHolderName: '',
      newExpirationDate: '',
      newCPC: '',
      newAddressLine1: '',
      newAddressLine2: '',
      newZipCode: '',
      newState: '',
      newCity: '',
      newCountry: '',

      isEditingCreditCardInfo: false,

      creditCardDetailsValid: false,
      addressDataValid: false,

      isLoading: false,
    }
  }

  render() {

    const crmProjectsAvailable = Boolean(this.props.viewer.crm) && Boolean(this.props.viewer.crm.crm) &&
      Boolean(this.props.viewer.crm.crm.customer) && Boolean(this.props.viewer.crm.crm.customer.projects)

    if (!crmProjectsAvailable) {
      return (
        <div className='flex flexColumn itemsCenter justifyCenter ph96 tc size black50'>
          <style jsx={true}>{`
            .size {
              height: 350px;
              width: 700px;
            }
          `}</style>
          <div>
            We're currently synchronizing your project data.
            Please wait a little bit until Billing is available here.
          </div>
          <div className='mt16'>
            If you have a question, please contact our support team! 👋
          </div>
        </div>
      )
    }

    const projectNode = this.props.viewer.crm.crm.customer.projects.edges.find(edge => {
      return edge.node.name === this.props.projectName
    })

    let project = null
    if (projectNode && projectNode.node) {
      project = projectNode.node
    }

    if (!Boolean(project)) {
      return (
        <div className='flex flexColumn itemsCenter justifyCenter ph96 tc size black50'>
          <style jsx={true}>{`
            .size {
              height: 350px;
              width: 700px;
            }
          `}</style>
          <div>
            We're currently synchronizing your project data.
            Please wait a little bit until Billing is available here.
          </div>
          <div className='mt16'>
            If you have a question, please contact our support team! 👋
          </div>
        </div>
      )
    }

    const seats = this.props.viewer.project.seats.edges.map(edge => edge.node.name)

    const invoices: Invoice[] = project.projectBillingInformation.invoices.edges.map(edge => edge.node)
    const currentInvoice = invoices[invoices.length - 1]
    const creditCard = project.projectBillingInformation.creditCard
    const expirationYear = creditCard ? creditCard.expYear.toString().substr(2,2) : ''
    const creditCardNumber = creditCard ? 'XXXX XXXX XXXX ' + creditCard.last4 : ''
    const expirationDate = creditCard ? creditCard.expMonth + '/' + expirationYear : ''

    return (
      <div className={`container ${this.state.isEditingCreditCardInfo && 'bottomPadding'}`}>
        <style jsx={true}>{`

          .container {
            @p: .br;
            max-width: 700px;
            border-color: rgba( 229, 229, 229, 1);
          }

          .bottomPadding {
            padding-bottom: 110px;
          }

          .loadingContainer {
            @p: .absolute, .flex, .itemsCenter, .justifyCenter;
            top: 0px;
            bottom: 0px;
            left: 0px;
            right: 0px;
            background-color: rgb(250,250,250);
          }

        `}</style>
        <CurrentPlan
          plan={project.projectBillingInformation.plan}
          projectName={this.props.params.projectName}
          exceedsAllowedStorage={currentInvoice.overageStorage > 0}
          exceedsAllowedRequests={currentInvoice.overageRequests > 0}
        />
        <Usage
          usedSeats={seats}
          plan={project.projectBillingInformation.plan}
          lastInvoiceDate={mmDDyyyyFromTimestamp(currentInvoice.timestamp)}
          currentNumberOfRequests={currentInvoice.usageRequests.reduce((a,b) => a + b, 0)}
          usedStoragePerDay={currentInvoice.usageStorage}
          overageRequests={currentInvoice.overageRequests}
          overageStorage={currentInvoice.overageStorage}
        />
        {!this.state.isLoading ?
          (project.projectBillingInformation.creditCard &&
            <CreditCardInformation
              onCreditCardNumberChange={this.updateCreditCardNumber}
              onCardHolderNameChange={(newValue) => this.setState({newCardHolderName: newValue} as State)}
              onExpirationDateChange={this.updateExpirationDate}
              onCPCChange={this.updateCPC}
              setEditingState={this.setEditingState}
              isEditing={this.state.isEditingCreditCardInfo}
              creditCardNumber={this.state.isEditingCreditCardInfo ? this.state.newCreditCardNumber : creditCardNumber}
              cardHolderName={this.state.isEditingCreditCardInfo ? this.state.newCardHolderName : creditCard.name}
              expirationDate={this.state.isEditingCreditCardInfo ? this.state.newExpirationDate : expirationDate}
              cpc={this.state.newCPC}
              addressLine1={this.state.newAddressLine1}
              addressLine2={this.state.newAddressLine2}
              zipCode={this.state.newZipCode}
              state={this.state.newState}
              city={this.state.newCity}
              country={this.state.newCountry}
              creditCardDetailsValid={this.state.creditCardDetailsValid}
              addressDataValid={this.state.addressDataValid}
              onAddressDataChange={this.onAddressDataChange}
              onSaveChanges={this.initiateUpdateCreditCard}
              invoices={invoices}
            />
          )
          :
          (
            <div className='loadingContainer'>
              <Loading/>
            </div>
          )
        }

        {this.props.children}
      </div>
    )
  }

  private updateCPC = (newValue) => {
    let newCPC
    if (newValue.length > maxCPCDigits) {
      newCPC = newValue.substr(0, maxCPCDigits)
    } else {
      newCPC = newValue
    }
    this.setState(
      {newCPC: newCPC} as State,
      () => this.validateCreditCardDetails(),
    )
  }

  private updateExpirationDate = (newValue) => {
    if (newValue.length > 5) {
      return
    }
    this.setState(
      {newExpirationDate: newValue} as State,
      () => this.validateCreditCardDetails(),
    )

  }

  private updateCreditCardNumber = (newValue) => {

    // max chunks is 5 since a credit card can have up to 19 digits
    const maxChunks = 5

    // pasting
    if (newValue.length > 4 && !newValue.includes(' ')) {
      const chunks = chunk(newValue, maxChunks, true)
      const newCreditCardNumber = chunks.join(' ')
      this.setState(
        {newCreditCardNumber: newCreditCardNumber} as State,
        () => this.validateCreditCardDetails(),
      )
      return
    }

    // regular typing
    let creditCardComponents = newValue.split(' ')
    const lastComponent = creditCardComponents[creditCardComponents.length - 1]

    const newValueWithoutSpaces = creditCardComponents.join('')
    if (newValueWithoutSpaces.length > maxCreditCardDigits) {
      return
    }

    let newLastComponent
    if (creditCardComponents.length <= maxChunks && lastComponent.length === 4) {
      newLastComponent = lastComponent + ' '
    } else {
      newLastComponent = lastComponent
    }

    creditCardComponents[creditCardComponents.length - 1] = newLastComponent
    const newCreditCardNumber = creditCardComponents.join(' ')
    this.setState(
      {newCreditCardNumber: newCreditCardNumber} as State,
      () => this.validateCreditCardDetails(),
    )
  }

  private setEditingState = (isEditing: boolean, saveChanges: boolean) => {
    this.setState({isEditingCreditCardInfo: isEditing} as State)
  }

  private validateAddressDetails = () => {
    const addressLine1Valid = this.state.newAddressLine1.length > 0
    const zipcodeValid = this.state.newZipCode.length > 0
    const stateValid = this.state.newState.length > 0
    const cityValid = this.state.newCity.length > 0
    const countryValid = this.state.newCountry.length > 0
    const addressValid = addressLine1Valid && zipcodeValid && stateValid && cityValid && countryValid
    this.setState({addressDataValid: addressValid} as State)

  }

  private validateCreditCardDetails = () => {
    const isCreditCardNumberValid = creditCardNumberValid(this.state.newCreditCardNumber)
    const isExpirationDateValid = expirationDateValid(this.state.newExpirationDate)
    const isCPCValid = cpcValid(this.state.newCPC)
    this.setState({creditCardDetailsValid: isCreditCardNumberValid && isExpirationDateValid && isCPCValid} as State)
  }

  private onAddressDataChange = (fieldName: string, newValue: string) => {
    switch (fieldName) {
      case 'addressLine1':
        this.setState(
          {newAddressLine1: newValue} as State,
          () => this.validateAddressDetails(),
        )
        break
      case 'addressLine2':
        this.setState(
          {newAddressLine2: newValue} as State,
          () => this.validateAddressDetails(),
        )
        break
      case 'city':
        this.setState(
          {newCity: newValue} as State,
          () => this.validateAddressDetails(),
        )
        break
      case 'zipCode':
        this.setState(
          {newZipCode: newValue} as State,
          () => this.validateAddressDetails(),
        )
        break
      case 'state':
        this.setState(
          {newState: newValue} as State,
          () => this.validateAddressDetails(),
        )
        break
      case 'country':
        this.setState(
          {newCountry: newValue} as State,
          () => this.validateAddressDetails(),
        )
        break
      default:
        break
    }
  }

  private initiateUpdateCreditCard = () => {

    const expirationDateComponents = this.state.newExpirationDate.split('/')
    const expirationMonth = expirationDateComponents[0]
    const expirationYear = expirationDateComponents[1]

    this.setState({isLoading: true} as State)

    if (this.state.creditCardDetailsValid && this.state.addressDataValid) {
      Stripe.card.createToken(
        {
          number: this.state.newCreditCardNumber,
          cvc: this.state.newCPC,
          exp_month: expirationMonth,
          exp_year: expirationYear,
          name: this.state.newCardHolderName,
          address_line1: this.state.newAddressLine1,
          address_line2: this.state.newAddressLine2,
          address_city: this.state.newCity,
          address_state: this.state.newState,
          address_zip: this.state.newZipCode,
          address_country: this.state.newCountry,
        },
        this.stripeResponseHandler,
      )
    }

  }

  private stripeResponseHandler = (status, response) => {

    if (response.error) {
      console.error(response.error)
      this.props.showNotification({message: response.error.message, level: 'error'})
      this.setState({isLoading: false} as State)
      return
    }

    const token = response.id

    Relay.Store.commitUpdate(
      new SetCreditCardMutation({
        projectId: this.props.viewer.project.id,
        token: token,
      }),
      {
        onSuccess: () => {
          this.setState({
            isEditingCreditCardInfo: false,
            isLoading: false,
          } as State)
          this.props.relay.forceFetch()
        },
        onFailure: (transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
          this.setState({isLoading: false} as State)
        },
      },
    )
  }

}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({showNotification}, dispatch)
}

const mappedBilling = connect(null, mapDispatchToProps)(Billing)

export default Relay.createContainer(mappedBilling, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        project: projectByName(projectName: $projectName) {
          id
          name
          seats(first: 1000) {
            edges {
              node {
                name
              }
            }
          }
        },
        crm: user {
          name
          crm {
            customer {
              id
              projects(first: 1000) {
                edges {
                  node {
                    name
                    projectBillingInformation {
                      plan
                      invoices(first: 1000)  {
                        edges {
                          node {
                            overageRequests
                            usageRequests
                            usageStorage
                            usedSeats
                            timestamp
                            total
                          }
                        }
                      }
                      creditCard {
                        addressCity
                        addressCountry
                        addressLine1
                        addressLine2
                        addressState
                        addressZip
                        expMonth
                        expYear
                        last4
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `},
})
