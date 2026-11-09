# Study Sprint: Code Blocks Explained

This guide explains the important code blocks in the project in the order you usually follow them: the page starts, the controller connects the parts, and the model and views do their jobs. Read a code block, then read the explanation right below it.

The examples use the current project code. Some examples shorten long HTML strings so we can focus on the JavaScript behavior.

## First: the whole app flow

When you add a task, this is the route through the project:

```text
You type into the form
  -> TaskFormView reads the inputs
  -> controller checks the values
  -> model adds and saves the task
  -> controller tells views to redraw
  -> TaskListView and DashboardView show the new data
```

A **View** handles what is displayed and reports user actions. The **Controller** decides what should happen next. The **Model** owns and changes task data. This division is the project's MVC architecture.

# 1. `index.html`: the page's starting elements

## Load the stylesheet and JavaScript module

```html
<link rel="stylesheet" href="css/style.css" />
<script type="module" src="js/controller.js"></script>
```

The first line tells the browser to apply the CSS file. The second loads `controller.js` as a JavaScript module. A module can use `import` and `export`, which this project uses to connect its files. The browser starts the app by running the controller module.

## Mark places where views render

```html
<div class="dashboard__content" data-view="dashboard"></div>
<div data-view="form"></div>
<div class="task-list" data-view="tasks"></div>
```

These are empty containers in the starting HTML. The controller finds them with `document.querySelector()` and gives each container to its matching view:

- `[data-view="dashboard"]` is where `DashboardView` puts summary markup.
- `[data-view="form"]` is where `TaskFormView` puts the form.
- `[data-view="tasks"]` is where `TaskListView` puts the task list.

The `data-view` attributes are labels for JavaScript; they do not themselves create behavior.

# 2. `js/model.js`: the app's task data

## Storage name and state

```js
const STORAGE_KEY = 'study-sprint-state';

export const state = {
  tasks: [],
};
```

`STORAGE_KEY` is the label under which this app saves information in browser storage. The exported `state` object holds the current app data while the page is open. At first, `tasks` is an empty array: there are no tasks yet.

One task inside this array looks like:

```js
{
  id: 'unique-id',
  title: 'Review biology',
  minutes: 30,
  completed: false
}
```

- `id` tells the app exactly which task a button refers to.
- `title` is the task name.
- `minutes` is a number, not text.
- `completed` is `false` until the user checks the box.

## Load saved data

```js
export function loadState() {
  try {
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (savedState && Array.isArray(savedState.tasks)) {
      state.tasks = savedState.tasks;
    }
  } catch {
    state.tasks = [];
  }

  return state;
}
```

`loadState()` runs when the controller starts the app. `localStorage.getItem(...)` asks the browser for the saved text. `JSON.parse(...)` converts that text back into a JavaScript object.

The `if` makes sure saved data exists and that its `tasks` property is an array before loading it. If the saved text is broken and parsing throws an error, `catch` leaves the task list empty instead of stopping the app. Finally, the function returns the state object.

Example: after a reload, if the browser has saved one task, this function puts that task back into `state.tasks`.

## Save current data

```js
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
```

`JSON.stringify(state)` converts the JavaScript object into text because `localStorage` stores text. `setItem()` saves that text under the app's storage name. This function is not exported, which means other files should save data by calling a model function such as `addTask()` rather than calling `saveState()` themselves.

## Add a task

```js
export function addTask(taskData) {
  const task = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: taskData.title,
    minutes: Number(taskData.minutes),
    completed: false,
  };

  state.tasks.push(task);
  saveState();
  return task;
}
```

`taskData` is the object read from the form. For example, it may contain `{ title: 'Review biology', minutes: '30' }`. Input values arrive as text, so `Number(taskData.minutes)` changes `'30'` to the number `30`.

The model builds a complete task object. `Date.now()` gives the current time, and `Math.random()` adds a random part to make an ID. The new object is added to the `tasks` array with `push()`. Then the model saves the updated state and returns the new task.

## Update a task

```js
export function updateTask(id, taskData) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  task.title = taskData.title;
  task.minutes = Number(taskData.minutes);
  saveState();
}
```

`find()` searches the array and returns the first task whose ID matches `id`. If no matching task exists, `task` is missing and `return` stops the function. Otherwise the title and minutes are replaced, then the state is saved.

Example: if the user edits a 30-minute task to 45 minutes, this function changes that existing object. It does not create a second task.

## Toggle completion

```js
export function toggleTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveState();
}
```

The task is found by ID. The `!` means “not,” so `!false` becomes `true` and `!true` becomes `false`. Each checkbox click switches the completion status, then saves it.

