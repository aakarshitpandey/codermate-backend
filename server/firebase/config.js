import * as firebase from "firebase/app";

import admin from 'firebase-admin'
import "firebase/auth";
import "firebase/firestore";

import * as firebaseConfig from '../../firebase.json'
import * as serviceAccountConfig from '../../firebaseServiceAcct.json'

firebase.initializeApp(firebaseConfig);

(function setUpServiceAcct() {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountConfig),
        databaseURL: "https://chatbot-8510b.firebaseio.com"
    })
})()