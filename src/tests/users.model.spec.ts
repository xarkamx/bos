import { Test, TestingModule } from '@nestjs/testing';
import { UserModel } from '../models/UserModel';

describe('User Model', () => {
  const model: UserModel = new UserModel();
  it('model must exists', () => {
    expect(model).toBeDefined();
  });
  test('must be able to create a user', async () => {
    const user = await model.addUser({
      name: 'John Doe',
      email: 'joe@gmail.com',
      password: 'myCustomPassword',
      addressId: 1,
    });
    expect(user).toBeDefined();
  });
});
