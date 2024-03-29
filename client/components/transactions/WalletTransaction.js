import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { RadioButton } from 'primereact/radiobutton';
import { httpGET, httpPOST } from '../../utils/httpUtils';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button'

const localStorage = window.localStorage;

export default class WalletTransaction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      walletId: null,
      walletBalance: 0,
      transferType: 'WITHDRAW',
      amount: 0,
      error: null,
    }

    this.getTransferType = this.getTransferType.bind(this);
    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  componentWillMount() {
    let url = 'http://localhost:3000/api/private/Wallet/' + localStorage.getItem("username");
    httpGET(url)
      .then(response => {
        this.setState({
          walletId: response.data.data.id,
          walletBalance: response.data.data.balance
        });
      })
  }

  getTransferType() {
    if (this.state.transferType === 'TOP_UP') {
      return 'top-up';
    } else if (this.state.transferType === 'WITHDRAW') {
      return 'withdraw';
    }
  }

  onClickSubmit() {
    let errorMsg = '';
    if (this.state.amount === 0) {
      errorMsg = 'Amount cannot be 0!';
    } else if (this.state.amount < 0) {
      errorMsg = 'Amount cannot be below 0!'
    } else if (isNaN(this.state.amount)) {
      errorMsg = 'Invalid amount entered!'
    } else if (this.state.transferType === 'WITHDRAW' && this.state.amount > this.state.walletBalance) {
      errorMsg = 'You do not have enough balance to withdraw this amount!';
    } else {
      let url = 'http://localhost:3000/api/private/WalletTransaction/';
      let data = {
        amount: this.state.amount,
        transferType: this.state.transferType,
        walletId: this.state.walletId,
        walletBalance: this.state.walletBalance
      }
      httpPOST(url, data)
      .then(response => {
        console.log("Done");
      }).catch(error => {
        errorMsg = 'An error had occurred while performing the transaction!'
        console.log(error);
      })
    }
    this.setState({ error: errorMsg });
  }

  render() {
    return (

      <div className="p-grid p-fluid p-justify-center">
        <Helmet>
          <title>Wallet Transaction</title>
          <meta name="description" content="Wallet Transaction" />
        </Helmet>
        <div className="p-col-12">
          <div className="card card-w-title">
            <h1>Wallet Transaction</h1>
            <div className="p-indent p-justify-center">
              <p style={{ color: "red", textAlign: "center" }} >{this.state.error}</p>
              <table cellPadding="10" width="100%">
                <tbody>
                  <tr>
                    <td width="25%">
                      <label htmlFor="currentBalance">Current Balance:</label>
                    </td>
                    <td width="75%">${parseFloat(this.state.walletBalance).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>
                      <label htmlFor="transferType">Transfer Type:</label>
                    </td>
                    <td>
                      { localStorage.getItem("participant") === "Donor" && (
                          <span>
                            <RadioButton value="TOP_UP" name="transferType" onChange={(e) => this.setState({ transferType: e.value })} checked={this.state.transferType === 'TOP_UP'}/> Top up &nbsp;
                          </span>
                        )
                      }
                      <RadioButton value="WITHDRAW" name="transferType" onChange={(e) => this.setState({ transferType: e.value })} checked={this.state.transferType === 'WITHDRAW'} /> Withdraw
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label htmlFor="amount">Amount to {this.getTransferType()}:</label>
                    </td>
                    <td>
                      <InputText id="amount" value={this.state.amount} onChange={(e) => this.setState({ amount: e.target.value })} />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan='2'>
                      <Button type="button" label="Submit" className="p-button-raised p-button-raised" onClick={this.onClickSubmit} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div >
          </div>
        </div>
      </div>
    );
  }
}