The model only changes the `completed` value. The controller and views make the checkbox and styling reflect that value.

## Delete a task

```js
export function deleteTask(id) {
  state.tasks = state.tasks.filter((task) => task.id !== id);
  saveState();
}
```

`filter()` creates a new array containing only tasks that pass its condition. Here, the condition keeps tasks whose ID is not the ID to delete. The model replaces the old array with this shorter array and saves it.

## Find one task

```js
export function getTask(id) {
  return state.tasks.find((task) => task.id === id);
}
```

This returns the task with the matching ID, or `undefined` if it is not found. The controller uses it when the user chooses Edit, so it can fill the form with the task's current values.

**Model boundary:** `model.js` never calls `document.querySelector()` and never imports a view. It only owns data and data changes.

# 3. `js/views/View.js`: shared view behavior

```js
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
```

`View` is a parent class shared by the form, list, and dashboard views.

- `constructor(parentElement)` remembers the HTML container where this view belongs. `this` means the particular view object being created.
- `render(data)` asks the specific child view to make markup by calling `generateMarkup(data)`. It then puts the returned HTML inside the saved container using `innerHTML`.
- The base `generateMarkup()` throws an error on purpose. Each child class must provide its own version. If one forgets, the error points out the missing implementation instead of silently showing an empty view.

`extends View` in a child class means “reuse the shared behavior from View.” `super(parentElement)` runs the parent constructor so the child gets `parentElement`.

# 4. `js/views/TaskFormView.js`: form markup and form events

## Start the form view

```js
import View from './View.js';

export default class TaskFormView extends View {
  constructor(parentElement) {
    super(parentElement);
    this.editing = false;
  }
```

The import brings in the base class. `TaskFormView extends View` makes this a specialized view. `super(parentElement)` stores the form's container in the base class. `this.editing = false` means the form starts in “add a new task” mode, not “edit a task” mode.

## Build the form

```js
generateMarkup() {
  return `
    <form class="task-form" novalidate>
      <label for="task-title">Task name</label>
      <input id="task-title" name="title" type="text" />
      <label for="task-minutes">Estimated time</label>
      <input id="task-minutes" name="minutes" type="number" />
      <p data-error role="alert"></p>
      <button type="submit" data-submit>Add task</button>
      <button type="button" data-cancel hidden>Cancel</button>
    </form>
  `;
}
```

The real method includes CSS classes, placeholders, and limits, but this shorter version shows its purpose: return the form's HTML. The backticks create a template literal, which lets the method return multiple lines of text.

`novalidate` turns off the browser's automatic validation popup. The controller checks the values and the view shows the project's own error message in the `data-error` paragraph. The `name` attributes help `getFormData()` locate the correct inputs. The `data-submit` and `data-cancel` attributes help the view find the buttons.

In the actual code, the submit button's text uses `this.editing`: it says `Add task` normally and `Save changes` while editing.

## Listen for form submission

```js
addHandlerSubmit(handler) {
  this.parentElement.addEventListener('submit', (event) => {
    if (!event.target.matches('.task-form')) return;
    event.preventDefault();
    handler(this.getFormData());
  });
}
```

The controller passes a function into this method as `handler`. The view listens for a `submit` event on its parent container.

- `event.target` is the element that submitted. The `matches()` check ensures it is this form.
- `return` ignores unrelated submit events.
- `preventDefault()` prevents the browser from reloading the page for a normal form submission.
- `this.getFormData()` reads the input values.
- `handler(...)` calls the controller function with those values.

In this project the controller connects it like this: `formView.addHandlerSubmit(controlSubmitTask)`. So the handler is `controlSubmitTask`.

## Listen while the user types

```js
addHandlerInput(handler) {
  this.parentElement.addEventListener('input', (event) => {
    if (event.target.matches('#task-title, #task-minutes')) {
      handler(this.getFormData());
    }
  });
}
```

The browser raises an `input` event when text changes. The view only reports typing in the task name or minutes fields. It calls the controller with current form data; the controller can then update the dashboard preview. Typing does not save a task.

## Listen for Cancel

```js
addHandlerCancel(handler) {
  this.parentElement.addEventListener('click', (event) => {
    if (event.target.closest('[data-cancel]')) handler();
  });
}
```

When a click occurs inside the form container, `closest('[data-cancel]')` checks whether the clicked element is the Cancel button or something inside it. If so, the view calls the controller's cancel handler.

## Read input values

