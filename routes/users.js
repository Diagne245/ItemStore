const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');

// Connect to user collection
const userInit = async (userName, password) => {
  const userCheckout = await User.findOne({ userName });
  if (userCheckout) {
    // User already exists
    if (await bcrypt.compare(password, userCheckout.password)) {
      console.log(`${userName}, Welcome to the ItemStore`);
      return userCheckout;
    }
  } else {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ userName, password: hashedPassword });
    console.log(`${userName} user account Created`);
    return user;
  }
};

// Add new user
router.post('/', async (req, res) => {
  const { userName, password } = req.body;
  try {
    const user = await userInit(userName, password);
    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'User Creation Failed' });
  }
});

// get single user by his Id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    return res.json({ success: true, data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

router.get('/', async (req, res) => {
  try {
    // Get single user by his userName
    if (req.query.userName) {
      const user = await User.findOne({ userName: req.query.userName });
      return res.status(200).json({ success: true, data: user });
    }

    // Get all users
    const users = await User.find({});
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Get user State
router.get('/userState/:userName', async (req, res) => {
  try {
    const userState = await User.findOne(
      { userName: req.params.userName },
      { _id: 0, userState: 1 }
    );
    return res.status(200).json({ success: true, data: userState });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Update user state
router.put('/', async (req, res) => {
  const { userName, userState } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { userName },
      {
        $set: {
          userState,
        },
      },
      { new: true }
    );
    return res.status(204).json({ success: true, data: user.userState });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'userState update failed' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id });
    return res.status(204).json({ success: true, data: {} });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
