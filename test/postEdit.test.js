import { postEdit } from '../src/utils.js';
import { db } from '../src/firebase';

// Mock de la función postEdit para simular el objeto de la base de datos de Firebase
jest.mock('../src/firebase.js', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    update: jest.fn(),
  },
}));

it('edita la publicación correctamente', async () => {
  const postIdLocal = 'postIdLocal';
  const postId = 'postId';

  await postEdit(postIdLocal, postId);

  expect(db.collection).toHaveBeenCalledWith('posts');

  // Verificar que la función update se haya llamado correctamente
  expect(db.doc().update).toHaveBeenCalledWith({ text: 'Nuevo texto actualizado' });
});

it('no edita la publicación si el usuario cancela', async () => {
  const postIdLocal = 'postIdLocal';
  const postId = 'postId';

  await postEdit(postIdLocal, postId);

  expect(db.collection).toHaveBeenCalledWith('posts');
});

test('maneja errores correctamente', async () => {
  const postIdLocal = 'postIdLocal';
  const postId = 'postId';

  await postEdit(postIdLocal, postId);

  expect(db.collection).toHaveBeenCalledWith('posts');
});
