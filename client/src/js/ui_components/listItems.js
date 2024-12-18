import flag_dropdown_html from '../../html_components/flag_dropdown.html';
import { app, getSlideAtIndex } from '../../index.js';

import MainStore from '../../../services/mainStore.js';
import GroupStore from '../../../services/groupStore.js';
import { Storage, Fade } from '../../static.js';

import FlagHandler from '../app/flag.js';
import { Dropdown } from '../bootstrap.bundle.min.js';
// -----------------------------
class ItemList {
  constructor(index = null) {
    index !== null
      ? (this.items = getSlideAtIndex(index).querySelector('.items'))
      : (this.items = app.mainContainer.querySelector('.items'));

    // ----------
    this.listIcon = this.items.previousElementSibling;
    this.listIcon.addEventListener('click', this.changeListStyle.bind(this));

    // ---------
    this.index = index;
    this._eventHandlers();
    this.render();
  }

  _eventHandlers() {
    this.selectItemsHandler = this.selectItems.bind(this);
    this.selectModeHandler = this.selectMode.bind(this);
  }

  render() {
    this.resetItems();
    this._addEventListeners();
  }

  // Render list items no event listener added yet
  async resetItems() {
    let items = [];
    this.index !== null && Storage.onGroupPage()
      ? (items = await GroupStore.getSlideItems(this.index))
      : (items = await MainStore.getItems());

    items.length === 0 ? this.hideListIcon() : this.showListIcon();

    this.items.innerHTML = '';
    if (Storage.getPreferedListStyle() === 'ordered') {
      this.listIcon.classList.replace('fa-list-ol', 'fa-bars-staggered');
      this.items.className =
        'items ordered list-group list-group-flush list-group-numbered fade-out';
      items.forEach((item) => {
        this.items.appendChild(
          new OrderedListItem(item._id, item.text, this.index)
        );
      });
    } else {
      this.items.className =
        'items list-unstyled d-flex flex-wrap justify-content-center mb-0';

      items.forEach((item) => {
        this.items.appendChild(new UnOrderedListItem(item._id, item.text));
      });
    }

    Fade.In(this.items);

    app.isEditMode = false;
  }

  _addEventListeners() {
    this.items.addEventListener('click', this.selectItemsHandler);
    this.items.addEventListener('click', this.updateFlag.bind(this));
    this.items.addEventListener('click', this.getItemPosition.bind(this));
    this.items.addEventListener('click', this.addItemAtPosition.bind(this));
    this.items.addEventListener('click', this.moveItem.bind(this));
    this.items.addEventListener('dblclick', this.selectModeHandler);

    this.items.addEventListener('mouseover', (e) => {
      setTimeout(() => {
        this.deleteMode(e);
      }, 100);
    });

    this.items.addEventListener('mouseout', (e) => {
      setTimeout(() => {
        this.removeDeleteMode(e);
      }, 100);
    });
  }
  // Hide or Show ListIcon
  hideListIcon() {
    !this.listIcon.classList.contains('d-none') &&
      this.listIcon.classList.add('d-none');
  }

  showListIcon() {
    this.listIcon.classList.contains('d-none') &&
      this.listIcon.classList.remove('d-none');
  }
  // ------------
  updateFlag(e) {
    if (e.target.closest('.flag-wrapper')) {
      if (
        app.flagDropdown &&
        app.flagDropdown._element.querySelector('.dropdown-toggle') ===
          e.target.closest('.flag-wrapper').querySelector('.dropdown-toggle')
      ) {
        return;
      }

      app.flagDropdown && app.flagDropdown.hide();

      app.flagDropdown = Dropdown.getOrCreateInstance(
        e.target.closest('.flag-wrapper').querySelector('.dropdown')
      );

      Fade.In(app.flagDropdown._menu);

      new FlagHandler(e.target.closest('li').dataset.id, this.index);
    }
  }

  // Methods --------------------
  exitEditMode() {
    const liInEditMode = this.items.querySelector('.edit-mode');
    liInEditMode && liInEditMode.classList.remove('edit-mode');
  }

  handleLandscapeEditItem(li) {
    this.items.querySelectorAll('.item-btn').forEach((itemBtn) => {
      itemBtn.style.visibility = 'hidden';
    });
    li.querySelector('.item-btn').style.visibility = 'visible';
  }

