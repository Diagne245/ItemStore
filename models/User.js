const mongoose = require('mongoose');
const MainSchema = require('./Main');
const Main = new mongoose.model('Main', MainSchema, 'users');

const GroupSchema = require('../models/Group');
const Group = new mongoose.model('Group', GroupSchema, 'users');

const SlideSchema = require('../models/Slide');
const Slide = new mongoose.model('Slide', SlideSchema, 'users');

const ItemSchema = require('../models/Item');
const Item = new mongoose.model('Item', ItemSchema, 'users');

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'Please enter a userName'],
  },

  password: {
    type: String,
    required: [true, 'Please enter your password'],
  },

  userState: {
    type: String,
    default: 'loggedOut',
  },

  mainStore: {
    type: {},
    default: new Main(),
  },

  groups: {
    type: Array,
    default: [
      new Group({
        title: 'Group 1',
        slides: [
          new Slide({
            landingText: 'Slide 1',
            slideItems: [
              new Item({ text: 'Slide Item List One', activeFlag: '@Urgent' }),
              new Item({ text: 'Slide Item List Two', activeFlag: '@' }),
              new Item({ text: 'Slide Item List Three', activeFlag: '@Last' }),
            ],
          }),
          new Slide({
            landingText: 'Slide 2',
            slideItems: [
              new Item({ text: 'Slide Item List One', activeFlag: '@Started' }),
              new Item({ text: 'Slide Item List Two', activeFlag: '@Done' }),
              new Item({ text: 'Slide Item List Three', activeFlag: '@Last' }),
            ],
          }),
        ],
      }),
      new Group({
        title: 'Group 2',
        slides: [
          new Slide({
            landingText: 'Slide 1',
            slideItems: [
              new Item({ text: 'Slide Item List One', activeFlag: '@First' }),
              new Item({ text: 'Slide Item List Two', activeFlag: '@' }),
              new Item({ text: 'Slide Item List Three', activeFlag: '@Done' }),
            ],
          }),
        ],
      }),
    ],
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema, 'users');
