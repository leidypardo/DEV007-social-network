import { likeAdd } from '../src/utils.js';
import { db } from '../src/firebase';

jest.mock('../src/firebase.js', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        update: jest.fn(),
      })),
    })),
  },
  firebase: {
    firestore: {
      FieldValue: {
        arrayUnion: jest.fn(),
      },
    },
  },
}));

describe('likeAdd', () => {
  it('should add the user ID to the likes array', () => {
    const postId = 'post-id';
    const userId = 'user-id';
    likeAdd(postId, userId);
    expect(db.collection).toHaveBeenCalledWith('posts');
  });
});
