import firebase from 'firebase';
import 'firebase/storage';
import { httpGET, httpPOST } from '../utils/httpUtils'
import * as HttpStatus from 'http-status-codes';

const db = firebase.database();
const storage = firebase.storage();

export function createDonationDrive(req, res) {
  let { name, purpose, beneficiariesId, suppliersId } = req.body;
  let url = 'http://localhost:3000/bc/api/CreateDonationDrive';
  let beneficiaries = "[", suppliers = "[";

  for (let beneficiary of beneficiariesId)
    beneficiaries += "\"resource:com.is4302.charity.Beneficiary#" + beneficiary + "\",";
  for (let supplier of suppliersId)
    suppliers += "\"resource:com.is4302.charity.Beneficiary#" + supplier + "\",";

  let data = {
    "$class": "com.is4302.charity.CreateDonationDrive",
    "walletId": name,
    "donationDriveId": name,
    "expenditureReportId": name,
  };

  if (beneficiaries !== "[")
    data.beneficiaries = beneficiaries.substring(0, beneficiaries.length-1) + "]";

  if (suppliers !== "[")
    data.suppliers = suppliers.substring(0, beneficiaries.length-1) + "]";

  httpPOST(url, data)
  .then(responseFromComposer => {
    db.ref('DonationDrive/' + name).set({
      description: purpose,
      wallet: name,
      expenditureReport: name,
      beneficiaries: beneficiariesId,
      suppliers: suppliersId

    }, firebaseError => {
      if (firebaseError)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          errorSource: "firebase",
          firebaseError,
        });
    })
    .then(() => {
      db.ref('Wallet/' + name).set({
        balance: 0
      }, firebaseError => {
        if (firebaseError)
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            errorSource: "firebase",
            firebaseError,
          });
      })
      .then(() => {
        db.ref('ExpenditureReport/' + name).set({
          receipts: []
        }, firebaseError => {
          if (firebaseError)
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
              errorSource: "firebase",
              firebaseError,
            });
          else
            res.json(responseFromComposer.data);
        })
      })
    })
  })
  .catch(err => {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      errorSource: "blockchain",
      // err
    })
  })

  // Do something with blockchain
  // httpPOST(url, data)
  // .then(responseFromComposer => {
  //   // Do something with Firebase
  //   db.ref(firebaseRef).set({
  //     key1: "value1",
  //     key2: "value2",
  //   }, firebaseError => {
  //     if (firebaseError)
  //       res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //         errorSource: "firebase",
  //         firebaseError,
  //       });
  //     else
  //       res.json({
  //         responseFromComposer,
  //         key1: "value1",
  //         key2: "value2",
  //       });
  //   })
  // })
  // .catch(err => {
  //   res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //     errorSource: "blockchain",
  //     // err
  //   })
  // })
}

export function createFundTransferRequest(req, res) {
  let { name, purpose, amount, donationDriveId, beneficiariesId, suppliersId } = req.body;
  let url = 'http://localhost:3000/bc/api/CreateFundTransferRequest';
  let firebaseRef = 'FundTransferRequest/' + name;

  let beneficiaries = "[", suppliers = "[";
  for (let beneficiary of beneficiariesId)
    beneficiaries += "\"resource:com.is4302.charity.Beneficiary#" + beneficiary + "\",";
  for (let supplier of suppliersId)
    suppliers += "\"resource:com.is4302.charity.Beneficiary#" + supplier + "\",";

  let data = {
    "$class": "com.is4302.charity.CreateFundTransferRequest",
    "fundTransferRequestId": name,
    "purpose": purpose,
    "amount": amount,
    "donationDrive": "com.is4302.charity.DonationDrive#" + donationDriveId,
  };

  if (beneficiaries !== "[")
    data.beneficiaries = beneficiaries.substring(0, beneficiaries.length-1) + "]";

  if (suppliers !== "[")
    data.suppliers = suppliers.substring(0, beneficiaries.length-1) + "]";

  // Do something with blockchain
  httpPOST(url, data)
    .then(responseFromComposer => {
      db.ref(firebaseRef).set({
        purpose: purpose,
        amount: amount,
        approvalStatus: "NOT_APPROVED",
        donationDrive: donationDriveId,
        validators: [],
        beneficiaries: beneficiariesId,
        suppliers: suppliersId
      }, firebaseError => {
        if (firebaseError)
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            errorSource: "firebase",
            firebaseError,
          });
        else
          res.json(responseFromComposer.data);
      })
    })
    .catch(err => {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errorSource: "blockchain"
      })
    }
    )
}

