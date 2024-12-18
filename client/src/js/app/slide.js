import slide_html from '../../html_components/slide.html';

import GroupStore from '../../../services/groupStore';
import { Fade, Storage } from '../../static';
import { app } from '../..';

import {
  HomeIcon,
  AddSlideIcon,
  RemoveSlideIcon,
} from '../ui_components/icons';
import SlideTitle from '../ui_components/slideTitle';
import { SlideForm } from '../ui_components/form';
import { ItemList } from '../ui_components/listItems';
import ListModal from './list_modal';
import Button from '../ui_components/buttons';

class Slide {
  constructor(index) {
    this.slideEl = document.createElement('div');
    this.slideEl.dataset.index = index;
    this.slideEl.className =
      'slide shadow-lg bg-black mx-auto p-3 mb-4 position-relative';
    this.index = index;

    // -------------
    this._eventHandlers();
    this.render();
  }

  // -----------------
  _eventHandlers() {
    this.addActiveClassHandler = this.addActiveSlideClass.bind(this);
    this.editModeHandler = this.editItem.bind(this);
  }

  _slideBaseHTML() {
    this.slideEl.innerHTML = slide_html;
    app.groupContainer.appendChild(this.slideEl);
    app.updateHeight();
  }

  render() {
    this._slideBaseHTML();
    // -------------
    this.homeIcon = new HomeIcon(this.index);
    this.removeSlideIcon = new RemoveSlideIcon(this.index);
    this.slideTitle = new SlideTitle(this.index);
    this.slideForm = new SlideForm(this.index);
    this.slideItemList = new ItemList(this.index);
    // -------------
    this.slideClearBtn = new Button(
      this.slideEl.querySelector('.clear'),
      'button',
      ' Clear All',
      'btn btn-clear',
      'fa-solid fa-trash-can'
    );
    // -----------
    this.addSlideIcon = new AddSlideIcon(this.index);

    this._addEventListeners();
  }

  _addEventListeners() {
    this.slideEl.addEventListener('click', this.addActiveClassHandler);
    this.homeIcon.homeBtn.addEventListener('click', this.backToMain.bind(this));
    this.removeSlideIcon.deleteBtn.addEventListener(
      'click',
      this.removeSlide.bind(this)
    );
    this.slideTitle.titleForm.addEventListener(
      'submit',
      this.setLandingText.bind(this)
    );
    this.slideForm.formEl.addEventListener('submit', this.addEntry.bind(this));
    this.slideItemList.items.addEventListener('click', this.editModeHandler);

    this.slideItemList.items.addEventListener('click', (e) => {
      setTimeout(() => {
        this.deleteItem(e);
      }, 1000);
    });

    this.slideClearBtn.button.addEventListener(
      'click',
      this.clearAll.bind(this)
    );
    this.addSlideIcon.addSlideBtn.addEventListener(
      'click',
      this.addNewSlide.bind(this)
    );
  }

  // Methods --------------
  reset() {
    this.slideForm.reset();
    this.slideItemList.resetItems();
    this.hideUIElements();
    this.slideClearBtn.clearAll();
    this.slideClearBtn.hide();
  }

  // ---------
  hideUIElements() {
    this.homeIcon.hide();
    this.removeSlideIcon.hide();
  }

  showUIElements() {
    this.homeIcon.show();
    this.removeSlideIcon.show();
  }

  //  --------------
  backToMain() {
    Storage.clearCurrentGroup();
    Storage.clearCurrentGroupID();
    Storage.setCurrentPage('main-page');
    Storage.getSelectedItems().length === 0 &&
      this.slideItemList.exitSelectMode();

    app.horizontalSwipe.slidePrev();
    scrollTo({ top: 0, behavior: 'smooth' });
    app.slides = [];

    app.isSelectMode && app.srcGroup === null && app.main.selectModeUI();
  }

