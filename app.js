const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const logger = require('./utils/logger');
const config = require('./utils/config');
const mongoose = require('mongoose');
const blogsRouter = require('./controllers/blogs');
const middleware = require('./utils/middleware');

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((err) => {
    logger.error('error connecting to MongoDB:', err.message);
  });

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/blogs', blogsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;