```js
getFormData() {
  return {
    title: this.parentElement.querySelector('[name="title"]').value.trim(),
    minutes: this.parentElement.querySelector('[name="minutes"]').value,
  };
}
```

`querySelector()` finds each input by its `name`. `.value` reads what the user typed. `.trim()` removes spaces from the beginning and end of the task name, so a name containing only spaces becomes empty. The returned object is passed to the controller.

Example result: `{ title: 'Review biology', minutes: '30' }`. Notice minutes are still text at this point.

## Put an existing task into the form

```js
setFormData(task) {
  this.parentElement.querySelector('[name="title"]').value = task.title;
  this.parentElement.querySelector('[name="minutes"]').value = task.minutes;
  this.setEditing(true);
}
```

This is used for editing. It copies the saved task's values into the two input fields, then switches the form into edit mode. It does not save anything by itself.

## Switch between add and edit mode

```js
setEditing(isEditing) {
  this.editing = isEditing;
  this.parentElement.querySelector('[data-submit]').textContent = isEditing ? 'Save changes' : 'Add task';
  this.parentElement.querySelector('[data-cancel]').hidden = !isEditing;
  this.parentElement.closest('.task-editor').querySelector('#editor-title').textContent = isEditing ? 'Edit study task' : 'Add a study task';
  this.clearError();
}
```

The argument `isEditing` is either `true` or `false`. The method stores it and updates the form's visible labels:

- When `true`, the main button says `Save changes`, Cancel is shown, and the heading says `Edit study task`.
- When `false`, the button says `Add task`, Cancel is hidden, and the heading returns to `Add a study task`.

`? :` is called the ternary operator. For example, `isEditing ? 'Save changes' : 'Add task'` means “use the first text if `isEditing` is true; otherwise use the second.”

## Reset the form

```js
reset() {
  this.parentElement.querySelector('.task-form').reset();
  this.setEditing(false);
}
```

The browser's form `reset()` clears the inputs. The second line returns the button and heading to add mode and clears any old error.

## Show and clear validation error

```js
showError(message) {
  const errorElement = this.parentElement.querySelector('[data-error]');
  errorElement.textContent = message;
  this.parentElement.querySelector('.field-input:invalid')?.focus();
}

clearError() {
  const errorElement = this.parentElement.querySelector('[data-error]');
  if (errorElement) errorElement.textContent = '';
}
```

`showError()` puts the controller's message into the error paragraph. `textContent` inserts it as text rather than treating it as HTML. The `?.` means “only call `focus()` if an invalid input was found.”

`clearError()` checks that the error paragraph exists, then empties its text. This view displays the error; validation rules are in the controller.

# 5. `js/views/TaskListView.js`: task rows and list actions

## Show either an empty state or a list

```js
generateMarkup(tasks) {
  if (tasks.length === 0) {
    return '<p>Your list is clear. Add one task to get started.</p>';
  }

  const taskItems = tasks.map((task) => this.generateTaskMarkup(task)).join('');
  return `<ul class="task-items">${taskItems}</ul>`;
}
```

`tasks` is the array the controller gives to the view. If it has no items, show the empty message. Otherwise:

- `map()` calls `generateTaskMarkup()` once for every task and produces an array of HTML strings.
- `join('')` combines the strings without adding commas.
- The returned `<ul>` wraps all the task rows.

For two tasks, `generateTaskMarkup()` runs twice.

## Build one task row

```js
generateTaskMarkup(task) {
  const completionClass = task.completed ? 'task-item--done' : '';
  const checkedAttribute = task.completed ? 'checked' : '';
  const taskTitle = this.escapeHtml(task.title);

  return `
    <li class="task-item ${completionClass}" data-task-id="${task.id}">
      <input type="checkbox" data-action="toggle" ${checkedAttribute} />
      <p>${taskTitle}</p>
      <p>${task.minutes} min focus</p>
      <button data-action="edit">Edit</button>
      <button data-action="delete">Delete</button>
    </li>
  `;
}
```

`task` is one object from the tasks array. If it is complete, the row gets a CSS class and the checkbox gets the `checked` attribute. `data-task-id` stores the task's ID on the row, so a later click can be connected to the correct task. `data-action` labels each control so the event handler can tell Edit, Delete, and Toggle apart.

The actual code also adds accessible text to the checkbox and displays styled markup.

## Report Edit, Delete, or Complete

```js
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
```

The view uses event delegation: instead of adding a separate listener to every row button, it listens on the task-list container. This still works after the rows are replaced during rendering.

For a button click, it finds the closest element labelled with `data-action`, then finds the row labelled with `data-task-id`. It calls the controller with two pieces of information. Example: clicking Edit on a row could call `handler('edit', 'unique-id')`.

