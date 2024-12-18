import { app } from '../..';
import { getSlideAtIndex } from '../..';
import MainStore from '../../../services/mainStore';
import GroupStore from '../../../services/groupStore';

class Filter {
  constructor(itemList, index = null) {
    index === null
      ? (this.filterEl = app.mainContainer.querySelector('#filter'))
      : (this.filterEl = getSlideAtIndex(index).querySelector('.slide-filter'));

    this.index = index;
    this.itemList = itemList;
    this.items = [];

    this.render();
  }

  render() {
    this.filterEl.innerHTML = /*html*/ `
      <input
      type="text"
      class="filter-input w-100"
      name="filter"
      spellcheck="false"
      autocomplete="off"
      placeholder="Filter"
      onfocus="this.placeholder = ''"
      onblur="this.placeholder = 'Filter'"
      />
      <hr class="line mt-0" />

    `;
    this.filterInput = this.filterEl.querySelector('.filter-input');

    this.filterInput.addEventListener('input', this.filterItems.bind(this));
  }
  
  // Methods --------
  filterItems = async (e) => {
    this.index !== null
      ? (this.items = await GroupStore.getSlideItems(this.index))
      : (this.items = await MainStore.getItems());

    let str = e.target.value.toLowerCase();

    for (let li of Array.from(this.itemList.items.querySelectorAll('li'))) {
      li.querySelector('.card-text').innerText.toLowerCase().includes(str) &&
        (li.style.display = 'block');
      !li.querySelector('.card-text').innerText.toLowerCase().includes(str) &&
        (li.style.display = 'none');
    }
  };

  show() {
    this.filterEl.style.display = 'block';
  }
  hide() {
    this.filterEl.style.display = 'none';
  }
}

export default Filter;
