import React from 'react';

interface Props {
  setAmount: (n: number) => void
  amount: number
  title: string
}

class AmountPicker extends React.Component<Props> {
  addAmount (n: number) {
    // Validate
    if (this.props.amount + n < 0) {
      return // abort, we do not support negative amounts here
    }

    // Lift the value
    this.props.setAmount(this.props.amount + n)
  }

  render () {
    return (
      <div>
        Number of {this.props.title} <button onClick={() => this.addAmount(-1)}>-</button> {this.props.amount} <button onClick={() => this.addAmount(1)}>+</button>
      </div>
    );
  }
}

export default AmountPicker;
