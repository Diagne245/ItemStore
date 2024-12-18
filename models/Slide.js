const mongoose = require('mongoose');

const SlideSchema = new mongoose.Schema({
  landingText: {
    type: String,
    default: 'New Slide',
  },
  slideItems: {
    type: Array,
    default: [],
  },
});

module.exports = SlideSchema;
