import login_modal_html from '../../html_components/login_modal.html';

import User from '../../../services/user.js';
import { Storage } from '../../static.js';
import { app } from '../../index.js';
import { Modal } from '../bootstrap.bundle.min.js';

// -------------------
class Logger {
  constructor() {
    this.modalEl = document.getElementById('login-form-modal');
    this.modalEl.innerHTML = login_modal_html;

    this.loginForm = this.modalEl.querySelector('.login-form');
    this.userNameInput = this.loginForm.querySelector('#username');
    this.passwordInput = this.loginForm.querySelector('#password');
    this.password2Input = this.loginForm.querySelector('#password2');

    this.loginModal = new Modal(this.modalEl, { backdrop: true });

    this._addEventListeners();
  }

  _addEventListeners() {
    this.loginModal._element.addEventListener(
      'shown.bs.modal',
      this._handleBackdrop.bind(this)
    );
    this.loginForm.addEventListener('submit', this.handleSubmit.bind(this));
  }

  _handleBackdrop() {
    this.loginModal._backdrop._element.style.backgroundColor = 'black';
    this.loginModal._backdrop._element.style.opacity = '.5';
  }

  _userPrefill() {
    Storage.getUserName() && (this.userNameInput.value = Storage.getUserName());
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Form validation when Logging On
    if (
      !this.password2Input.classList.contains('d-none') &&
      this.passwordInput.value !== this.password2Input.value
    ) {
      alert('Passwords Do Not match!');
      this.passwordInput.value = '';
      this.password2Input.value = '';
      return;
    }

    app.user = await User.initUser(
      this.userNameInput.value,
      this.passwordInput.value
    );

    if (app.user) {
      app.main.loadUser();
      this.loginModal.hide();
    } else {
      alert('UserName and Password Do Not match!');
      return;
    }
  }
}

export default Logger;
