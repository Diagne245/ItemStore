const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a Group Title'],
  },
  slides: {
    type: Array,
    index: true,
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = GroupSchema;