Checkboxes use a `change` event. The click handler ignores the checkbox so Toggle is only reported once. The view reports the action; it does not edit model state itself.

## Escape task text

```js
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
```

A task name is user-entered text. If it contains characters like `<` or `>`, inserting it directly into HTML could make the browser interpret it as markup. This function replaces special characters with their safe HTML text forms. `replace()` checks each matching character and looks up its safe version in `htmlCharacters`.

# 6. `js/views/DashboardView.js`: display summary numbers

```js
export default class DashboardView extends View {
  generateMarkup(summary) {
    return `
      <div>
        <span>${summary.totalTasks}</span>
        <span>${summary.completedTasks}</span>
        <span>${summary.remainingMinutes}</span>
      </div>
      <p>${summary.preview ? 'Live estimate includes the minutes in your form.' : 'Complete a task to make room in your day.'}</p>
    `;
  }
}
```

The actual view includes labels and CSS classes, but this is the same idea. It receives a `summary` object from the controller and inserts its values into the markup. It does not count tasks or add minutes itself.

If `summary.preview` is true, the hint says that the total includes the form input. Otherwise, it shows the regular hint. The ternary expression chooses between those two strings.

# 7. `js/controller.js`: connect model and views

## Imports and view setup

```js
import * as model from './model.js';
import DashboardView from './views/DashboardView.js';
import TaskFormView from './views/TaskFormView.js';
import TaskListView from './views/TaskListView.js';

const formView = new TaskFormView(document.querySelector('[data-view="form"]'));
const taskListView = new TaskListView(document.querySelector('[data-view="tasks"]'));
const dashboardView = new DashboardView(document.querySelector('[data-view="dashboard"]'));
let editingTaskId = null;
```

The imports bring the model functions and view classes into the controller. `import * as model` groups the model's exported functions and `state` under the name `model`; that is why calls look like `model.addTask(...)`.

Each `document.querySelector(...)` finds a container in `index.html`. The controller gives that element to the view constructor. `editingTaskId` starts as `null`, meaning “no task is currently being edited.”

## Calculate dashboard values

```js
function getSummary(draftMinutes = '') {
  const activeTasks = model.state.tasks.filter((task) => {
    const taskIsNotComplete = !task.completed;
    const taskIsNotBeingEdited = task.id !== editingTaskId;
    return taskIsNotComplete && taskIsNotBeingEdited;
  });

  const savedMinutes = activeTasks.reduce((total, task) => {
    return total + task.minutes;
  }, 0);

  // The actual function also validates and adds the draft minutes.
}
```

This function calculates values for display; it does not save anything.

- `draftMinutes = ''` means the argument is optional. If no value is supplied, use an empty string.
- `filter()` keeps unfinished tasks. It also excludes the task being edited because the form preview will represent its new minutes instead of double-counting the old minutes.
- `reduce()` starts with total `0`, then adds each active task's minutes. If active tasks take 25 and 30 minutes, `savedMinutes` becomes 55.

The actual function checks whether the draft input is a positive whole number. It returns an object containing `totalTasks`, `completedTasks`, `remainingMinutes`, and `preview`. The dashboard view receives this object.

## Render the task list and dashboard

```js
function renderAll(draftMinutes = '') {
  taskListView.render(model.state.tasks);
  dashboardView.render(getSummary(draftMinutes));
}
```

This function refreshes two screen areas. The list gets the task array. The dashboard gets the calculated summary. `render()` belongs to the shared View base class, but each view supplies its own markup generator.

## Validate form data

```js
function validateTask(taskData) {
  if (!taskData.title) return 'Give your task a name before adding it.';
  if (taskData.title.length > 80) return 'Keep the task name to 80 characters or fewer.';

  const minutes = Number(taskData.minutes);
  if (!taskData.minutes || !Number.isInteger(minutes) || minutes < 1 || minutes > 720) {
    return 'Enter a whole number of minutes from 1 to 720.';
  }

  return '';
}
```

The function receives the values from the form. It checks one rule at a time and returns as soon as it finds an error. This is called a guard clause: an invalid value exits early with an explanation.

`Number(...)` converts input text to a number. `Number.isInteger(...)` rejects decimals. The valid range is 1 through 720. If all checks pass, the function returns an empty string to mean “no error.”

Examples:

- `{ title: '', minutes: '30' }` returns the missing-name message.
- `{ title: 'Read chapter', minutes: '0' }` returns the minutes message.
- `{ title: 'Read chapter', minutes: '30' }` returns `''`.

