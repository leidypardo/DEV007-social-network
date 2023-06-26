import { postRemove } from '../src/utils.js';
import { db } from '../src/firebase';

// Mock de la función postRemove para simular su comportamiento
jest.mock('../src/firebase.js', () => ({
  db: {
    collection: jest.fn(() => ({
      get: jest.fn({
        exists: true,
        data: ({ userId: 'userId' }),
      }),
      delete: jest.fn(),
    })),

  },
}));
describe('PostRemove', () => {
  it('elimina la publicación correctamente si el usuario es el creador', async () => {
    const postId = 'postId';
    const user = { uid: 'userId' };

    postRemove(postId, user);
    expect(db.collection).toHaveBeenCalledWith('posts');
  });
});
