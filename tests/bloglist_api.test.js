const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');

const initialBlogs = [
  {
    title: "A funny blog",
    author: "John A. Guy",
    url: "www.john.com",
    likes: 3
  },
  {
    title: "A serious blog",
    author: "Bob E. McGee",
    url: "www.bob.com",
    likes: 12
  }
];

beforeEach(async () => {
  await Blog.deleteMany({});

  for (let blog of initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  };
});

describe('GET request', () => {
  test('returns correct number of blogs in JSON', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(2);
  });

  test('unique identifier is named "id"', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blog = response.body[0];

    expect(Object.keys(blog)).toContain('id');
  });
});


afterAll(() => {
  mongoose.connection.close();
});