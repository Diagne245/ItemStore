import GroupStore from '../../../services/groupStore';
import { getSlideAtIndex } from '../..';

class SlideTitle {
  constructor(index) {
    this.titleDiv = getSlideAtIndex(index).querySelector('.title-wrapper');
    this.index = index;

    this.render();
  }

  async render() {
    this.titleDiv.innerHTML = /*html*/ `
      <form class="title-form ">
        <input
          type="text"
          spellcheck="false"
          autocomplete="off"
          class="title-input filter d-none"
          name="slide-title-input"
        />
      </form>
      <h4 class="slide-title text-center text-primary fw-normal fs-4"></h4>
    `;

    this._setVariables();
    const landingText = await GroupStore.getSlideLandingText(this.index);
    this._displayTitle(landingText);

    this._addEventListeners();
  }
  // ----------------------------------
  _setVariables() {
    this.titleForm = this.titleDiv.querySelector('.title-form');
    this.titleInput = this.titleDiv.querySelector('.title-input');
    this.slideTitle = this.titleDiv.querySelector('.slide-title');
  }

  _displayTitle(landingText) {
    this.slideTitle.innerText = landingText;
    this._landingTextFontSize(this.slideTitle, landingText);
  }

  _addEventListeners() {
    this.slideTitle.addEventListener(
      'click',
      this._updateLandingText.bind(this, this.index)
    );
  }

  // -------------------------------
  async _updateLandingText(index) {
    this.hideSlideTitle();
    this.showSlideInput();
    this.titleInput.addEventListener(
      'input',
      this._landingTextFontSize.bind(
        this,
        this.titleInput,
        this.titleInput.value
      )
    );

    this.titleInput.value = await GroupStore.getSlideLandingText(index);
    this.titleInput.focus();
  }

  // ------------------
  _landingTextFontSize(element, text) {
    const lgth = text.length;
    if (lgth < 25) {
      this._setFont(element, '1.4rem', 400);
    } else if (lgth < 40) {
      this._setFont(element, '1.1rem', 400);
    } else {
      this._setFont(element, '.9rem', 400);
    }
  }
  _setFont(element, size, weight) {
    element.style.fontSize = size;
    element.style.fontWeight = weight;
  }

  // -----------------
  hideSlideTitle() {
    this.slideTitle.classList.add('d-none');
  }
  showSlideTitle() {
    this.slideTitle.classList.remove('d-none');
  }
  hideSlideInput() {
    this.titleInput.classList.add('d-none');
  }
  showSlideInput() {
    this.titleInput.classList.remove('d-none');
  }
}

// -------------------------

export default SlideTitle;
