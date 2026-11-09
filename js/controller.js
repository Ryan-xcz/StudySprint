import * as model from './model.js';
import DashboardView from './views/DashboardView.js';
import TaskFormView from './views/TaskFormView.js';
import TaskListView from './views/TaskListView.js';

const formView = new TaskFormView(document.querySelector('[data-view="form"]'));
const taskListView = new TaskListView(document.querySelector('[data-view="tasks"]'));
const dashboardView = new DashboardView(document.querySelector('[data-view="dashboard"]'));
let editingTaskId = null;

function getSummary(draftMinutes = '') {
  const activeTasks = model.state.tasks.filter((task) => {
    const taskIsNotComplete = !task.completed;
    const taskIsNotBeingEdited = task.id !== editingTaskId;
    return taskIsNotComplete && taskIsNotBeingEdited;
  });

  const savedMinutes = activeTasks.reduce((total, task) => {
    return total + task.minutes;
  }, 0);

  const draftIsNotEmpty = draftMinutes !== '';
  const parsedDraftMinutes = Number(draftMinutes);
  const draftIsAWholeNumber = Number.isInteger(parsedDraftMinutes);
  const draftIsPositive = parsedDraftMinutes > 0;
  const hasDraft = draftIsNotEmpty && draftIsAWholeNumber && draftIsPositive;
  const previewMinutes = hasDraft ? parsedDraftMinutes : 0;
  const completedTasks = model.state.tasks.filter((task) => task.completed);

  return {
    totalTasks: model.state.tasks.length,
    completedTasks: completedTasks.length,
    remainingMinutes: savedMinutes + previewMinutes,
    preview: hasDraft,
  };
}

function renderAll(draftMinutes = '') {
  taskListView.render(model.state.tasks);
  dashboardView.render(getSummary(draftMinutes));
}

function validateTask(taskData) {
  if (!taskData.title) return 'Give your task a name before adding it.';
  if (taskData.title.length > 80) return 'Keep the task name to 80 characters or fewer.';

  const minutes = Number(taskData.minutes);
  if (!taskData.minutes || !Number.isInteger(minutes) || minutes < 1 || minutes > 720) {
    return 'Enter a whole number of minutes from 1 to 720.';
  }

  return '';
}

function controlSubmitTask(taskData) {
  const errorMessage = validateTask(taskData);
  if (errorMessage) {
    formView.showError(errorMessage);
    return;
  }

  if (editingTaskId) {
    model.updateTask(editingTaskId, taskData);
    editingTaskId = null;
  } else {
    model.addTask(taskData);
  }

  formView.reset();
  renderAll();
}

function controlPreview(draftData) {
  formView.clearError();
  dashboardView.render(getSummary(draftData.minutes));
}

function controlCancelEdit() {
  editingTaskId = null;
  formView.reset();
  renderAll();
}

function controlEditTask(id) {
  const task = model.getTask(id);
  if (!task) return;

  editingTaskId = id;
  formView.setFormData(task);
  controlPreview(formView.getFormData());
  document.querySelector('#task-title').focus();
}

function controlDeleteTask(id) {
  model.deleteTask(id);

  if (editingTaskId === id) {
    controlCancelEdit();
    return;
  }

  renderAll();
}

function controlToggleTask(id) {
  model.toggleTask(id);
  renderAll(formView.getFormData().minutes);
}

function controlTaskAction(action, id) {
  if (action === 'edit') controlEditTask(id);
  if (action === 'delete') controlDeleteTask(id);
  if (action === 'toggle') controlToggleTask(id);
}

function init() {
  model.loadState();
  formView.render();
  formView.addHandlerSubmit(controlSubmitTask);
  formView.addHandlerInput(controlPreview);
  formView.addHandlerCancel(controlCancelEdit);
  taskListView.addHandlerAction(controlTaskAction);
  renderAll();
}

init();