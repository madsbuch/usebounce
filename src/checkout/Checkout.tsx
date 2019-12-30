import React from 'react';
import AmountPicker from './AmountPicker'
import { interpret, Interpreter, State } from 'xstate'
import { makeCheckoutMachine, Context } from './CheckoutMachine';

interface Product {
  displayName: string
  amount: number
  sku: string
  price: number // dollar cents
}

interface PersonalDetails {
  name: string
  email: string
}

interface PaymentDetail {
  cardNumber: string
}

interface IState {
  // We use an indexed strategy to be able to change values from handlers
  basket: { [sku: string]: Product }

  personal: PersonalDetails
  payment: PaymentDetail
  current: State<Context>
}

interface OrderRequest {
  personalDetails: PersonalDetails
  paymentDetails: PaymentDetail
  basket: Product[]
}

class Checkout extends React.Component<{}, IState> {
  constructor(props:{}) {
    super(props)
    this.checkoutState = interpret(makeCheckoutMachine(this.registerOrder.bind(this)))
      .onTransition(current =>
        this.setState({ current })
      )
  }

  componentDidMount() {
    this.checkoutState.start();
  }

  componentWillUnmount() {
    this.checkoutState.stop();
  }

  state = {
    current: makeCheckoutMachine(this.registerOrder.bind(this)).initialState,
    personal: {
      name: "",
      email: ""
    },
    payment: {
      cardNumber: ""
    },
    basket: {
      'largeBags': {
        displayName: 'Large Bags',
        amount: 1,
        sku: 'largeBags',
        price: 590
      },
      'smallBags': {
        displayName: 'Small Bags',
        amount: 1,
        sku: 'smallBags',
        price: 400
      }
    }
  }

  checkoutState: Interpreter<Context>
  

  updatePaymentDetails (card: string) {
    this.setState({
      payment: {
        cardNumber: card
      }
    })
  }

  updatePersonalDetails (field: 'name' | 'email', value: string) {
    this.setState(state => ({
      personal: {
        ...state.personal,
        [field]: value
      }
    }))
  }

  setAmount (sku: string, n: number) {
    // No validation happens here
    this.setState(state => ({
      basket: {
        ...state.basket,
        [sku]: {
          ...state.basket[sku],
          amount: n
        }
      }
    }))
  }

  async nextState () {
    this.checkoutState.send('NEXT')
  }

  async registerOrder () {
    // Collecting request
    const request: OrderRequest = {
      personalDetails: this.state.personal,
      paymentDetails: this.state.payment,
      basket: Object.values(this.state.basket)
    }
    
    // Placing order
    console.log('Requesting!', request)
    await new Promise((resolve, reject) => setTimeout(resolve, 864))
  }

  render () {
    const { current, basket, personal, payment } = this.state
    const stateName = current.value.toString()
    const meta = current.meta[`checkout.${stateName}`]

    

    const amountPickers = meta['showNumberSelector'] ? 
      Object.values(basket).map(p => {
        return (
          <AmountPicker key={p.sku} title={p.displayName} amount={p.amount} setAmount={(n) => {this.setAmount(p.sku, n)}} />
        )
      }) : (<div></div>)

    const personalDetails = meta['showPersonalForm'] ? (
      <div>
        <input placeholder="Name" value={personal.name} onChange={e => this.updatePersonalDetails('name', e.target.value)} />
        <input placeholder="Email" value={personal.email} onChange={e => this.updatePersonalDetails('email', e.target.value)} />
      </div>
    ) : (<div></div>)

    const paymentInformation = meta['showPaymentForm'] ? (
      <div>
        <input placeholder="Card details" value={payment.cardNumber} onChange={e => this.updatePaymentDetails(e.target.value)} />
      </div>
    ) : (<div></div>)

    const totalPrice = Object.values(basket).reduce((sum, c) => sum + c.amount * c.price, 0)
    const priceSummery = (
      <span>{totalPrice / 100} $</span>
    )

    const button = meta['nextTxt'] !== undefined ? 
      <button onClick={() => this.nextState()}>{meta['nextTxt']}</button> : <div></div>

    const success = meta['showSuccess'] ? <div>SUCCESS</div> : (<div></div>)
    const loading = meta['showLoading'] ? <div>LOADING</div> : (<div></div>)
    const failure = meta['showFailure'] ? <div>Failure</div> : (<div></div>)

    return (
      <div className="Checkout">
        {success}
        {loading}
        {failure}

        {amountPickers}
        {personalDetails}
        {paymentInformation}
        <div>
          {priceSummery} {button}
        </div>
      </div>
    );
  }
}

export default Checkout;