## Add a new task or save an edit

```js
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
```

This is the controller's submit decision. First it validates. If the returned message is not empty, it asks the form view to display that message and stops.

If there is an `editingTaskId`, update that existing task. Otherwise, add a new task. After either successful action, clear the form and redraw the task list and dashboard.

Example: if `editingTaskId` is `null`, `model.addTask(taskData)` runs. If it contains a task ID, `model.updateTask(id, taskData)` runs.

## Update the live preview while typing

```js
function controlPreview(draftData) {
  formView.clearError();
  dashboardView.render(getSummary(draftData.minutes));
}
```

The form view sends current input values to this function. The controller removes any old error and asks the dashboard to display a newly calculated summary. It does not call a model mutation function, so typing does not save a task.

## Cancel an edit

```js
function controlCancelEdit() {
  editingTaskId = null;
  formView.reset();
  renderAll();
}
```

Clear the ID so the app is no longer editing. Reset the form to add mode, then redraw the current saved data.

## Start editing a task

```js
function controlEditTask(id) {
  const task = model.getTask(id);
  if (!task) return;

  editingTaskId = id;
  formView.setFormData(task);
  controlPreview(formView.getFormData());
  document.querySelector('#task-title').focus();
}
```

The list view sends the selected task's ID. The controller asks the model for that task. If it does not exist, stop. Otherwise remember its ID, put its values into the form, refresh the preview, and move keyboard focus to the task name input.

## Delete a task

```js
function controlDeleteTask(id) {
  model.deleteTask(id);

  if (editingTaskId === id) {
    controlCancelEdit();
    return;
  }

  renderAll();
}
```

The model removes and saves the task. If it was also the task open in the edit form, cancel the edit so the form does not keep showing deleted data. Otherwise, just redraw the screen.

## Toggle completion

```js
function controlToggleTask(id) {
  model.toggleTask(id);
  renderAll(formView.getFormData().minutes);
}
```

The controller asks the model to flip the completion value. Then it redraws the app. It passes the form's current minutes so the dashboard preview is not lost if the user is typing while checking a task.

## Route a task-list action

```js
function controlTaskAction(action, id) {
  if (action === 'edit') controlEditTask(id);
  if (action === 'delete') controlDeleteTask(id);
  if (action === 'toggle') controlToggleTask(id);
}
```

The task-list view sends an action name and ID. This function routes the request to the matching controller function. For example, `('delete', 'task-123')` calls `controlDeleteTask('task-123')`.

## Start the app and connect events

```js
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
```

`init()` runs once when the module loads. It first restores saved tasks. It renders the form so there are inputs on the page. It then connects each view event to a controller function. The last `renderAll()` displays the restored tasks and correct dashboard values. The final `init();` actually calls the setup function.

This setup line is a good MVC example: the view does not decide which controller function to use; the controller passes the correct function into the view's handler-registration method.

# 8. `css/style.css`: how to read its blocks

CSS does not add or change tasks. It controls appearance. A CSS rule has a selector and declarations:

```css
.task-item--done {
  background: #f7f9f4;
}
```

`.task-item--done` is the selector: it chooses task rows with that class. `background` is the property, and `#f7f9f4` is its value. The list view adds this class when `task.completed` is true, so the CSS visually distinguishes completed tasks.

A responsive block looks like this:

```css
@media (max-width: 720px) {
  .work-area {
    grid-template-columns: 1fr;
  }
}
```

`@media` applies these rules only when the screen is at most 720 pixels wide. The work area changes to one column so the form and list fit on a narrow screen.

# 9. Explain one feature in your own words

Use this sequence while pointing at the files:

1. “This form view reads the task title and minutes.” Show `getFormData()` in `TaskFormView.js`.
2. “The view passes those values to the controller.” Show `addHandlerSubmit()` and the `formView.addHandlerSubmit(controlSubmitTask)` setup in `controller.js`.
3. “The controller checks the rules.” Show `validateTask()` and `controlSubmitTask()`.
4. “The model creates the task and saves the state.” Show `addTask()` and `saveState()` in `model.js`.
5. “Then the controller tells the list and dashboard to redraw.” Show `renderAll()` and the `generateMarkup()` methods in the list and dashboard views.

Pause at each step and explain what the actual variables contain. For example: the form gives the controller `title: 'Review biology'` and `minutes: '30'`; the model stores `minutes: 30` as a number. Use your own phrasing and make sure you can explain each function you claim as your contribution. Remember to disclose Copilot assistance in Section 11 of the report.
