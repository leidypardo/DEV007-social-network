import { login } from '../src/utils.js';

describe('Login', () => {
  it('Es una funcion', () => {
    expect(typeof login).toBe('function');
  });
  it('Develve un objeto.', async () => {
    const response = await login('dahianamoreno@gmail.com', '123456789');
    expect(typeof response).toBe('object');
  });
});
