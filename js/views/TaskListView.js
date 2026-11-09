import View from './View.js';

export default class TaskListView extends View {
  generateMarkup(tasks) {
    if (tasks.length === 0) {
      return `
        <div class="empty-state">
          <span class="empty-state__symbol" aria-hidden="true">01</span>
          <p>Your list is clear.<br />Add one task to get your first sprint started.</p>
        </div>
      `;
    }

    const taskItems = tasks.map((task) => this.generateTaskMarkup(task)).join('');

    return `<ul class="task-items">${taskItems}</ul>`;
  }

  generateTaskMarkup(task) {
    const completionClass = task.completed ? 'task-item--done' : '';
    const checkedAttribute = task.completed ? 'checked' : '';
    const taskTitle = this.escapeHtml(task.title);
    const checkboxLabel = task.completed ? 'not done' : 'done';

    return `
      <li class="task-item ${completionClass}" data-task-id="${task.id}">
        <input class="task-check" type="checkbox" data-action="toggle" aria-label="Mark ${taskTitle} ${checkboxLabel}" ${checkedAttribute} />
        <div class="task-item__main">
          <p class="task-item__title">${taskTitle}</p>
          <p class="task-item__meta">${task.minutes} min focus</p>
        </div>
        <div class="task-item__actions">
          <button class="task-action" type="button" data-action="edit">Edit</button>
          <button class="task-action task-action--delete" type="button" data-action="delete">Delete</button>
        </div>
      </li>
    `;
  }

  addHandlerAction(handler) {
    this.parentElement.addEventListener('click', (event) => {
      const actionElement = event.target.closest('[data-action]');
      if (!actionElement || actionElement.dataset.action === 'toggle') return;

      const taskElement = actionElement.closest('[data-task-id]');
      if (taskElement) handler(actionElement.dataset.action, taskElement.dataset.taskId);
    });

    this.parentElement.addEventListener('change', (event) => {
      if (!event.target.matches('[data-action="toggle"]')) return;
      const taskElement = event.target.closest('[data-task-id]');
      if (taskElement) handler('toggle', taskElement.dataset.taskId);
    });
  }

  escapeHtml(value) {
    const htmlCharacters = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return String(value).replace(/[&<>"']/g, (character) => htmlCharacters[character]);
  }
}