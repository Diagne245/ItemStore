class Button {
  constructor(
    parentEl,
    type = 'submit',
    btnText = ' Add Items',
    btnClasses = 'add-item-btn btn btn-secondary',
    iconClasses = 'fa-solid fa-plus'
  ) {
    this.button = document.createElement('button');
    this.parentEl = parentEl;
    this.type = type;
    this.btnText = btnText;
    this.btnClasses = btnClasses;
    this.iconClasses = iconClasses;

    this.render();
  }

  render() {
    this.button.type = this.type;
    this.button.className = this.btnClasses;

    const icon = document.createElement('i');
    icon.className = this.iconClasses;

    this.button.appendChild(icon);
    this.button.appendChild(document.createTextNode(this.btnText));
    this.parentEl.appendChild(this.button);
  }
  // ------------------
  hide() {
    this.button.style.display = 'none';
  }

  show() {
    this.button.style.display = 'inline-block';
  }

  removeSelection() {
    this.button.style.display = 'inline-block';
    this.button.lastChild.nodeValue = ' Remove Items';
    this.button.classList.add('select-mode');
  }

  clearAll() {
    this.button.lastChild.nodeValue = ' Clear All';
    this.button.classList.contains('select-mode') &&
      this.button.classList.remove('select-mode');
  }

  editMode() {
    if (this.button) {
      this.button.lastChild.nodeValue = ' Update';
      this.button.classList.add('update');

      const icon = this.button.querySelector('.fa-plus');
      icon && icon.classList.replace('fa-plus', 'fa-pen');
    }
  }

  addSelection() {
    if (this.button) {
      this.button.lastChild.nodeValue = ' Add Selection';
      this.button.classList.add('select-mode');
    }
  }

  reset() {
    this.show();

    this.button.lastChild.nodeValue = ' Add Items';
    this.button.className = 'btn add-item-btn btn-secondary';

    this.button.querySelector('.fa-pen') &&
      this.button
        .querySelector('.fa-pen')
        .classList.replace('fa-pen', 'fa-plus');
  }
}

export default Button;
