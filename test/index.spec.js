// Importa la función login y cualquier otra dependencia necesaria
import { login } from '../src/utils.js';
import { auth } from '../src/firebase.js';
// Mock del objeto auth
const authMock = {
  signInWithEmailAndPassword: jest.fn((email, password) => {
    // Simula el comportamiento de signInWithEmailAndPassword
    // Puedes personalizar la respuesta según tus necesidades de prueba
    if (email === 'user@example.com' && password === 'password123') {
      return auth.signInWithEmailAndPassword(email, password);
    }
    return Promise.reject(new Error('Credenciales inválidas'));
  }),
};

describe('login', () => {
  it('should call signInWithEmailAndPassword with correct email and password', () => {
    // Llama a la función login con los parámetros adecuados
    login('user@example.com', 'password123', authMock);

    // Verifica si signInWithEmailAndPassword fue llamado con los parámetros correctos
    expect(authMock.signInWithEmailAndPassword).toHaveBeenCalledWith('user@example.com', 'password123');
  });

  it('should return userCredentials when authentication is successful', async () => {
    // Llama a la función login con los parámetros adecuados
    const result = await login('user@example.com', 'password123', authMock);

    // Verifica si la función devuelve los userCredentials esperados
    expect(result).toEqual('userCredentials');
  });
});
