const mongoose = require('mongoose');
const ItemSchema = require('../models/Item');
const Item = new mongoose.model('Item', ItemSchema, 'users');

const MainSchema = new mongoose.Schema({
  focusText: {
    type: String,
    default: '“To a mind that is still, the entire universe surrenders.”',
  },

  items: {
    type: Array,
    index: true,
    default: [
      new Item({ text: 'Item List One', activeFlag: '@First' }),
      new Item({ text: 'Item List Two', activeFlag: '@Started' }),
      new Item({ text: 'Item List Three', activeFlag: '@Done' }),
    ],
  },
});

module.exports = MainSchema;
