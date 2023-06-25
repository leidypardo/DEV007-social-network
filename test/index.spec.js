import { login, registerUser } from '../src/utils.js';
import { auth } from '../src/firebase.js';
// Mock de la función signInWithEmailAndPassword
jest.mock('../src/firebase.js', () => ({
  auth: {
    signInWithEmailAndPassword: jest.fn().mockResolvedValue('mocked user'),
    createUserWithEmailAndPassword: jest.fn().mockResolvedValue('mocked user'),
  },
}));

describe('Firebase Authentication', () => {
  describe('login', () => {
    it('should sign in with the provided email and password', async () => {
      const email = 'test@example.com';
      const password = 'password';

      // Llama a la función login
      const result = await login(email, password);

      // Verifica que se haya llamado a signInWithEmailAndPassword con los argumentos correctos
      expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith(email, password);

      // Verifica que la función devuelva el resultado esperado
      expect(result).toEqual('mocked user');
    });
  });

  describe('registerUser', () => {
    it('should register a new user with the provided email and password', async () => {
      const email = 'test@example.com';
      const password = 'password';

      // Llama a la función registerUser
      const result = await registerUser(email, password);

      // Verifica que se haya llamado a createUserWithEmailAndPassword con los argumentos correctos
      expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith(email, password);

      // Verifica que la función devuelva el resultado esperado
      expect(result).toEqual('mocked user');
    });
  });
});