  // ---------------
  handleListModal = (slideItemList, e) => {
    if (app.listModal) {
      app.listModal.editItem(e);
      app.listModal.modalItemsForm.formInput =
        e.target.querySelector('textarea');
      app.listModal.updateBtn.show();
    } else {
      app.listModal = new ListModal(slideItemList, e);
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
          this.slideItemList.handleLandscapeEditItem(e.target.closest('li'));
          return;
        }

        if (
          app.mediaObj.matches &&
          Storage.getPreferedListStyle() === 'ordered'
        ) {
          this.handleListModal(this.slideItemList, e);
        } else if (
          !app.mediaObj.matches ||
          (app.mediaObj.matches &&
            Storage.getPreferedListStyle() === 'unordered')
        ) {
          const li = e.target.closest('li');

          if (app.landscapeMediaObj.matches) {
            this.slideItemList.handleLandscapeEditItem(li);
            return;
          }

          // item already in edit mode
          if (li.classList.contains('edit-mode')) {
            this.exitEditMode();
            return;
          }

          // switching to another item while in edit mode
          app.isEditMode && this.slideItemList.exitEditMode();

          // Setting current slide as active
          this.addActiveSlideClass(e);
          this.editModeUI();

          this.slideForm.formInput.value =
            li.querySelector('.card-text').innerText;
          this.slideForm.formInput.focus();
          li.classList.add('edit-mode');
          app.isEditMode = true;
        }
      }
    }
  }

  editModeUI() {
    this.slideForm.editMode();
  }

  exitEditMode() {
    this.slideForm.reset();
    this.slideItemList.exitEditMode();
    this.hideUIElements();
    this.slideClearBtn.hide();
    app.isEditMode = false;
  }

  // ----------------------
  selectModeUI() {
    for (const slide of app.slides.filter(
      (slide) => slide.index !== this.index
    )) {
      slide.slideForm.addSelectionMode();
    }

    // Src Slide State ---------
    this.slideForm.addItemBtn.hide();
    this.slideItemList.exitEditMode();
    this.slideClearBtn.removeSelection();
    this.showUIElements();
  }

  // ----------------
  async addActiveSlideClass(e) {
    if (
      !e.target.closest('.home-btn') &&
      !e.target.closest('.delete-btn') &&
      !e.target.closest('.add-slide') &&
      app.isSelectMode === false
    ) {
      this.removeActiveSlideClass(e);
      this.slideEl.classList.add('active-slide');
      this.showUIElements();

      const slideItems = await GroupStore.getSlideItems(this.index);
      slideItems.length !== 0
        ? this.slideClearBtn.show()
        : this.slideClearBtn.hide();
    }
  }

  removeActiveSlideClass(e) {
    let activeSlide = app.slides.find((slide) =>
      slide.slideEl.classList.contains('active-slide')
    );
    if (activeSlide && !e.target.closest('.active-slide')) {
      activeSlide.slideEl.classList.remove('active-slide');
      activeSlide.reset();
    }
  }

  // ------------------
  addSelectionMode() {
    this.slideForm.addSelectMode();
  }

  async setLandingText(e) {
    e.preventDefault();

    const titleInput = this.slideTitle.titleInput;
    const slideTitle = this.slideTitle.slideTitle;
    await GroupStore.setSlideLandingText(titleInput.value, this.index);

    this.slideTitle.hideSlideInput();
    this.slideTitle.showSlideTitle();

    slideTitle.innerText = await GroupStore.getSlideLandingText(this.index);
  }

  // -----------------
  async addEntry(e) {
    e.preventDefault();

    if (app.isSelectMode) {
      this.addSelection(); // Prevent Duplicates @@@@
      return;
    }

    const formInput = this.slideForm.formInput;
    const valid = await this.slideForm.validEntry(formInput.value, this.index);
    if (valid) {
      app.isEditMode ? this.updateItem() : this.addItem(formInput.value);
    }
    this.slideForm.blur();
    this.exitEditMode();
  }

  async addItem(newEntry) {
    await GroupStore.addItemToSlide(newEntry, this.index);
    this.slideItemList.resetItems();
    this.slideForm.blur();
    app.updateHeight();
  }

  async updateItem() {
    const formInput = this.slideForm.formInput;
    const liToUpdate = this.slideItemList.items.querySelector('.edit-mode');

    await GroupStore.updateItem(
      this.index,
      liToUpdate.dataset.id,
      formInput.value
    );

    this.slideForm.reset();
    this.slideItemList.resetItems();
    app.updateHeight();
  }
  async addSelection() {
    Fade.Out(this.slideItemList.items);
    await GroupStore.addSelection(this.index);
    this.slideItemList.exitSelectMode();
  }

  // ------------------
  async deleteItem(e) {
    e.stopImmediatePropagation();

    if (e.target.closest('.item-btn')) {
      app.isDeletingItem = true;

      const liToDelete = e.target.closest('li');
      const liToDeleteID = liToDelete.dataset.id;

      if (confirm('Are You Sure?')) {
        app.listModal
          ? app.listModal.resetListItem(this.slideItemList)
          : this.slideItemList.exitEditMode();

        this.slideForm.reset();
        await GroupStore.removeSlideItems([liToDeleteID], this.index);

        liToDelete.classList.add('fade-out');

        setTimeout(() => {
          this.slideItemList.resetItems();
          app.listModal && app.listModal.handleButtons();
          app.updateHeight();
        }, 2000);

        const slideItems = await GroupStore.getSlideItems(this.index);
        slideItems.length === 0 && this.slideClearBtn.hide();
      } else {
        liToDelete.classList.contains('delete-mode') &&
          liToDelete.classList.remove('delete-mode');

        app.landscapeMediaObj.matches &&
          (liToDelete.querySelector('.item-btn').style.visibility = 'hidden');
      }
      app.isDeletingItem = false;
    }
  }

  // ---------------
  async clearAll() {
    if (app.isSelectMode) {
      this.slideItemList.fadeOutSelectedItems();
      this.slideItemList.deleteSelectedItems();

      app.resetStates();
      this.slideClearBtn.clearAll();

      setTimeout(() => {
        this.slideItemList.resetItems();
        app.updateHeight();
      }, 1500);
      return;
    }

    if (confirm('Are You Sure?')) {
      // Regular items clearing
      await GroupStore.clearSlideItems(this.index);
      this.reset();
      app.updateHeight();
    }
  }

  // -------------------
  async addNewSlide(e) {
    if (e.target.closest('.add-slide')) {
      const index = +e.target.closest('.slide').dataset.index;
      await GroupStore.addNewSlide(index + 1);
      app.displaySlides();
      app.updateHeight();
    }
  }

  // -----------------
  async removeSlide(e) {
    if (e.target.closest('.delete-btn')) {
      if (confirm('Are You Sure?')) {
        const currentGroup = await GroupStore.getGroupByID();
        if (currentGroup.slides.length === 1) {
          this.deleteGroup();
        } else {
          const index = +e.target.closest('.slide').dataset.index;
          await GroupStore.removeSlide(index);
          app.displaySlides();
        }
      }
    }
  }

  async deleteGroup() {
    await GroupStore.removeGroup();
    Storage.clear();
    await app.main.groupList.render();
    app.horizontalSwipe.slidePrev();
  }
}

// -----------------
export default Slide;
