import Swiper from 'swiper';

import './js/bootstrap.bundle.min.js';
import './scss/bootstrap.scss';
import './scss/style.scss';

import Main from './js/app/main.js';
import User from '../services/user';
import GroupStore from '../services/groupStore';
import { Storage } from './static';
import Slide from './js/app/slide.js';

// Global variables

// -------------------
class App {
  constructor() {
    this.mainContainer = document.querySelector('#main-page .main-container');
    this.groupContainer = document.querySelector(
      '#group-page .group-container'
    );

    // Swiper Initialize ---------------------
    this.horizontalSwipe = new Swiper('.swiper-h', {
      autoHeight: true,
      allowTouchMove: false,
      speed: 700,
    });

    // -------------
    this.mediaObj = window.matchMedia(
      '(max-width: 500px) and (orientation: portrait)'
    );
    this.landscapeMediaObj = window.matchMedia(
      '(orientation: landscape) and (max-height: 600px)'
    );

    this.listModal = null;
    this.flagDropdown = null;

    // ------------
    this.user = null;
    this.slides = [];

    // ---------
    this.isEditMode = false;
    this.isSelectMode = false;
    this.isDeletingItem = false;
    this.isFlagDropdownOpen = false;
    this.selectionSrc = null;
    this.srcGroup = null;
    this.srcGroupID = null;

    document.addEventListener('DOMContentLoaded', this.restore.bind(this));
  }

  // ----------------------
  async restore() {
    if (Storage.getUserName()) {
      const userState = await User.getUserState(Storage.getUserName());
      userState === 'loggedIn' &&
        (this.user = await User.getUser(Storage.getUserName())) &&
        (this.main = new Main(this.user));

      userState === 'loggedOut' && (this.main = new Main());
    } else {
      this.main = new Main();
    }

    Storage.clearSelected();
  }

  // @Group Page -------------------
  async displaySlides(groupID = Storage.getCurrentGroupID()) {
    const currentGroup = await GroupStore.getGroupByID(groupID);
    if (currentGroup) {
      this.groupContainer.innerHTML = '';
      this.slides = [];
      for (let index = 0; index < currentGroup.slides.length; index++) {
        this.slides[index] = new Slide(index);
      }
    }
  }

  resetStates() {
    app.selectionSrc = null;
    app.srcGroup = null;
    app.srcGroupID = null;
    app.isSelectMode = false;
    app.isEditMode = false;
    Storage.clearSelected();
  }

  updateHeight() {
    setTimeout(() => {
      this.horizontalSwipe.updateAutoHeight();
    }, 1500);
  }

  // Flags select wrapper width handling
  resetWidth(element) {
    element.classList.contains('default') &&
      element.classList.remove('default');
    element.classList.contains('width-1') &&
      element.classList.remove('width-1');
    element.classList.contains('width-2') &&
      element.classList.remove('width-2');
  }
}

// Utility Methods ----------------
const getSlideAtIndex = (index) => {
  const groupContainer = document.querySelector('#group-page .group-container');
  return groupContainer.querySelector(`.slide[data-index="${index}"]`);
};

// ----------------------
const app = new App();

export { app, getSlideAtIndex };
