// Configura tu proyecto de Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyBOTSLuyWdoH76-xc2Ph5-5qwc3dc1udf0',
  authDomain: 'social-neteork-pets-friends.firebaseapp.com',
  projectId: 'social-neteork-pets-friends',
  storageBucket: 'social-neteork-pets-friends.appspot.com',
  messagingSenderId: '167040868255',
  appId: '1:167040868255:web:7bc965d5752f27744527aa',
  measurementId: 'G-R033QPK9NE',
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth(); // llama del servicio de autenticación de Firebase
export const db = firebase.firestore(); // Instancia del servicio de Firestore de Firebase
export const storage = firebase.storage(); // Instancia del servicio de almacenamiento de Firebase
