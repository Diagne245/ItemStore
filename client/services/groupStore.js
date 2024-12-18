import axios from 'axios';
import { app } from '../src/index.js';
import { Storage } from '../src/static';
import MainStore from './mainStore';

// -----------------
class GroupStore {
  constructor() {
    this.groupsUrl = '/user/groups';
    this.slideUrl = '/user/group/slide';
  }

  // Get groups----------------------
  getGroups = async () => {
    const res = await axios.get(this.groupsUrl, {
      params: { userId: app.user._id },
    });
    return res.data.data;
  };

  getGroupByID = async (groupID = Storage.getCurrentGroupID()) => {
    const res = await axios.get(`${this.groupsUrl}/${groupID}`, {
      params: { userId: app.user._id },
    });
    return res.data.data;
  };

  getSlideLandingText = async (index) => {
    const currentGroup = await this.getGroupByID();
    return currentGroup.slides[index].landingText;
  };

  setSlideLandingText = async (landingText, index) => {
    await axios.put(`${this.slideUrl}/${index}`, {
      userId: app.user._id,
      groupID: Storage.getCurrentGroupID(),
      landingText,
    });
  };

  addGroup = async (title) => {
    return await axios.post(this.groupsUrl, { userId: app.user._id, title });
  };

  addNewSlide = async (index) => {
    await axios.post(`${this.groupsUrl}/${Storage.getCurrentGroupID()}`, {
      userId: app.user._id,
      index,
    });
  };

  // ------------
  addItemToSlide = async (text, index) => {
    const res = await axios.post(this.slideUrl, {
      userId: app.user._id,
      groupID: Storage.getCurrentGroupID(),
      index,
      text,
    });
    return res.data.data;
  };

  async addItemAtPosition(index, position) {
    await axios.post(`${this.slideUrl}/position`, {
      userId: app.user._id,
      groupID: Storage.getCurrentGroupID(),
      index,
      position,
    });
  }

  async moveItem(index, position, direction) {
    await axios.patch(this.slideUrl, {
      userId: app.user._id,
      groupID: Storage.getCurrentGroupID(),
      index,
      position,
      direction,
    });
  }

  async getActiveFlag(index, itemId) {
    const res = await axios.get(`${this.slideUrl}/item/flag/${itemId}`, {
      params: {
        userId: app.user._id,
        groupID: Storage.getCurrentGroupID(),
        index,
      },
    });
    return res.data.data;
  }

  updateItem = async (index, itemID, updatedText, activeFlag = null) => {
    const res = await axios.put(`${this.slideUrl}/${itemID}`, {
      userId: app.user._id,
      groupID: Storage.getCurrentGroupID(),
      index,
      updatedText,
      activeFlag,
    });

    return res.data.data;
  };

  // -------------
  getSlideItems = async (index, groupID = Storage.getCurrentGroupID()) => {
    const group = await this.getGroupByID(groupID);
    return group.slides[index].slideItems;
  };

  // ----------
  addSelection = async (index) => {
    // Put selected items into an array
    const arrayOfItems = await Storage.getArrayOfSelectedItems();

    // delete selected items from src
    if (app.srcGroup === null) {
      await MainStore.deleteSelectedItems();
    } else {
      await this.removeSlideItems(
        Storage.getSelectedItems(),
        app.selectionSrc,
        app.srcGroupID
      );
    }

    // add selected items to destination slide
    await axios.post(`${this.slideUrl}`, {
      userId: app.user._id,
      groupID: Storage.getCurrentGroupID(),
      index,
      arrayOfItems,
    });
  };

  // ----------------
  removeSlideItems = async (
    arrayOfIds,
    index,
    groupID = Storage.getCurrentGroupID()
  ) => {
    await axios.delete(`${this.slideUrl}/${index}`, {
      data: {
        userId: app.user._id,
        groupID,
        arrayOfIds,
      },
    });
  };

  // --------------
  clearSlideItems = async (index) => {
    await axios.delete(`${this.slideUrl}/${index}`, {
      data: {
        userId: app.user._id,
        groupID: Storage.getCurrentGroupID(),
      },
    });
  };

  // Remove group & slide
  removeSlide = async (index) => {
    await axios.delete(`${this.groupsUrl}/${Storage.getCurrentGroupID()}`, {
      data: { userId: app.user._id, index },
    });
  };

  removeGroup = async () => {
    await axios.delete(`${this.groupsUrl}/${Storage.getCurrentGroupID()}`, {
      data: {
        userId: app.user._id,
      },
    });
  };
}

export default new GroupStore();
