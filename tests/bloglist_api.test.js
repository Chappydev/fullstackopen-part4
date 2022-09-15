const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');

beforeEach(async () => {
  await Blog.deleteMany({});

  for (let blog of helper.initialBlogs) {
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

    expect(response.body).toHaveLength(helper.initialBlogs.length);
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
  test('without title and url gets 400 Bad Request', async () => {
    const noTitleOrUrl = {
      author: "Some Person",
      likes: 2
    };

    await api
      .post('/api/blogs')
      .send(noTitleOrUrl)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });

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

    const blogsAtEnd = await helper.blogsInDb();

    const titles = blogsAtEnd.map(blog => blog.title);

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
    expect(titles).toContain(newBlog.title);
  });

  test('defaults to 0 likes when not defined', async () => {
    const noLikesProp = {
      title: "An angry blog",
      author: "Melissa Q. Mad",
      url: "www.melissa.com"
    };

    await api
      .post('/api/blogs')
      .send(noLikesProp)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    
      const blogsAtEnd = await helper.blogsInDb();

    const likes = blogsAtEnd.map(blog => blog.likes);

    expect(likes[likes.length - 1]).toBe(0);
  });
});

describe('DELETE request', () => {
  test('with valid id succeeds with status code 204', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];
    
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    );

    const titles = blogsAtEnd.map(blog => blog.title);

    expect(titles).not.toContain(blogToDelete.title);
  });
});

describe('PUT request', () => {
  test('with valid id succeeds with 200 and JSON', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogBeforeUpdate = blogsAtStart[0];
    const blogToUpdate = { 
      title: blogBeforeUpdate.title,
      author: blogBeforeUpdate.author,
      url: blogBeforeUpdate.url, 
      likes: blogBeforeUpdate.likes * 10 
    };

    await api
      .put(`/api/blogs/${blogBeforeUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    
    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd[0].title).toBe(blogBeforeUpdate.title);
    expect(blogsAtEnd[0].likes).toBe(blogBeforeUpdate.likes * 10);
  });
});


afterAll(() => {
  mongoose.connection.close();
});