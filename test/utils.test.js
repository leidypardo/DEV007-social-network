// Importar la función likeAdd desde el archivo utils.js
import { likeAdd } from '../src/utils.js';

// Importar la variable db desde el archivo firebase en el directorio src
import { db } from '../src/firebase';

// Simular el archivo firebase.js durante las pruebas
jest.mock('../src/firebase.js', () => ({
  db: {
    // Simular la función collection de db
    collection: jest.fn(() => ({
      // Simular la función doc de collection
      doc: jest.fn(() => ({
        // Simular la función update de doc
        update: jest.fn(),
      })),
    })),
  },
  firebase: {
    firestore: {
      FieldValue: {
        // Simular la función arrayUnion de FieldValue
        arrayUnion: jest.fn(),
      },
    },
  },
}));

// Descripción y definición de la prueba para la función likeAdd
describe('likeAdd', () => {
  it('should add the user ID to the likes array', () => {
    // Definir los valores de postId y userId
    const postId = 'post-id';
    const userId = 'user-id';

    // Llamar a la función likeAdd con los valores de postId y userId
    likeAdd(postId, userId);

    // Comprobar si se ha llamado a la función collection de db con el argumento 'posts'
    expect(db.collection).toHaveBeenCalledWith('posts');
  });
});
