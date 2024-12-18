import main_html from '../../html_components/main.html';
import login_html from '../../html_components/login.html';

import { Fade, Storage } from '../../static';
import User from '../../../services/user';
import MainStore from '../../../services/mainStore';
import GroupStore from '../../../services/groupStore';
import Logger from './logger';
import { MainForm } from '../ui_components/form';
import GroupList from './groupList';
import { ItemList } from '../ui_components/listItems';
import ListModal from './list_modal';
import Filter from '../ui_components/filter';
import Button from '../ui_components/buttons';
import { app } from '../..';
import Focus from '../ui_components/focus';
import About from './about';
// ------------------
class Main {
  constructor(userData = null) {
    this.editModeHandler = this.editItem.bind(this);

    if (userData === null) {
      this.render();
    } else {
      app.user = userData;
      this.reload();
    }
  }

  goToAboutPage() {
    new About();
    app.horizontalSwipe.slidePrev();
  }

  // -------------------
  showLogonCard() {
    app.mainContainer.innerHTML = login_html;

    this.form = new MainForm();
    document
      .querySelector('.about-btn')
      .addEventListener('click', this.goToAboutPage.bind(this));
  }

  _handleLogin = (logger) => {
    logger.modalEl.querySelector('.modal-title').innerText = 'Welcome Back!';
    logger.password2Input.classList.add('d-none');
    logger.loginForm.querySelector('button[type="submit"]').innerText =
      'Log In';
  };

  _handleLogon = (logger) => {
    logger.modalEl.querySelector('.modal-title').innerText =
      "Let's Get Started!";
    const password2Input = logger.password2Input;
    password2Input.classList.contains('d-none') &&
      password2Input.classList.remove('d-none');

    logger.loginForm.querySelector('button[type="submit"]').innerText =
      'Log On';
  };

  // ----------------
  _mainBaseHTML() {
    app.mainContainer.innerHTML = main_html;

    this.logoutIcon = document.querySelector('.main-base .login-icon i');
    this.aboutIcon = document.querySelector('.main-base .about-icon i');

    this.aboutIcon.addEventListener('click', this.goToAboutPage.bind(this));
    this.logoutIcon.addEventListener('click', this.logout.bind(this));
  }

  _baseMain() {
    this._mainBaseHTML();
    this.form = new MainForm();
  }

  render() {
    this.showLogonCard();
    this.logger = new Logger();

    // Hide password2 input on logging in
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.addEventListener(
      'click',
      this._handleLogin.bind(this, this.logger)
    );

    const logonBtn = document.querySelector('.logon-btn');
    logonBtn.addEventListener(
      'click',
      this._handleLogon.bind(this, this.logger)
    );

    app.horizontalSwipe.slideTo(1, 0, false);

    app.updateHeight();
  }

  async reload() {
    this._baseMain();
    this.loadUserData();

    switch (Storage.getCurrentPage()) {
      case 'about-page':
        new About();
        app.horizontalSwipe.slideTo(0, 0, false);
        break;

      case 'group-page':
        await app.displaySlides();
        app.horizontalSwipe.slideTo(2, 0, false);
        app.updateHeight();
        break;

      case 'main-page':
        app.horizontalSwipe.slideTo(1, 0, false);
        app.updateHeight();
        break;
    }
  }

  async logout() {
    await User.setUserState('loggedOut');
    this.render();

    Storage.clearSelected();
  }

  loadUserData() {
    this.groupList = new GroupList();
    this.itemList = new ItemList();
    this.filter = new Filter(this.itemList);
    // ---------------------------
    this.clearAllBtn = new Button(
      app.mainContainer.querySelector('#user-data .clear'),
      'button',
      ' Clear All',
      'btn-clear btn border border-3 text-white',
      'fa-solid fa-trash-can'
    );
    this.focus = new Focus();

    this._addEventListeners();
  }

  async loadUser() {
    Storage.setUserName(app.user.userName);
    Storage.setCurrentPage('main-page');
    this._baseMain();
    this.loadUserData();
    await User.setUserState('loggedIn');

    app.updateHeight();
  }

