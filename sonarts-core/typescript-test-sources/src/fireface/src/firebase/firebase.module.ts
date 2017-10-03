import {AngularFireModule, AuthMethods} from 'angularfire2';

export const firebaseConfig = {
    apiKey: "AIzaSyD7bGxAIRIRnyZW5NA7zP5kSPwP7V6-C68",
    authDomain: "fireface-67069.firebaseapp.com",
    databaseURL: "https://fireface-67069.firebaseio.com",
    storageBucket: "fireface-67069.appspot.com",
    messagingSenderId: "214551026167"
};

export const firebaseAuthConfig = {
  method: AuthMethods.Popup,
  remember: 'default'
};

export const FirebaseModule = AngularFireModule.initializeApp(firebaseConfig, firebaseAuthConfig);
