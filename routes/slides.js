const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ObjectId } = require('mongodb');

const User = require('../models/User');
const ItemSchema = require('../models/Item');
const Item = new mongoose.model('Item', ItemSchema, 'users');

// -------------------------
const getCurrentGroup = async (req) => {
  const user = await User.findOne(
    { _id: req.query.userId ? req.query.userId : req.body.userId },
    {
      groups: {
        $elemMatch: {
          _id: new ObjectId(
            req.query.groupID ? req.query.groupID : req.body.groupID
          ),
        },
      },
    }
  );
  return user.groups[0];
};

// Get Slide at Index -------------
router.get('/:index', async (req, res) => {
  try {
    const group = await getCurrentGroup(req);
    const slide = group.slides[req.params.index];
    return res.json({ success: true, data: slide });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Get Item Flag Value
router.get('/item/flag/:itemId', async (req, res) => {
  try {
    const group = await getCurrentGroup(req);
    const item = group.slides[+req.query.index].slideItems.find(
      (item) =>
        JSON.stringify(item._id) ===
        JSON.stringify(new ObjectId(req.params.itemId))
    );

    return res.status(200).json({ success: true, data: item.activeFlag });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: 'Something went wrong' });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const targetGroup = user.groups.find(
      (group) =>
        JSON.stringify(group._id) ===
        JSON.stringify(new ObjectId(req.body.groupID))
    );
    const targetSlide = targetGroup.slides[req.body.index];

    // Add new Item to a Slide at a given index
    if (req.body.text) {
      const newItem = new Item({ text: req.body.text });
      targetSlide.slideItems.push(newItem);
      user.markModified('groups');
      await user.save();

      return res.json({
        success: true,
        data: newItem,
      });
    }

    // Add selected items to Slide
    if (req.body.arrayOfItems.length !== 0) {
      for (const item of req.body.arrayOfItems) {
        targetSlide.slideItems.push(item);
      }

      user.markModified('groups');
      await user.save();
      return res.json({ success: true, data: targetSlide.slideItems });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Add new Entry at position
router.post('/position', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const targetGroup = user.groups.find(
      (group) =>
        JSON.stringify(group._id) ===
        JSON.stringify(new ObjectId(req.body.groupID))
    );
    const targetSlide = targetGroup.slides[req.body.index];
    const position = +req.body.position;
    targetSlide.slideItems.splice(position + 1, 0, new Item());
    user.markModified('groups');
    user.save();

    return res
      .status(200)
      .json({ success: true, data: targetSlide.slideItems });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

router.patch('/', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const targetGroup = user.groups.find(
      (group) =>
        JSON.stringify(group._id) ===
        JSON.stringify(new ObjectId(req.body.groupID))
    );
    const targetSlide = targetGroup.slides[req.body.index];

    const items = targetSlide.slideItems;
    const position = +req.body.position;
    const [item] = items.splice(position, 1);

    if (req.body.direction) {
      req.body.direction === 'up' &&
        position > 0 &&
        items.splice(position - 1, 0, item) &&
        user.markModified('groups');

      req.body.direction === 'down' &&
        position < items.length &&
        items.splice(position + 1, 0, item) &&
        user.markModified('groups');

      await user.save();

      return res
        .status(200)
        .json({ success: true, data: targetSlide.slideItems });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

// Update landing text or item at Slide Index
router.put('/:itemID', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const targetGroup = user.groups.find(
      (group) =>
        JSON.stringify(group._id) ===
        JSON.stringify(new ObjectId(req.body.groupID))
    );
    const targetSlide = targetGroup.slides[req.body.index];

    // Updating landing text-----------
    if (req.body.landingText) {
      targetSlide.landingText = req.body.landingText;
      user.markModified('groups');
      await user.save();
      return res.json({
        success: true,
        data: targetSlide,
      });
    }

    // Updating Item Text or Flag -----------
    if (req.body.updatedText || req.body.activeFlag) {
      // get & update the item
      const itemToUpdate = targetSlide.slideItems.find(
        (item) =>
          JSON.stringify(item._id) ===
          JSON.stringify(
            new ObjectId(req.params.itemID) ||
              item_id === new ObjectId(req.params.itemID)
          )
      );
      const itemIndex = targetSlide.slideItems.indexOf(itemToUpdate);

      req.body.updatedText !== null &&
        (itemToUpdate.text = req.body.updatedText);
      req.body.activeFlag && (itemToUpdate.activeFlag = req.body.activeFlag);

      // add the updated item and remove the old one
      targetSlide.slideItems.splice(itemIndex, 1, itemToUpdate);
      user.markModified('groups');

      await user.save();
      return res.json({ success: true, data: itemToUpdate });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  Delete Requests--------
router.delete('/:index', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const targetGroup = user.groups.find(
      (group) =>
        JSON.stringify(group._id) ===
        JSON.stringify(new ObjectId(req.body.groupID))
    );
    const targetSlide = targetGroup.slides[req.params.index];

    // Delete item(s) from Slide at Index ---------------
    if (req.body.arrayOfIds && req.body.arrayOfIds.length !== 0) {
      const mappedArrayOfIds = req.body.arrayOfIds.map((id) =>
        JSON.stringify(new ObjectId(id))
      );
      targetSlide.slideItems = targetSlide.slideItems.filter(
        (item) => !mappedArrayOfIds.includes(JSON.stringify(item._id))
      );
    }

    // Clear all slide Items -----------
    else if (!req.body.arrayOfIds) {
      targetSlide.slideItems = [];
    }

    user.markModified('groups');
    await user.save();
    return res.json({
      success: false,
      data: targetSlide.slideItems,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
