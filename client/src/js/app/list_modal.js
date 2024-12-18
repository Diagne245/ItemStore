import list_modal_html from '../../html_components/list_modal.html';
import { app } from '../../index.js';
import GroupStore from '../../../services/groupStore.js';
import MainStore from '../../../services/mainStore.js';
import { Modal } from '../bootstrap.bundle.min.js';
import { Form } from '../ui_components/form.js';
import Button from '../ui_components/buttons.js';

// -------------------
class ListModal {
  constructor(itemList, editItemEvent) {
    this.listModalEl = document.getElementById('ordered-list-modal');
    this.listModalEl.innerHTML = list_modal_html;

    this.isListModalOpen = false;

    this.index = itemList.index !== null ? itemList.index : null;
    this.itemList = itemList;

    this.render(editItemEvent);
  }

  // --------------
  render(editItemEvent) {
    if (this.isListModalOpen === false) {
      this._initializeForm();
      this._addListItems();
      this._initializeModal();
      this._openModal();
      this._addListeners(editItemEvent);
    }
  }

  _addListeners(editItemEvent) {
    this.listModal._element.addEventListener('shown.bs.modal', () => {
      this.modalItemsForm.formEl.addEventListener(
        'submit',
        this._handleSubmit.bind(this)
      );

      this.listModal._element.addEventListener(
        'hide.bs.modal',
        this._modalDismissed.bind(this)
      );
    });

    this.editItem(editItemEvent);
    this.modalItemsForm.formInput =
      editItemEvent.target.querySelector('textarea');
    this.handleButtons();
  }

  _addListItems() {
    this.modalItemsForm.formEl.insertAdjacentElement(
      'beforeend',
      this.itemList.items
    );
  }

  async _listUpdateItem(listItemID, listItemText) {
    const isEntryValid = await this.modalItemsForm.validEntry(
      listItemText,
      this.index
    );

    if (isEntryValid) {
      this.index !== null
        ? await GroupStore.updateItem(this.index, listItemID, listItemText)
        : await MainStore.updateItem(listItemID, listItemText);
    }
  }

  _initializeModal() {
    this.listModal = new Modal(this.listModalEl, { backdrop: true });
  }

  _openModal() {
    this.isListModalOpen === false && this.listModal.show();
    this.isListModalOpen = true;
  }

  // ---------------
  _initializeForm() {
    this.modalItemsForm = new Form(this.listModalEl.querySelector('form'));
    this._addButtons();
  }

  _addButtons() {
    this.updateBtn = new Button(
      this.modalItemsForm.formEl,
      'submit',
      ' Update',
      'btn btn-success update text-white',
      'fa-solid fa-pen'
    );

    this.removeSelectionBtn = new Button(
      this.modalItemsForm.formEl,
      'submit',
      ' Remove Items',
      'btn select-mode border border-3 text-white',
      'fa-solid fa-trash-can'
    );
    this.removeSelectionBtn.hide();
  }

  handleButtons() {
    if (app.isEditMode) {
      this.removeSelectionBtn.hide();
      this.updateBtn.show();
    } else if (app.isSelectMode) {
      this.updateBtn.hide();
      this.removeSelectionBtn.show();
    } else if (!app.isEditMode && !app.isSelectMode) {
      this.updateBtn.hide();
      this.removeSelectionBtn.hide();
    }
  }

  editItem(e) {
    const cardText = e.target.closest('.card-text')
      ? e.target.closest('.card-text')
      : e.target.querySelector('.card-text');

    if (
      cardText &&
      !e.target.closest('.edit-mode') &&
      !e.target.classList.contains('items')
    ) {
      app.isEditMode === true && this.resetListItem();

      const innerText = cardText.innerText;

      cardText.innerHTML = /*html*/ `
      <textarea type="text" class="w-100 bg-transparent border-0 text-white fw-semibold" name="list-item-input" rows="1" spellcheck=false>${innerText}</textarea>
    `;

      setTimeout(() => {
        const inputArea = cardText.querySelector('textarea');
        inputArea.style.height = inputArea.scrollHeight + 'px';
        inputArea.setSelectionRange(
          inputArea.value.length,
          inputArea.value.length
        );
        inputArea.focus();

        inputArea.addEventListener('keydown', (e) => {
          inputArea.style.height = inputArea.scrollHeight + 'px';

          if (e.key === 'Enter') {
            e.preventDefault();
            cardText.closest('form').requestSubmit();
          }
        });
      }, 1000);

      e.target.closest('li').classList.add('edit-mode');
      app.isEditMode = true;
    }
  }

  resetListItem() {
    if (this.itemList.items.querySelector('.edit-mode')) {
      const li = this.itemList.items.querySelector('.edit-mode');
      const innerText = li.querySelector('.card-text textarea').value;
      li.querySelector('.card-text').textContent = innerText;
      li.classList.remove('edit-mode');
      app.isEditMode = false;
    }
  }

  exitEditMode() {
    this.resetListItem();
    return;
  }

  // -------------
  async _handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    if (app.isSelectMode) {
      this.itemList.fadeOutSelectedItems();
      await this.itemList.deleteSelectedItems();
      this.exitSelectMode();
      setTimeout(() => {
        this.itemList.resetItems();
      }, 1500);
      return;
    }

    const submitter = submitEvent.submitter;
    if (
      submitter === null ||
      (submitter !== null &&
        submitter.className === 'btn btn-success update text-white')
    ) {
      this._listUpdateItem(
        this.itemList.items.querySelector('.edit-mode').dataset.id,
        this.modalItemsForm.formInput.value,
        this.index
      );
      setTimeout(() => {
        this.itemList.resetItems();
      }, 800);
      this.updateBtn.hide();
      app.isEditMode = false;
    }
  }

  // -------------
  handleSelectMode() {
    this.resetListItem();
    this.updateBtn.hide();
    this.removeSelectionBtn.show();
  }

  exitSelectMode() {
    app.resetStates();
    this.handleButtons();
  }

  // -----------------
  _modalDismissed() {
    app.isEditMode = false;
    app.listModal = null;

    if (!app.isSelectMode) {
      this.index
        ? app.displaySlides() &&
          setTimeout(() => {
            app.updateHeight();
          }, 100)
        : app.main.reload();
    } else {
      if (this.index !== null) {
        app.slides[this.index].slideEl
          .querySelector('.items-wrapper')
          .insertAdjacentElement('beforeend', this.itemList.items);
        app.slides[this.index].selectModeUI();
        app.updateHeight();
      } else {
        app.mainContainer
          .querySelector('#user-data .items-wrapper')
          .insertAdjacentElement('beforeend', this.itemList.items);
        app.main.selectModeUI();
        app.updateHeight();
      }
    }
  }
}

export default ListModal;
