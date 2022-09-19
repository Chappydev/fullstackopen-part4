const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const bcrypt = require('bcrypt');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');

describe('with one initial user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const user = helper.generateInitialUser();

    await user.save();
  });

  test('creation succeeds with a new username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'bobguy',
      name: 'Bob G. Alfred',
      password: 'somethingrandom'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    const usernames = usersAtEnd.map(user => user.username);

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails with malformatted username', async () => {
    const usersAtStart = await helper.usersInDb();

    const userWithShortUsername = {
      username: 'jo',
      name: 'jo j. gerald',
      password: '12345678'
    };

    const result = await api
      .post('/api/users')
      .send(userWithShortUsername)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('malformatted username');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test('creation fails with malformatted password', async () => {
    const usersAtStart = await helper.usersInDb();

    const userWithShortPassword = {
      username: 'georgyyy',
      name: 'George A. Harrold',
      password: '12'
    };

    const result = await api
      .post('/api/users')
      .send(userWithShortPassword)
      .expect(400)
      .expect('Content-Type', /application\/json/);
    
    expect(result.body.error).toContain('Must include password with minimum 3 characters');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test('creation fails when missing username', async () => {
    const usersAtStart = await helper.usersInDb();

    const userWithShortUsername = {
      name: 'jo j. gerald',
      password: '12345678'
    };

    const result = await api
      .post('/api/users')
      .send(userWithShortUsername)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('malformatted username');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test('creation fails when missing password', async () => {
    const usersAtStart = await helper.usersInDb();

    const userWithShortPassword = {
      username: 'georgyyy',
      name: 'George A. Harrold'
    };

    const result = await api
      .post('/api/users')
      .send(userWithShortPassword)
      .expect(400)
      .expect('Content-Type', /application\/json/);
    
    expect(result.body.error).toContain('Must include password with minimum 3 characters');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test('creation fails when username is already exists', async () => {
    const usersAtStart = await helper.usersInDb();

    const userWithSameUsername = {
      username: 'joe',
      name: 'jo j. gerald',
      password: '12345678'
    };

    const result = await api
      .post('/api/users')
      .send(userWithSameUsername)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('Username must be unique');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  })
});

afterAll(() => {
  mongoose.connection.close();
});