export function makeDonation(req, res) {
  let { amount, donationDriveName } = req.body;
  let url = 'http://localhost:3000/bc/api/MakeDonation';
  let data = {
    "$class": "com.is4302.charity.MakeDonation",
    "amount": amount,
    "donationDrive": donationDriveName,
  };

  // Do something with blockchain
  httpPOST(url, data)
    .then(responseFromComposer => {
      // Do something with Firebase
      console.log("MakeDonation: RFC " + responseFromComposer);
    })
    .catch(err => {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errorSource: "blockchain",
        // err
      })
    })
}

export function transferFunds(req, res) {
  let { value1, value2 } = req.body;
  let url = 'http://localhost:3000/bc/api/TransferFund';
  let firebaseRef = 'somePath/' + 'someId';
  let data = {
    "$class": "com.is4302.charity.TransferFund",
    "amount": 0,
    "donationDrive": {},
    "beneficiaries": [
      {}
    ],
    "suppliers": [
      {}
    ],
  };

  // Do something with blockchain
  httpPOST(url, data)
    .then(responseFromComposer => {
      // Do something with Firebase
      db.ref(firebaseRef).set({
        key1: "value1",
        key2: "value2",
      }, firebaseError => {
        if (firebaseError)
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            errorSource: "firebase",
            firebaseError,
          });
        else
          res.json({
            data: responseFromComposer.data,
            key1: "value1",
            key2: "value2",
          });
      })
    })
    .catch(err => {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errorSource: "blockchain",
        // err
      })
    })
}

export function validateFundTransferRequest(req, res) {
  let { value1, value2 } = req.body;
  let url = 'http://localhost:3000/bc/api/ValidateFundTransferRequest';
  let firebaseRef = 'somePath/' + 'someId';
  let data = {
    "$class": "com.is4302.charity.ValidateFundTransferRequest",
    "fundTransferRequest": {},
  };

  // Do something with blockchain
  httpPOST(url, data)
    .then(responseFromComposer => {
      // Do something with Firebase
      db.ref(firebaseRef).set({
        key1: "value1",
        key2: "value2",
      }, firebaseError => {
        if (firebaseError)
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            errorSource: "firebase",
            firebaseError,
          });
        else
          res.json({
            data: responseFromComposer.data,
            key1: "value1",
            key2: "value2",
          });
      })
    })
    .catch(err => {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errorSource: "blockchain",
        // err
      })
    })
}

export function walletTransaction(req, res) {
  let { amount, transferType, walletId, walletBalance } = req.body;
  let url = 'http://localhost:3000/bc/api/WalletTransaction';
  let firebaseRef = 'Wallet/' + walletId;
  let data = {
    "$class": "com.is4302.charity.WalletTransaction",
    "amount": amount,
    "transferType": transferType,
  };

  // Do something with blockchain
  httpPOST(url, data)
    .then(responseFromComposer => {
      let balance = walletBalance
      if (transferType === 'TOP_UP') {
        balance += amount;
      } else if (transferType === 'WITHDRAW') {
        balance -= amount;
      }
      // Do something with Firebase
      db.ref(firebaseRef).set({
        balance: balance
      }, firebaseError => {
        if (firebaseError)
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            errorSource: "firebase",
            firebaseError,
          });
        else
          res.json({
            data: responseFromComposer.data,
            key1: "value1",
            key2: "value2",
          });
      })
    })
    .catch(err => {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errorSource: "blockchain",
        // err
      })
    })
}

export function uploadReceipt(req, res) {
  let { receipt, donationDrive } = req.body;
  console.log(receipt)
  let url = 'http://localhost:3000/bc/api/UploadReceipt';
  let firebaseRef = 'Receipts/' + donationDrive;
  console.log(firebaseRef);
  // let data = {
  //   "$class": "com.is4302.charity.UploadReceipt",
  //   "filePath": "string",
  //   "donationDrive": {}
  // };

  // // Do something with blockchain
  // httpPOST(url, data)
  // .then(responseFromComposer => {
  //   // Do something with Firebase
  console.log("Uploading")
  storage.ref().putString(receipt)
    .then(response => {
      console.log("Uploaded");
    })
    .catch(firebaseError => {
      console.log("Error");
      if (firebaseError)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          errorSource: "firebase",
          firebaseError,
        });
      else
        res.json({
          data: responseFromComposer.data,
          key1: "value1",
          key2: "value2",
        });
    })
  // })
  // .catch(err => {
  //   res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //     errorSource: "blockchain",
  //     // err
  //   })
  // })
}
