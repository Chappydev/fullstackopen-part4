const dummy = blogs => {
  return 1;
};

const totalLikes = blogs => {
  const reducer = (sum, { likes }) => {
    return sum + likes;
  };

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0);
};

const favoriteBlog = blogs => {
  if (blogs.length === 0) return null;

  return blogs
    .map(blog => {
      return { title: blog.title, author: blog.author, likes: blog.likes };
    })
    .reduce((curr, next) => {
      return curr.likes > next.likes
        ? curr
        : next;
    });
};

module.exports = {
  dummy, totalLikes, favoriteBlog
};