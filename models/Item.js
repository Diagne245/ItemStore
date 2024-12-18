const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  text: {
    type: String,
    default: 'New Entry',
  },
  activeFlag: {
    type: String,
    default: '@',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = ItemSchema;
