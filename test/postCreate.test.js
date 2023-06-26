// Importar la función postCreate desde el archivo utils.js
import { postCreate } from '../src/utils.js';

// Importar la variable db desde el archivo firebase en el directorio src
import { db } from '../src/firebase';

// Simular el archivo firebase.js durante las pruebas
jest.mock('../src/firebase.js', () => ({
  db: {
    // Simular la función collection de db
    collection: jest.fn(() => ({
      // Simular la función add de collection
      add: jest.fn(),
    })),
  },
}));

// Descripción y definición de la prueba para la función postCreate
describe('postCreate', () => {
  it('should create a new post', () => {
    // Definir los valores de userId y content
    const userId = 'user-id';
    const content = 'Lorem ipsum dolor sit amet';

    // Llamar a la función postCreate con los valores de userId y content
    postCreate(userId, content);

    // Comprobar si se ha llamado a la función collection de db con el argumento 'posts'
    expect(db.collection).toHaveBeenCalledWith('posts');
  });
});
