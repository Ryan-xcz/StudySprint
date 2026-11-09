import View from './View.js';

export default class DashboardView extends View {
  generateMarkup(summary) {
    return `
      <div class="dashboard__grid">
        <div class="stat">
          <span class="stat__label">Tasks planned</span>
          <span class="stat__value">${summary.totalTasks}<span class="stat__unit">tasks</span></span>
        </div>
        <div class="stat">
          <span class="stat__label">Finished</span>
          <span class="stat__value">${summary.completedTasks}<span class="stat__unit">done</span></span>
        </div>
        <div class="stat stat--time">
          <span class="stat__label">Focus time left</span>
          <span class="stat__value">${summary.remainingMinutes}<span class="stat__unit">minutes</span></span>
        </div>
      </div>
      <p class="dashboard__hint">${summary.preview ? 'Live estimate includes the minutes in your form.' : 'Complete a task to make room in your day.'}</p>
    `;
  }
}