// Importar la función logout desde el archivo utils.js
import { logout } from '../src/utils.js';

// Importar la variable auth desde el archivo firebase en el directorio src
import { auth } from '../src/firebase';

// Simular el archivo firebase.js durante las pruebas
jest.mock('../src/firebase.js', () => ({
  auth: {
    // Simular la función signOut de auth
    signOut: jest.fn(),
  },
}));

// Descripción y definición de la prueba para la función logout
describe('logout', () => {
  it('should sign out the user', () => {
    // Llamar a la función logout
    logout();

    // Comprobar si se ha llamado a la función signOut de auth
    expect(auth.signOut).toHaveBeenCalled();
  });
});
