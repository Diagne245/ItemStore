const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ObjectId } = require('mongodb');

const User = require('../models/User');
const GroupSchema = require('../models/Group');
const Group = new mongoose.model('Group', GroupSchema, 'users');

const SlideSchema = require('../models/Slide');
const Slide = new mongoose.model('Slide', SlideSchema, 'users');

const ItemSchema = require('../models/Item');
const Item = new mongoose.model('Item', ItemSchema, 'users');

// Displaying the results
const getCurrentGroup = async (req) => {
  const user = await User.findOne(
    { _id: req.query.userId ? req.query.userId : req.body.userId },
    {
      groups: {
        $elemMatch: { _id: new ObjectId(req.params.id) },
      },
    }
  );
  return user.groups[0];
};

// Get all groups
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.query.userId });
    return res.json({ success: true, data: user.groups });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Add a New Group
router.post('/', async (req, res) => {
  if (req.body.title) {
    let newGroup = new Group({
      title: req.body.title,
      slides: [new Slide({ landingText: req.body.title })],
    });

    try {
      const user = await User.findOneAndUpdate(
        { _id: req.body.userId },
        {
          $push: {
            groups: {
              $each: [newGroup],
            },
          },
        },
        { new: true }
      );

      return res.json({
        success: true,
        data: user.groups[groups.length - 1],
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
});

// Get a group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await getCurrentGroup(req);
    return res.json({ success: true, data: group });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Add new Slide at index to Group ----------
router.post('/:id', async (req, res) => {
  try {
    await User.findOneAndUpdate(
      {
        _id: req.body.userId,
        'groups._id': new ObjectId(req.params.id),
      },
      {
        $push: {
          'groups.$.slides': {
            $each: [new Slide()],
            $position: parseInt(req.body.index),
          },
        },
      }
    );

    const group = await getCurrentGroup(req);
    return res.json({ success: true, data: group.slides });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  Delete Requests--------
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const targetGroup = user.groups.find(
      (group) =>
        JSON.stringify(group._id) ===
        JSON.stringify(new ObjectId(req.params.id))
    );

    // Delete Slide at index ------------------------
    if (req.body.index) {
      const targetSlide = targetGroup.slides[req.body.index];
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.body.userId, 'groups._id': new ObjectId(req.params.id) },
        {
          $pull: {
            'groups.$.slides': { _id: targetSlide._id },
          },
        },
        { new: true }
      );
      return res.json({ success: true, data: updatedUser.groups });
    }

    // Delete the group itself ------------------
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.body.userId },
      {
        $pull: {
          groups: { _id: new ObjectId(req.params.id) },
        },
      },
      { new: true }
    );
    return res.json({ success: true, data: updatedUser.groups });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});


// for Dev Purposes @@@@@
// Delete all groups
// router.delete('/', async (req, res) => {
//   try {
//     const user = await User.findOneAndUpdate(
//       { _id: req.body.userId },
//       {
//         $set: {
//           groups: [],
//         },
//       },
//       { new: true }
//     );
//     return res.json({ success: true, data: user });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ success: false, error: 'Server Error' });
//   }
// });

module.exports = router;
