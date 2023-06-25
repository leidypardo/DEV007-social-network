import { postCreate } from '../src/utils.js';
import { db } from '../src/firebase';

jest.mock('../src/firebase.js', () => ({
  db: {
    collection: jest.fn(() => ({
      add: jest.fn(),
    })),
  },
}));

describe('postCreate', () => {
  it('should create a new post', () => {
    const userId = 'user-id';
    const content = 'Lorem ipsum dolor sit amet';

    postCreate(userId, content);

    expect(db.collection).toHaveBeenCalledWith('posts');
  });
});
