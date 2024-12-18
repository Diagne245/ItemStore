import { Storage } from '../src/static';
import axios from 'axios';
import { app } from '../src/index';
import GroupStore from './groupStore';

class MainStore {
  constructor() {
    this._itemsUrl = '/user/mainStore';
  }

  // Landing Text ----------------
  async getFocusText() {
    const res = await axios.get(`${this._itemsUrl}/focus`, {
      params: {
        userId: app.user._id,
      },
    });
    return res.data.data;
  }

  async setFocusText(focusText) {
    const res = await axios.put(this._itemsUrl, {
      userId: app.user._id,
      focusText,
    });
    return res.data.data;
  }

  // -----------
  async getItems() {
    const res = await axios.get(this._itemsUrl, {
      params: { userId: app.user._id },
    });
    return res.data.data;
  }

  async getActiveFlag(itemId) {
    const res = await axios.get(`${this._itemsUrl}/${itemId}`, {
      params: { userId: app.user._id },
    });
    return res.data.data;
  }

  // -------------
  async addItem(text) {
    await axios.post(this._itemsUrl, { userId: app.user._id, text });
  }

  async updateItem(id, text, activeFlag = null) {
    const res = await axios.put(`${this._itemsUrl}/${id}`, {
      userId: app.user._id,
      text,
      activeFlag,
    });

    return res.data.data;
  }

  async addItemAtPosition(position) {
    await axios.post(`${this._itemsUrl}/${position}`, {
      userId: app.user._id,
    });
  }

  async moveItem(position, direction) {
    await axios.patch(`${this._itemsUrl}/${position}`, {
      userId: app.user._id,
      direction,
    });
  }

  async deleteItem(id) {
    await axios.delete(`${this._itemsUrl}/${id}`, {
      data: {
        userId: app.user._id,
      },
    });
  }
  // ----------------
  async addSelection() {
    // Put selected items into an array
    const arrayOfItems = await Storage.getArrayOfSelectedItems();

    // delete selected items from src
    await GroupStore.removeSlideItems(
      Storage.getSelectedItems(),
      app.selectionSrc,
      app.srcGroupID
    );

    // add selected items to mainStore
    await axios.post(this._itemsUrl, { userId: app.user._id, arrayOfItems });
  }

  async deleteSelectedItems() {
    for (const itemID of Storage.getSelectedItems()) {
      await this.deleteItem(itemID);
    }
  }

  async clearAll() {
    await axios.delete(this._itemsUrl, {
      data: {
        userId: app.user._id,
      },
    });
  }
}

export default new MainStore();
