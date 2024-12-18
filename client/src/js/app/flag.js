import { Fade } from '../../static';

import { app } from '../..';
import GroupStore from '../../../services/groupStore';
import MainStore from '../../../services/mainStore';

class FlagHandler {
  constructor(itemId, index = null) {
    this.itemId = itemId;
    this.index = index;

    this.index !== null
      ? (this.listItem = app.slides[
          this.index
        ].slideItemList.items.querySelector(`li[data-id="${this.itemId}"]`))
      : (this.listItem = app.main.itemList.items.querySelector(
          `li[data-id="${this.itemId}"]`
        ));

    this.activeFlagEl = app.flagDropdown._menu.querySelector(
      '.dropdown-item.active'
    );

    this._addListeners();
  }

  _addListeners() {
    app.flagDropdown._menu.addEventListener(
      'click',
      this.handleFlag.bind(this)
    );

    app.flagDropdown._element.addEventListener('hide.bs.dropdown', (e) => {
      app.flagDropdown = null;
    });
  }

  handleFlag(e) {
    if (e.target.closest('.dropdown-item')) {
      e.stopImmediatePropagation();
      this.activeFlagEl.classList.remove('active');
      this.activeFlagEl = e.target.closest('.dropdown-item');
      this.activeFlagEl.classList.add('active');
      this.activeFlag = this.activeFlagEl.innerText;

      Fade.Out(app.flagDropdown._menu);
      this.updateFlag();

      setTimeout(() => {
        app.flagDropdown.hide();
      }, 1000);
    }
  }

  async updateFlag() {
    this.index !== null
      ? await GroupStore.updateItem(
          this.index,
          this.itemId,
          null,
          this.activeFlag
        )
      : await MainStore.updateItem(this.itemId, null, this.activeFlag);

    app.flagDropdown._element.querySelector('.dropdown-toggle').innerText =
      this.activeFlag;
  }
}

export default FlagHandler;
