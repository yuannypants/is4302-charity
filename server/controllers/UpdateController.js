import firebase from 'firebase';
import { httpGET, httpPOST } from '../utils/httpUtils'
import * as HttpStatus from 'http-status-codes';

const db = firebase.database();

export function updateParticipantOrAsset (req, res) {
  let url = 'http://localhost:3000/bc/api/' + req.params.type;
  let firebaseRef = req.params.type;
  if (req.params.id) {
    url += '/' + req.params.id;
    firebaseRef += '/' + req.params.id;
  }

  // Do something with blockchain
  httpGET(url)
  .then(responseFromComposer => {
    res.json(responseFromComposer.data);
  })
   .catch(err => {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      errorSource: "blockchain",
      // err,
    })
  })
}
