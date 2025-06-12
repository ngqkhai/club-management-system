const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/index');
const sequelize = require('../src/config/database');
const User = require('../src/models/user');

// Mock JWT token
const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
};
const mockToken = jwt.sign(mockUser, process.env.JWT_SECRET, { expiresIn: '1h' });

beforeAll(async () => {
  // Reset database and seed test user
  await sequelize.sync({ force: true });
  await User.create({
    id: '550e8400-e29b-41d4-a716-446655440000',
    full_name: 'Nguyen Van A',
    phone: '0908888888',
    email: 'test@example.com',
    avatar_url: null,
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('PUT /api/users/me', () => {
  it('should update user information successfully', async () => {
    const response = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        full_name: 'Nguyen Van B',
        phone: '0909999999',
        avatar_url: 'https://cdn.app.com/avatar123.jpg',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Cập nhật thông tin thành công',
    });

    const user = await User.findByPk('550e8400-e29b-41d4-a716-446655440000');
    expect(user.full_name).toBe('Nguyen Van B');
    expect(user.phone).toBe('0909999999');
    expect(user.avatar_url).toBe('https://cdn.app.com/avatar123.jpg');
  });

  it('should fail with invalid token', async () => {
    const response = await request(app)
      .put('/api/users/me')
      .set('Authorization', 'Bearer invalid_token')
      .send({
        full_name: 'Nguyen Van B',
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Token không hợp lệ' });
  });

  it('should fail with invalid data', async () => {
    const response = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        phone: 'invalid', // Invalid phone format
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Dữ liệu không hợp lệ/);
  });

  it('should fail when updating email', async () => {
    const response = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        email: 'newemail@example.com',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Email không thể thay đổi qua API này' });
  });
});
