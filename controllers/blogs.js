const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 });
  
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const body = request.body;

  if (request.user === null) {
    return response.status(401).json({ error: 'Token missing or invalid' });
  } 

  if (!body.title || !body.url) {
    return response.status(400).json({
      error: "Must include a title and url"
    });
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: request.user._id
  });

  const savedBlog = await blog.save();
  const populatedBlog = await Blog
    .findById(savedBlog._id)
    .populate('user', { username: 1, name: 1 });
  request.user.blogs = request.user.blogs.concat(savedBlog._id);
  await request.user.save();

  response.status(201).json(populatedBlog);
});

blogsRouter.delete('/:id', async (request, response) => {
  if (request.user === null) {
    return response.status(401).json({ error: 'Token missing or invalid' });
  }

  const blogToDelete = await Blog.findById(request.params.id);
  if (blogToDelete.user.toString() !== request.user._id.toString()) {
    return response.status(401).json({
      error: 'Blogs can only be deleted by their creator'
    });
  }

  await Blog.findByIdAndDelete(request.params.id);
  request.user.blogs = request.user.blogs.filter(blogId => {
    return blogId.toString() !== blogToDelete._id.toString();
  });
  await request.user.save();
  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: body.user.id
  };

  const updatedBlog = await Blog
    .findByIdAndUpdate(request.params.id, blog, { new: true })
    .populate('user', { username: 1, name: 1 });
  response.json(updatedBlog);
});

module.exports = blogsRouter;