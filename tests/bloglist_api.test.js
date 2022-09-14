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

describe('POST request', () => {
  test('works when given a valid blog', async () => {
    const newBlog = {
      title: "A sad blog",
      author: "Sara F. Sad",
      url: "www.sara.com",
      likes: 8
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');

    const titles = response.body.map(blog => blog.title);

    expect(response.body).toHaveLength(initialBlogs.length + 1);
    expect(titles).toContain(newBlog.title);
  });

  test('defaults to 0 likes when not defined', async () => {
    const noLikesProp = {
      title: "An angry blog",
      author: "Melissa Q. Mad",
      url: "www.melissa.com"
    }

    await api
      .post('/api/blogs')
      .send(noLikesProp)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const response = await api.get('/api/blogs');
    console.log(response.body);

    const likes = response.body.map(blog => blog.likes);

    expect(likes[likes.length - 1]).toBe(0);
  });
});


afterAll(() => {
  mongoose.connection.close();
});