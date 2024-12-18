import { getSlideAtIndex } from '../..';

class HomeIcon {
  constructor(index) {
    this.homeBtn = getSlideAtIndex(index).querySelector('.home-btn');
  }

  show() {
    this.homeBtn.style.display = 'block';
  }

  hide() {
    this.homeBtn.style.display = 'none';
  }
}

class RemoveSlideIcon {
  constructor(index) {
    this.deleteBtn = getSlideAtIndex(index).querySelector('.delete-btn');
  }

  show() {
    this.deleteBtn.style.display = 'block';
  }

  hide() {
    this.deleteBtn.style.display = 'none';
  }
}

class AddSlideIcon {
  constructor(index) {
    this.addSlideBtn = getSlideAtIndex(index).querySelector('.add-slide');

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-plus fa-2x text-primary mt-4';

    this.addSlideBtn.appendChild(icon);
  }
}

export { HomeIcon, AddSlideIcon, RemoveSlideIcon };
