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
  const decodedToken = request.token
    ? jwt.verify(request.token, process.env.SECRET)
    : null;
  if (!(decodedToken && decodedToken.id)) {
    return response.status(401).json({ error: 'Token missing or invalid' });
  }
  const user = await User.findById(decodedToken.id);

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
    user: user._id
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  console.log(user);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = request.token
    ? jwt.verify(request.token, process.env.SECRET)
    : null;
  if (!(decodedToken && decodedToken.id)) {
    return response.status(401).json({ error: 'Token missing or invalid' });
  }

  const blogToDelete = await Blog.findById(request.params.id);
  if (blogToDelete.user.toString() !== decodedToken.id) {
    return response.status(401).json({
      error: 'Blogs can only be deleted by their creator'
    });
  }

  const user = await User.findById(decodedToken.id);
  await Blog.findByIdAndDelete(request.params.id);
  user.blogs = user.blogs.filter(blog => {
    return blog.toString() !== blogToDelete._id.toString();
  });
  await user.save();
  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  };

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id, blog, { new: true }
  );
  response.json(updatedBlog);
});

module.exports = blogsRouter;