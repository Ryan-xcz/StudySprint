import View from './View.js';

export default class TaskFormView extends View {
  constructor(parentElement) {
    super(parentElement);
    this.editing = false;
  }

  generateMarkup() {
    return `
      <form class="task-form" novalidate>
        <div>
          <label class="field-label" for="task-title">Task name</label>
          <input class="field-input" id="task-title" name="title" type="text" maxlength="80" placeholder="e.g. Review biology notes" autocomplete="off" />
        </div>
        <div>
          <label class="field-label" for="task-minutes">Estimated time</label>
          <input class="field-input field-input--minutes" id="task-minutes" name="minutes" type="number" min="1" max="720" step="1" placeholder="25" inputmode="numeric" />
        </div>
        <p class="form-error" data-error role="alert" aria-live="polite"></p>
        <div class="form-actions">
          <button class="button button--primary" type="submit" data-submit>${this.editing ? 'Save changes' : 'Add task'}</button>
          <button class="button button--quiet" type="button" data-cancel ${this.editing ? '' : 'hidden'}>Cancel</button>
        </div>
      </form>
    `;
  }

  addHandlerSubmit(handler) {
    this.parentElement.addEventListener('submit', (event) => {
      if (!event.target.matches('.task-form')) return;
      event.preventDefault();
      handler(this.getFormData());
    });
  }

  addHandlerInput(handler) {
    this.parentElement.addEventListener('input', (event) => {
      if (event.target.matches('#task-title, #task-minutes')) {
        handler(this.getFormData());
      }
    });
  }

  addHandlerCancel(handler) {
    this.parentElement.addEventListener('click', (event) => {
      if (event.target.closest('[data-cancel]')) handler();
    });
  }

  getFormData() {
    return {
      title: this.parentElement.querySelector('[name="title"]').value.trim(),
      minutes: this.parentElement.querySelector('[name="minutes"]').value,
    };
  }

  setFormData(task) {
    this.parentElement.querySelector('[name="title"]').value = task.title;
    this.parentElement.querySelector('[name="minutes"]').value = task.minutes;
    this.setEditing(true);
  }

  setEditing(isEditing) {
    this.editing = isEditing;
    this.parentElement.querySelector('[data-submit]').textContent = isEditing ? 'Save changes' : 'Add task';
    this.parentElement.querySelector('[data-cancel]').hidden = !isEditing;
    this.parentElement.closest('.task-editor').querySelector('#editor-title').textContent = isEditing ? 'Edit study task' : 'Add a study task';
    this.clearError();
  }

  reset() {
    this.parentElement.querySelector('.task-form').reset();
    this.setEditing(false);
  }

  showError(message) {
    const errorElement = this.parentElement.querySelector('[data-error]');
    errorElement.textContent = message;
    this.parentElement.querySelector('.field-input:invalid')?.focus();
  }

  clearError() {
    const errorElement = this.parentElement.querySelector('[data-error]');
    if (errorElement) errorElement.textContent = '';
  }
}