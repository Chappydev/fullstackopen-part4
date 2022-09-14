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

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
};