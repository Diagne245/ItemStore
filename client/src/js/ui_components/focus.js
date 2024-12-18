import { app } from '../..';
import MainStore from '../../../services/mainStore';

// ------------
class Focus {
  constructor() {
    this.focus = document.getElementById('focus');
    this.render();
  }

  async render() {
    this.focusForm = this.focus.querySelector('.focus-form');
    this.focusTextarea = this.focus.querySelector('.focus-textarea');
    this.mainFocus = this.focus.querySelector('.main-focus');

    this._addEventListeners();
    this.mainFocus.innerText = await MainStore.getFocusText();
  }

  hideMainUI() {
    app.mainContainer.querySelector('.main-inner-top').style.display = 'none';
  }

  showMainUI() {
    app.mainContainer.querySelector('.main-inner-top').style.display = 'block';
  }

  async _updateFocusText() {
    this.hideMainUI();
    this.mainFocus.style.display = 'none';
    this.focusTextarea.style.display = 'block';

    this.focusTextarea.value = await MainStore.getFocusText();
    this.focusTextarea.focus();
    this.focusTextarea.style.height = `${this.focusTextarea.scrollHeight}px`;

    // displaying the line
    document.getElementById('focus').querySelector('hr').style.display =
      'block';
  }

  async _setMainFocus(e) {
    e.preventDefault();
    const focusText = await MainStore.setFocusText(this.focusTextarea.value);

    this.focusTextarea.style.display = 'none';
    this.mainFocus.style.display = 'block';

    this.mainFocus.innerText = focusText;
    document.getElementById('focus').querySelector('hr').style.display = 'none';

    this.showMainUI();
  }

  _addEventListeners() {
    this.mainFocus.addEventListener('click', this._updateFocusText.bind(this));

    this.focusTextarea.addEventListener('input', () => {
      this.focusTextarea.style.height = `${this.focusTextarea.scrollHeight}px`;
    });

    this.focusTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.focusForm.querySelector('[type=submit]').click();
      }
    });

    this.focusForm.addEventListener('submit', this._setMainFocus.bind(this));
  }

  // Focus Display
  show() {
    this.focus.style.display = 'block';
  }

  hide() {
    this.focus.style.display = 'none';
  }
}

export default Focus;