  // --------------------
  changeListStyle = () => {
    if (Storage.getPreferedListStyle() === 'ordered') {
      this.listIcon.classList.replace('fa-bars-staggered', 'fa-list-ol');
      Storage.setPreferedListStyle('unordered');
    } else if (Storage.getPreferedListStyle() === 'unordered') {
      this.listIcon.classList.replace('fa-list-ol', 'fa-bars-staggered');
      Storage.setPreferedListStyle('ordered');
    }

    this.resetItems();
    app.updateHeight();
  };

  getItemPosition = (e) => {
    const li = e.target.closest('li');
    const itemsArray = Array.from(this.items.querySelectorAll('li.card'));
    return itemsArray.indexOf(li);
  };

  getActiveSlideIndex = () => {
    const activeSlide = app.groupContainer.querySelector('.slide.active-slide');
    return activeSlide ? +activeSlide.dataset.index : null;
  };

  updateItemList(e) {
    const targetItem = e.target.closest('li');
    const targetItemID = targetItem.dataset.id;

    setTimeout(() => {
      this.resetItems();
    }, 1000);

    setTimeout(() => {
      const newItem = this.items.querySelector(
        `li[data-id="${targetItemID}"]`
      ).nextElementSibling;
      newItem.click();
    }, 2500);
  }

  addItemAtPosition = async (e) => {
    if (e.target.classList.contains('fa-plus')) {
      Fade.Out(this.items);
      this.getActiveSlideIndex() !== null
        ? await GroupStore.addItemAtPosition(
            this.getActiveSlideIndex(),
            this.getItemPosition(e)
          )
        : await MainStore.addItemAtPosition(this.getItemPosition(e));

      this.updateItemList(e);
    }
  };

  restoreMovedItemState(e) {
    const movingItem = e.target.closest('li');
    const movingItemID = movingItem.dataset.id;

    movingItem.classList.add('fade-out');

    setTimeout(() => {
      this.resetItems();
    }, 1000);

    setTimeout(() => {
      const movedItem = this.items.querySelector(
        `li[data-id="${movingItemID}"]`
      );

      !app.landscapeMediaObj.matches && movedItem.click();
    }, 1250);
  }

  moveItem = async (e) => {
    if (e.target.classList.contains(`fa-arrow-up`)) {
      e.stopPropagation();
      this.getActiveSlideIndex() !== null
        ? await GroupStore.moveItem(
            this.getActiveSlideIndex(),
            this.getItemPosition(e),
            'up'
          )
        : await MainStore.moveItem(this.getItemPosition(e), 'up');

      this.restoreMovedItemState(e);
    } else if (e.target.classList.contains(`fa-arrow-down`)) {
      e.stopPropagation();
      this.getActiveSlideIndex() !== null
        ? await GroupStore.moveItem(
            this.getActiveSlideIndex(),
            this.getItemPosition(e),
            'down'
          )
        : await MainStore.moveItem(this.getItemPosition(e), 'down');
      this.restoreMovedItemState(e);
    }
  };
  // @Select Mode -------------

  selectMode(e) {
    if (e.target.closest('.items')) {
      // @Mobile Orientation Portrait
      app.listModal && app.listModal.handleSelectMode(this);

      // Reset UI in case we were in edit mode
      this.index !== null
        ? !app.listModal && app.slides[this.index].exitEditMode()
        : app.main.resetMain();

      // Case we are already in selection mode
      if (app.isSelectMode) {
        app.listModal ? app.listModal.exitSelectMode() : this.exitSelectMode();
        return;
      }

      // Entering Select Mode
      app.isSelectMode = true;

      // ---------
      if (this.index !== null) {
        // Add selection btn of main
        app.main.form.addSelectionMode();

        // --------------
        const inSelectModeSlide = app.slides[this.index];
        inSelectModeSlide.selectModeUI();
        // --------------------
        app.selectionSrc = this.index;
        app.srcGroup = Storage.getCurrentGroupTitle();
        app.srcGroupID = Storage.getCurrentGroupID();
      } else {
        app.main.selectModeUI();
        app.selectionSrc = null;
        app.srcGroup = null;
        app.srcGroupID = null;
      }
    }
  }
  // Selecting Items------------------
  selectItems(e) {
    // Disable selecting items in other places
    if (
      app.isSelectMode &&
      app.srcGroup === Storage.getCurrentGroupTitle() &&
      e.target.closest('.items li')
    ) {
      if (
        app.listModal ||
        (app.slides.length &&
          app.selectionSrc === +e.target.closest('.slide').dataset.index) ||
        app.selectionSrc === null
      ) {
        const li = e.target.closest('li');
        // add to or remove item from selection
        if (li.classList.contains('selected')) {
          Storage.removeFromSelection(li.dataset.id);
          li.classList.remove('selected');
        } else {
          Storage.selectItem(li.dataset.id);
          li.classList.add('selected');
        }
      }
    }
  }

