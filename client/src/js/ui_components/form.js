import { getSlideAtIndex } from '../..';
import Button from './buttons';
import MainStore from '../../../services/mainStore';
import GroupStore from '../../../services/groupStore';

class Form {
  constructor(formEl = document.getElementById('main-form')) {
    this.formEl = formEl;
    this.formInput = null;
    this.addItemBtn = null;
  }

  // Form Add Entry Validation---------------------
  async validEntry(entry, index = null) {
    // Empty input field
    if (entry === '') {
      alert('Please Enter an Item');
      return false;
    }
    // Preventing duplicates
    let items = [];
    index !== null
      ? (items = await GroupStore.getSlideItems(index))
      : (items = await MainStore.getItems());

    if (items.find((item) => item.text === entry)) {
      alert('Item already in the list, Please enter a new Item');
      return false;
    }
    // Valid Entry
    return true;
  }

  // Add Group Form Validation---------------------
  async validGroup(groupTitle) {
    if (groupTitle === '') {
      alert('Please Enter a Group Title');
      return false;
    }
    if (groupTitle.length > 20) {
      alert('Please Enter a Shorter Group Name, You can customize it later');
      return false;
    }

    const groups = await GroupStore.getGroups();
    if (
      groups.find(
        (group) => group.title.toLowerCase() === groupTitle.trim().toLowerCase()
      )
    ) {
      alert('Group already in the list, Please enter a new Group name');
      return false;
    }
    // group title is valid
    return true;
  }

  // UI Methods --------------
  editMode() {
    this.addItemBtn.editMode();
  }

  addSelectionMode() {
    this.addItemBtn.addSelection();
  }

  reset() {
    this.blur();
    this.addItemBtn.reset();
  }

  blur() {
    this.formInput.value = '';
    this.formInput.blur();
  }
}

class MainForm extends Form {
  constructor() {
    super();
    this.render();
  }

  render() {
    this.formInput = this.formEl.querySelector('.form-input');
    this.buttons = this.formEl.querySelector('.buttons');

    this.addItemBtn = new Button(this.buttons);
    this.addGroupBtn = new Button(
      this.buttons,
      'submit',
      ' Add Group',
      'add-group-btn btn btn-primary text-white'
    );
  }
}

// ------------------------
class SlideForm extends Form {
  constructor(index) {
    super(getSlideAtIndex(index).querySelector('.slide-form'));
    this.buttons = this.formEl.querySelector('.buttons');

    this.render();
  }

  render() {
    this.formEl.insertAdjacentHTML(
      'afterbegin',
      /*html*/ `
        <input
          type="text"
          name="form-input"
          class="form-input form-control text-center mb-2 fs-5"
          spellcheck="false"
          autocomplete="off"
          placeholder="New Entry"
          onfocus="this.placeholder=''"
          onblur="this.placeholder='New Entry'"
        />
      `
    );

    this.formInput = this.formEl.querySelector('.form-input');
    this.listIcon = this.formEl.querySelector('.fa-list-ol');
    this.addItemBtn = new Button(this.buttons);
  }
}

export { SlideForm, MainForm, Form };
