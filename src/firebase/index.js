import firebase from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" with {"type": "json"}

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

export default firebase;