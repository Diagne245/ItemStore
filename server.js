const path = require('path');
const express = require('express');

require('dotenv').config();
const port = process.env.PORT || 5000;
const connectDB = require('./config/db');
connectDB();

const app = express();

// CORS Middleware ----------------
const cors = require('cors');
app.use(
  cors({
    origin: ['http://localhost:5000', 'http://localhost:3000'],
  })
);

// Middleware Making the public folder static
app.use(express.static(path.join(__dirname, 'public')));

// Middleware Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes -----------
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

const mainItemsRouter = require('./routes/mainStore');
app.use('/user/mainStore', mainItemsRouter);

const groupsRouter = require('./routes/groups');
app.use('/user/groups', groupsRouter);

const slidesRouter = require('./routes/slides');
app.use('/user/group/slide', slidesRouter);

// Welcome message ---------------------
app.get('/', (req, res) => {
  res.send({ message: 'Welcome to the ItemStore' });
});

// ----------------------
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