  _addEventListeners() {
    this.form.formEl.addEventListener('submit', this.onSubmitEvent.bind(this));
    this.itemList.items.addEventListener('click', this.editModeHandler);
    this.itemList.items.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
      if (e.target.closest('.item-btn')) {
        app.isDeletingItem = true;

        const liToDelete = e.target.closest('li');
        const liToDeleteID = liToDelete.dataset.id;
        !liToDelete.classList.contains('delete-mode') &&
          liToDelete.classList.add('delete-mode');

        setTimeout(() => {
          this.deleteItem(liToDelete, liToDeleteID);
        }, 1000);
      }
    });
    this.clearAllBtn.button.addEventListener('click', this.clearAll.bind(this));
  }

  // reset main leaving select mode active
  resetMain() {
    app.isEditMode = false;
    this.form.reset();
    this.itemList.resetItems();
    this.hideUIElements();
    this.clearAllBtn.clearAll();
    this.clearAllBtn.hide();
  }

  exitEditMode() {
    this.form.reset();
    this.itemList.exitEditMode();
    app.isEditMode = false;
    this.hideUIElements();
  }

  // UI State--------
  editModeUI() {
    this.form.editMode();
    this.showUIElements();
  }
  selectModeUI() {
    this.form.addItemBtn.hide();
    this.itemList.exitEditMode();
    this.showUIElements();
    this.clearAllBtn.removeSelection();
  }

  // Adding & Updating of entries --------------------
  async onSubmitEvent(e) {
    e.preventDefault();

    if (app.isSelectMode) {
      this.addSelection();
      return;
    }
    const formInput = this.form.formInput;
    e.submitter === this.form.addItemBtn.button &&
      (await this.form.validEntry(formInput.value)) &&
      (app.isEditMode ? this.updateItem() : this.addItem(formInput.value));

    e.submitter === this.form.addGroupBtn.button &&
      (await this.form.validGroup(formInput.value)) &&
      this.addGroup(formInput.value);

    this.form.blur();
    this.exitEditMode();
  }

  async addItem(newEntry) {
    await MainStore.addItem(newEntry);
    this.itemList.resetItems();
  }

  async updateItem(form = this.form) {
    const formInput = form.formInput;
    const liToUpdateID =
      this.itemList.items.querySelector('.edit-mode').dataset.id;

    await MainStore.updateItem(liToUpdateID, formInput.value);

    this.resetMain();
  }

  async addGroup(title) {
    const validTitle = title
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
      .join(' ');

    await GroupStore.addGroup(validTitle);
    this.groupList.render();
  }

  async addSelection() {
    Fade.Out(this.itemList.items);
    await MainStore.addSelection();
    this.itemList.exitSelectMode();
  }

  // ---------------------
  handleListModal = (e) => {
    if (app.listModal) {
      app.listModal.editItem(e);
      app.listModal.modalItemsForm.formInput = e.target.closest('textarea')
        ? e.target.closest('textarea')
        : e.target.querySelector('textarea');

      app.listModal.updateBtn.show();
    } else {
      app.listModal = new ListModal(this.itemList, e);
    }
  };

  editItem(e) {
    if (
      !e.target.closest('.flag-wrapper') &&
      !e.target.closest('.item-btn') &&
      !e.target.classList.contains('fa-arrow-up') &&
      !e.target.classList.contains('fa-arrow-down') &&
      !e.target.classList.contains('item-btn') &&
      e.target.closest('li')
    ) {
      if (!app.isSelectMode) {
        if (app.landscapeMediaObj.matches) {
          this.itemList.handleLandscapeEditItem(e.target.closest('li'));
          return;
        }

        if (
          app.mediaObj.matches &&
          Storage.getPreferedListStyle() === 'ordered'
        ) {
          this.handleListModal(e);
        } else if (
          !app.mediaObj.matches ||
          (app.mediaObj.matches &&
            Storage.getPreferedListStyle() === 'unordered')
        ) {
          const li = e.target.closest('li');

          // item already in edit mode
          if (li.classList.contains('edit-mode')) {
            this.exitEditMode();
            return;
          }

          setTimeout(() => {}, 200);
          // switching to another item while in edit mode
          app.isEditMode && this.itemList.exitEditMode();

          const formInput = this.form.formInput;
          this.editModeUI();
          formInput.value = li.querySelector('.card-text').innerText;
          formInput.focus();
          li.classList.add('edit-mode');
          app.isEditMode = true;
        }
      }
    }
  }

  // Items Removal----------------------
  async deleteItem(liToDelete, liToDeleteID) {
    if (confirm('Are You Sure?')) {
      app.listModal
        ? app.listModal.resetListItem(this.itemList)
        : this.itemList.exitEditMode();

      this.form.reset();
      await MainStore.deleteItem(liToDeleteID);
      liToDelete.classList.add('fade-out');

      setTimeout(() => {
        this.itemList.resetItems();
        app.listModal && app.listModal.handleButtons();
        app.updateHeight();
      }, 2000);

      // Display UI Elements
      const items = await MainStore.getItems();
      items.length === 0 && this.hideUIElements();
    } else {
      liToDelete.classList.contains('delete-mode') &&
        liToDelete.classList.remove('delete-mode');

      app.landscapeMediaObj.matches &&
        (liToDelete.querySelector('.item-btn').style.visibility = 'hidden');
    }
    app.isDeletingItem = false;
  }

  async clearAll() {
    if (app.isSelectMode) {
      this.itemList.fadeOutSelectedItems();
      await this.itemList.deleteSelectedItems();

      app.resetStates();
      this.clearAllBtn.clearAll();

      setTimeout(() => {
        this.itemList.resetItems();
        app.updateHeight();
      }, 1500);
      return;
    }
    // Regular items clearing
    if (confirm('Are You Sure?')) {
      await MainStore.clearAll();
      this.resetMain();
    }
  }
  // ---------
  hideUIElements() {
    this.filter.hide();
    this.clearAllBtn.hide();
    this.focus.show();
  }

  showUIElements() {
    this.filter.show();
    this.clearAllBtn.show();
    this.focus.hide();
  }
}

export default Main;
