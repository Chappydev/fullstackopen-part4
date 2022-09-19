const Blog = require('../models/blog');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

const addInitialUser = async () => {
  const passwordHash = await bcrypt.hash('password', 10);
  const user = new User({
    username: 'joe',
    name: 'Joe Human',
    passwordHash,
    blogs: [] 
  });
  return await user.save();
};

const generateToken = async (id, username = 'joe') => {
  const userForToken = {
    username,
    id
  };

  const token = jwt.sign(userForToken, process.env.SECRET);
  return token;
};

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: 'guy', url: 'www.doesntexist.com' });
  await blog.save();
  await blog.remove();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map(blog => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON());
};

module.exports = {
  initialBlogs, addInitialUser, generateToken, nonExistingId, blogsInDb, usersInDb
};