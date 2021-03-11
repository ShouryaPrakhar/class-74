import * as firebase from 'firebase'
require("@firebase/firestore")

var firebaseConfig = {
    apiKey: "AIzaSyAfdY1gelp5RFTTdz7Of6tuQlle-4o0Sj0",
    authDomain: "wily-3531a.firebaseapp.com",
    projectId: "wily-3531a",
    storageBucket: "wily-3531a.appspot.com",
    messagingSenderId: "382151948240",
    appId: "1:382151948240:web:ecd173f86deb2ec2e32bd5"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()