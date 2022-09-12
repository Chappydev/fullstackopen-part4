const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')
const logger = require('./utils/logger');
const config = require('./utils/config');
const Blog = require('./models/blog');
const mongoose = require('mongoose');
const blogsRouter = require('./controllers/blogs');

mongoose.connect(config.MONGODB_URI);

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter);


app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});