  fadeOutSelectedItems() {
    this.items
      .querySelectorAll('li.selected')
      .forEach((li) => li.classList.add('fade-out'));
  }

  // Deleting Selection ---------------
  async deleteSelectedItems() {
    if (confirm('Are You Sure?')) {
      app.selectionSrc !== null
        ? await GroupStore.removeSlideItems(
            Storage.getSelectedItems(),
            app.selectionSrc,
            app.srcGroupID
          )
        : await MainStore.deleteSelectedItems();
    }
  }

  // Exiting Select Mode ------------
  exitSelectMode() {
    if (Storage.onGroupPage()) {
      app.slides.forEach((slide) => {
        Fade.Out(slide.slideItemList.items);
        setTimeout(() => {
          slide.reset();
        }, 1000);
      });
    }

    app.main.resetMain();
    app.updateHeight();
    app.resetStates();
  }

  // ---------------------------
  deleteMode = (e) => {
    if (e.target.closest('.item-btn') && app.isDeletingItem === false) {
      const li = e.target.closest('li');
      li.classList.add('delete-mode');
    }
  };

  removeDeleteMode = (e) => {
    if (e.target.closest('.item-btn') && app.isDeletingItem === false) {
      const li = e.target.closest('li');
      li.classList.remove('delete-mode');
    }
  };

  // --------------
  clear() {
    this.items.innerHTML = '';
  }
}

// ------------------
class ListItem {
  constructor(id, newEntry) {
    this.itemEl = document.createElement('li');
    this.itemEl.dataset.id = id;
    this.itemEl.className = 'card shadow';

    this.newEntry = newEntry.charAt(0).toUpperCase() + newEntry.substring(1);
    this.render();
  }

  createIconBtn = (btnClassName, IconClassName) => {
    const itemBtn = document.createElement('button');
    itemBtn.className = btnClassName;

    const icon = document.createElement('i');
    icon.className = IconClassName;

    itemBtn.appendChild(icon);
    this.itemEl.appendChild(itemBtn);
  };

  render() {
    this.itemEl.insertAdjacentHTML('afterbegin', flag_dropdown_html);

    this.itemEl.insertAdjacentHTML(
      'beforeend',
      /*html*/ `
      <div class="card-body">
        <div class="card-text text-center"></div>
      </div>
    `
    );

    this.itemEl
      .querySelector('.card-text')
      .appendChild(document.createTextNode(this.newEntry));

    this.createIconBtn('item-btn', 'fa-solid fa-xmark');
  }
}

class UnOrderedListItem extends ListItem {
  constructor(id, newEntry) {
    super(id, newEntry);
    return this.itemEl;
  }
}
class OrderedListItem extends ListItem {
  constructor(id, newEntry, index = null) {
    super(id, newEntry);
    this.index = index;
    this._render(id);
    return this.itemEl;
  }

  async handleFlag(id) {
    this.itemEl.querySelector('.flag-wrapper').classList.contains('d-none') &&
      this.itemEl.querySelector('.flag-wrapper').classList.remove('d-none');

    let activeFlag = '@';
    this.index !== null
      ? (activeFlag = await GroupStore.getActiveFlag(this.index, id))
      : (activeFlag = await MainStore.getActiveFlag(id));

    const flagHeader = this.itemEl.querySelector('.dropdown .btn');
    flagHeader.innerText = activeFlag;
    this._setActiveDropdownItem(activeFlag);
  }

  _setActiveDropdownItem(flag) {
    const dropdownItems = Array.from(
      this.itemEl.querySelectorAll('.dropdown-item')
    );

    const activeItem = dropdownItems.find((item) => item.innerText === flag);
    activeItem.classList.add('active');
    activeItem.setAttribute('aria-current', true);
  }

  _render(id) {
    this.itemEl.classList.add('list-group-item');

    this.handleFlag(id);

    this.createIconBtn('next-item-btn', 'fa-solid fa-plus');
    this.createIconBtn('move-up-item-btn', 'fa-solid fa-arrow-up');
    this.createIconBtn('move-down-item-btn', 'fa-solid fa-arrow-down');
  }
}

export { ItemList, ListItem };
