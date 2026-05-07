const ADMIN_EMAIL = 'imbanker@naver.com';

const firebaseConfig = {
  apiKey: 'AIzaSyCUA5Rzwisqn8yl6wXNC70rd_8OkByB9ok',
  authDomain: 'newspaper-4989.firebaseapp.com',
  projectId: 'newspaper-4989',
  storageBucket: 'newspaper-4989.firebasestorage.app',
  messagingSenderId: '771356310711',
  appId: '1:771356310711:web:08fed3f2c1edc489522132',
  measurementId: 'G-ZBBFSK697Q',
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
