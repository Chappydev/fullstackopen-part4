const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')
const logger = require('./utils/logger');
const config = require('./utils/config');
const Blog = require('./models/blog');
const mongoose = require('mongoose');
const blogsRouter = require('./controllers/blogs');
const middleware = require('./utils/middleware');

mongoose.connect(config.MONGODB_URI);

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/blogs', blogsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);


app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});