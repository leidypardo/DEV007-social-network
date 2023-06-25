import { logout } from '../src/utils.js';
import { auth } from '../src/firebase';

jest.mock('../src/firebase.js', () => ({
  auth: {
    signOut: jest.fn(),
  },
}));

describe('logout', () => {
  it('should sign out the user', () => {
    logout();

    expect(auth.signOut).toHaveBeenCalled();
  });
});
