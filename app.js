require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const collectionsRouter = require('./routes/collections');
const postsRouter = require('./routes/posts');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();

app.use(express.json());

app.use('/api/collections', collectionsRouter);
app.use('/api/posts', postsRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));