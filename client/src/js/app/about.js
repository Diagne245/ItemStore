import about_homeBtn_html from '../../html_components/about_homeBtn.html';
import about_html from '../../html_components/about.html';
import { app } from '../..';
import { Storage } from '../../static';

const aboutPage = document.getElementById('about-page');

class About {
  constructor() {
    aboutPage.innerHTML = about_html;

    document
      .querySelector('body')
      .insertAdjacentHTML('beforeend', about_homeBtn_html);

    this.backToMainBtn = document.querySelector('.about-home-btn');
    setTimeout(() => {
      this.backToMainBtn.classList.replace('opacity-0', 'opacity-100');
    }, 1000);
    this._loadListeners();
    Storage.setCurrentPage('about-page');
  }

  _loadListeners() {
    this.backToMainBtn.addEventListener('click', this._backToMain.bind(this));
  }

  _backToMain() {
    Storage.setCurrentPage('main-page');
    this.backToMainBtn.remove();
    app.horizontalSwipe.slideNext();
    scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export default About;
