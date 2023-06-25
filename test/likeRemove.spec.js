import { likeRemove } from '../src/utils.js';
import { db } from '../src/firebase';

jest.mock('../src/firebase.js', () => ({
  db: {
    collection: jest.fn(() => ({
      update: jest.fn(),
    })),
    likes: jest.fn(),
  },
}));
describe('likeRemove', () => {
  it('remueve correctamente el like', async () => {
    const postId = 'postId';
    const userId = 'userId';

    likeRemove(postId, userId);

    // Verificar que la función likeRemove se haya llamado correctamente
    expect(db.collection).toHaveBeenCalledWith('posts');
  });
});
