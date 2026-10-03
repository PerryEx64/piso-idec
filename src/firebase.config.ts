// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDroqPXWhPUguIekztgURzgI30Av9g1DO4",
  authDomain: "piso-idec.firebaseapp.com",
  databaseURL: "https://piso-idec-default-rtdb.firebaseio.com",
  projectId: "piso-idec",
  storageBucket: "piso-idec.firebasestorage.app",
  messagingSenderId: "236194659835",
  appId: "1:236194659835:web:0fa4efddc9ffa5b4175f5e",
  measurementId: "G-08WFT57L4E"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);