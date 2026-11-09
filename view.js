export default class View {
  constructor(parentElement) {
    this.parentElement = parentElement;
  }

  render(data) {
    this.parentElement.innerHTML = this.generateMarkup(data);
  }

  generateMarkup() {
    throw new Error('Each view must define generateMarkup().');
  }
}
