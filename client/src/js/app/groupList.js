import { app } from "../..";
import { Storage } from "../../static";
import GroupStore from "../../../services/groupStore";

// ---------------------
class GroupList {
  constructor() {
    this.groupListEl = app.mainContainer.querySelector('#groups');
    this.render();
  }

  async render() {
    this.groupListEl.innerHTML = '';

    const groups = await GroupStore.getGroups();
    if (groups.length !== 0) {
      groups.forEach((group) => {
        this._displayGroupBtn(group._id, group.title);
      });
    }
    this.groupListEl.addEventListener('click', this._expandGroup.bind(this));
  }

  _expandGroup(e) {
    !app.isSelectMode && app.main.resetMain();

    if (e.target.classList.contains('about-btn')) {
      new About();
      app.horizontalSwipe.slidePrev();
      return;
    }

    if (e.target.classList.contains('group-btn')) {
      Storage.setCurrentPage('group-page');
      Storage.setCurrentGroup(e.target.innerText);
      Storage.setCurrentGroupID(e.target.id);

      app.displaySlides();

      // Select Mode------
      if (app.isSelectMode) {
        setTimeout(() => {
          // Restore src slide state
          let addSelectionSlides;
          if (app.srcGroup === e.target.innerText) {
            addSelectionSlides = app.slides.filter(
              (slide) => slide.index !== app.selectionSrc
            );
            this.restoreSrcSlide();
          } else {
            addSelectionSlides = app.slides;
          }

          for (const slide of addSelectionSlides) {
            slide.slideForm.addSelectionMode();
            slide.slideEl.removeEventListener(
              'click',
              slide.addActiveClassHandler
            );
          }
        }, 1000);
      }

      app.horizontalSwipe.slideNext();
      scrollTo(0, 0);
      app.updateHeight();
    }
  }

  restoreSrcSlide() {
    const srcSlide = app.slides.find(
      (slide) => slide.index === app.selectionSrc
    );
    srcSlide.selectModeUI();
    srcSlide.showUIElements();
    srcSlide.slideEl.removeEventListener(
      'click',
      srcSlide.addActiveClassHandler
    );
    setTimeout(() => {
      // Add selected class to selected list items
      srcSlide.slideItemList.items.childNodes.forEach((li) => {
        Storage.getSelectedItems().includes(li.dataset.id) &&
          li.classList.add('selected');
      });
    }, 500);
  }

  // -----------------------
  _displayGroupBtn(id, title) {
    const groupLi = document.createElement('button');
    groupLi.type = 'button';
    groupLi.id = id;
    groupLi.className = 'group-btn btn btn-primary border border-3 fw-semibold';
    groupLi.appendChild(document.createTextNode(title));

    this.groupListEl.appendChild(groupLi);
  }
}

export default GroupList;
