import { auth, db } from './firebase.js';

export function login(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
  // Realiza el inicio de sesión utilizando el correo electrónico y la contraseña proporcionados
}

export function registerUser(email, password) {
  return auth
  // Registra un nuevo usuario utilizando el correo electrónico y la contraseña proporcionados
    .createUserWithEmailAndPassword(email, password);
}

// Función para cerrar sesión con Firebase
export function logout() {
  return auth.signOut(); // Cierra la sesión del usuario actual
}

export function postCreate() {
  return db.collection('posts');
}

export function likeAdd() {
  return db.collection('posts');
}

export function likeRemove() {
  return db.collection('posts');
}
export function likeToggle() {
  return db.collection('posts');
}

export function postRemove(postId) {
  return db.collection('posts')
    .doc(postId);
}
