# Study Sprint Code Explanation

Use this guide to study how the app works. The goal is to understand the code well enough to explain it in your own words, not to memorize a script.

## The app in one sentence

Study Sprint lets a user create study tasks with estimated minutes, edit or remove them, mark them complete, and see how many unfinished study minutes remain. The browser saves the tasks in `localStorage`.

## The three MVC jobs

| Part | Its job in Study Sprint | It should not do |
| --- | --- | --- |
| Model | Store tasks, change tasks, and save/load them | Build HTML or query page elements |
| View | Build page markup and report user actions | Import the model or change task state directly |
| Controller | Receive view events, validate input, call model functions, and ask views to render | Build the views' HTML itself |

The controller is the coordinator. A view reports an event to it; the controller calls the model when data must change; then the controller asks views to display the latest data.

## Project files

### `index.html`

This file provides the page's starting structure: the header, introduction, dashboard area, task form area, and task list area. The attributes `data-view="dashboard"`, `data-view="form"`, and `data-view="tasks"` mark the elements where the JavaScript views render their content.

The line `<script type="module" src="js/controller.js"></script>` loads the controller as an ES module. The HTML does not use inline event attributes such as `onclick`; event handling is registered in the JavaScript views instead.

### `css/style.css`

This file controls appearance, not task behavior. It defines the colors, layout, spacing, typography, buttons, completed-task style, and responsive rules for smaller screens. For example, media queries change the layout when the screen is narrow.

### `js/model.js`

This is the Model layer. The exported `state` object is the in-memory data for the app:

```js
export const state = {
  tasks: [],
};
```

Each task object contains an `id`, `title`, `minutes`, and `completed` value.

- `STORAGE_KEY` is the name used to find this app's saved data in browser storage.
- `loadState()` reads saved JSON from `localStorage` when the app starts. `JSON.parse()` turns the saved text back into JavaScript data. If the stored value is missing or invalid, the task list stays empty.
- `saveState()` turns the current state into JSON with `JSON.stringify()` and stores it. It is not exported, so only model functions call it.
- `addTask(taskData)` creates a task, adds it to the array, and saves the state. `Date.now()` plus a random suffix makes an ID to distinguish tasks.
- `updateTask(id, taskData)` finds a task by ID, changes its title and minutes, and saves.
- `toggleTask(id)` changes `completed` from `false` to `true` or from `true` to `false`, then saves.
- `deleteTask(id)` creates a new array containing every task except the one with the matching ID, then saves.
- `getTask(id)` looks up one task so the controller can put it into the form for editing.

The model does not import a view and does not use DOM methods. `localStorage` is browser storage, not a server or database. Saved tasks are local to the browser on that device.

### `js/views/View.js`

This is the base class that the three views reuse. Its constructor remembers the parent HTML element. `render(data)` calls `generateMarkup(data)` and places the returned string inside that parent element.

The base `generateMarkup()` throws an error on purpose. Each child view must provide its own implementation, so a view cannot silently render nothing because it forgot to define the method.

### `js/views/TaskFormView.js`

This view owns the add/edit form and its form-related events.

- `generateMarkup()` returns the form HTML, including the task name, estimated minutes, error message area, and buttons. The button text depends on whether the view is in edit mode.
- `addHandlerSubmit(handler)` listens for the form's submit event, stops the browser's default page reload, reads the fields, and passes the data to the handler supplied by the controller.
- `addHandlerInput(handler)` reports typing in the task fields. The controller uses it to update the live minutes preview.
- `addHandlerCancel(handler)` reports a click on the Cancel button.
- `getFormData()` returns an object with the trimmed task name and minutes from the inputs.
- `setFormData(task)` puts an existing task into the fields when the user chooses Edit.
- `setEditing(isEditing)` updates the form button and heading to show whether the user is adding or editing.
- `reset()` clears the fields and returns to add mode.
- `showError(message)` and `clearError()` display or clear the validation message in the view.

The form uses `novalidate`, meaning the browser will not show its own automatic validation bubbles. The controller validates the values and the form view displays the error message.

### `js/views/TaskListView.js`

This view draws the task list and reports list actions.

- `generateMarkup(tasks)` returns an empty-state message when there are no tasks. Otherwise it uses `map()` to turn each task into markup and `join('')` to combine all the markup into one string.
- `generateTaskMarkup(task)` builds the markup for one task. It includes the checkbox, title, minutes, Edit button, and Delete button. Completed tasks receive a different CSS class and a checked checkbox.
- `addHandlerAction(handler)` listens for clicks on Edit/Delete and changes to a completion checkbox. It identifies which task was acted on using the task ID stored in `data-task-id`, then passes the action name and ID to the controller handler.
- `escapeHtml(value)` replaces special HTML characters in a task title with safe text versions before the title is inserted into markup.

The view does not call `model.deleteTask()` or change `state`. It only reports what happened; the controller decides what to do.

### `js/views/DashboardView.js`

This view displays the summary values the controller gives it: total tasks, completed tasks, and remaining focus minutes. It also shows a different hint while a valid minute value is being typed. It displays the summary; it does not calculate it.

### `js/controller.js`

This is the Controller layer. It imports the model and all three views, finds their parent elements in the HTML, and creates the view objects.

- `editingTaskId` is either the ID of the task currently being edited or `null` when the form is not editing a task.
- `getSummary(draftMinutes)` calculates dashboard values. It filters out completed tasks and the task currently being edited, adds the minutes of the other unfinished tasks, then includes the form's draft minutes if they are a positive whole number. It also counts all tasks and completed tasks.
- `renderAll(draftMinutes)` asks the list and dashboard views to draw again with current data.
- `validateTask(taskData)` checks that the title is not blank, is no longer than 80 characters, and that minutes are a whole number from 1 through 720. It returns an error message when a rule fails, or an empty string when the data is valid.
- `controlSubmitTask(taskData)` validates the submitted values. It shows an error through the form view if validation fails. Otherwise it calls `model.addTask()` or `model.updateTask()`, resets the form, and re-renders the page data.
- `controlPreview(draftData)` clears an old form error and updates the dashboard with a preview based on what is typed.
- `controlCancelEdit()` leaves edit mode, resets the form, and re-renders.
- `controlEditTask(id)` gets the task from the model, fills the form, updates the preview, and focuses the task name field.
- `controlDeleteTask(id)` tells the model to delete a task. If that task was being edited, it also cancels the edit; otherwise it re-renders.
- `controlToggleTask(id)` tells the model to toggle completion and re-renders the dashboard and list.
- `controlTaskAction(action, id)` routes an action reported by the list view to the matching controller function.
- `init()` loads saved state, renders the form, connects view events to controller functions, then renders the task list and dashboard. `init()` runs at the bottom of the file.

The important boundary is that the controller calls both model functions and view methods. The views do not import the model, and the model does not import the views.

## Follow one action: adding a task

1. The user submits the form in the browser.
2. `TaskFormView.addHandlerSubmit()` stops the normal browser form submission and calls `getFormData()`.
3. The view passes the form data to `controlSubmitTask()` in `controller.js`.
4. The controller calls `validateTask()`. If values are invalid, it calls `formView.showError()` and stops.
5. If values are valid, the controller calls `model.addTask(taskData)`.
6. The model creates a task object, puts it in `state.tasks`, and calls `saveState()`.
7. The controller calls `renderAll()`.
8. `TaskListView` and `DashboardView` receive updated data and build new markup on the page.

## Concrete example with actual values

Imagine the user enters:

- Task name: `Review biology`
- Estimated minutes: `30`

Here is what moves through the code:

### 1. The form view reads the fields

`TaskFormView.getFormData()` returns an object like this:

```js
{
  title: 'Review biology',
  minutes: '30'
}
```

The minutes are initially text because they came from an HTML input. The controller later checks the value and the model converts it to a number.

In `init()`, the controller connects the form's submit event to its function:

```js
formView.addHandlerSubmit(controlSubmitTask);
```

That means when the form is submitted, the view eventually calls `controlSubmitTask(formData)`. The word `handler` just means “the function to call when this event happens.”

### 2. The controller checks the values

`controlSubmitTask()` receives the object above and calls `validateTask(taskData)`.

- `taskData.title` is `Review biology`, so it is not blank.
- Its length is below 80 characters.
- `Number(taskData.minutes)` changes the text `'30'` into the number `30`.
- `30` is a whole number between 1 and 720, so validation succeeds.

When validation succeeds, `validateTask()` returns an empty string: `''`. An empty error message means there is no error. If the task name were blank, it would return a message such as `Give your task a name before adding it.` instead.

Because there is no error and `editingTaskId` is `null`, the controller calls:

```js
model.addTask(taskData);
```

`editingTaskId` is `null` because this is a new task, not an edit.

### 3. The model creates and saves the task

`addTask()` makes a new object similar to:

```js
{
  id: 'a-unique-generated-id',
  title: 'Review biology',
  minutes: 30,
  completed: false
}
```

The real ID is made from the current time and a random value, so each task can be identified. The model pushes the object into `state.tasks`, then `saveState()` writes the state into `localStorage` as JSON text.

After adding, the state is conceptually:

```js
state.tasks = [
  {
    id: 'a-unique-generated-id',
    title: 'Review biology',
    minutes: 30,
    completed: false
  }
];
```

### 4. The controller asks views to update

After adding, `controlSubmitTask()` resets the form and calls `renderAll()`.

- `taskListView.render(model.state.tasks)` gives the task array to the list view. It displays `Review biology` and `30 min focus`.
- `dashboardView.render(getSummary(draftMinutes))` gives the dashboard a summary object. With this one unfinished task and no draft input, the summary is approximately:

```js
{
  totalTasks: 1,
  completedTasks: 0,
  remainingMinutes: 30,
  preview: false
}
```

`TaskListView` and `DashboardView` turn those values into HTML. The controller does not write their HTML itself.

## What happens for the other buttons

| User action | View reports | Controller calls model | What changes on screen |
| --- | --- | --- | --- |
| Edit | `TaskListView` reports action `edit` and that task's ID | `getTask(id)` finds the task; the form view fills its fields | Form changes to edit mode. Saving calls `updateTask(id, taskData)` |
| Complete checkbox | `TaskListView` reports action `toggle` and the task ID | `toggleTask(id)` flips `completed` | Checkbox and completed style change; that task's minutes stop counting as remaining |
| Delete | `TaskListView` reports action `delete` and the task ID | `deleteTask(id)` removes it | List and dashboard render without that task |
| Type minutes | `TaskFormView` reports the current form data | No model change yet | Controller recalculates a preview; it does not save a new task until submit |

## Reading the summary calculation in plain language

The controller's `getSummary()` function has one main job: work out what numbers the dashboard should display.

1. `filter()` makes a temporary list of tasks that are unfinished and are not the task currently being edited.
2. `reduce()` adds the minutes of those tasks. For unfinished tasks of 25 and 30 minutes, `savedMinutes` becomes `55`.
3. The draft input is checked. If the user is typing `15`, it is a non-empty, positive whole number, so it can be previewed.
4. The function adds the valid draft minutes to saved minutes and returns an object for the dashboard view.

For example, if one saved unfinished task is 25 minutes and the user types 15 minutes for a new task, the dashboard preview is `40` minutes. Typing alone does not save that new task; only submitting the form does.

## A simple way to explain the main words

- **`taskData`**: the values collected from the form, such as a title and minutes.
- **`task`**: one complete saved task object, including its ID and completed status.
- **`id`**: the unique label used to find the right task when editing, completing, or deleting it.
- **`state.tasks`**: the current array of tasks kept by the model while the page is open.
- **`handler`**: a function supplied by the controller for a view to call when an event happens.
- **`render(data)`**: tell a view, “use this data to rebuild your part of the screen.”
- **`draftMinutes`**: the minutes currently typed into the form; they are only a preview until the user submits.

## JavaScript terms used here

- **ES module:** a JavaScript file that can share code using `export` and receive code using `import`.
- **Class:** a reusable description for creating objects. `TaskListView` is a class; `new TaskListView(...)` creates one view object.
- **Method:** a function that belongs to a class or object, such as `formView.reset()`.
- **Array:** an ordered collection. `state.tasks` is an array of task objects.
- **`filter()`:** makes an array containing only items that meet a condition.
- **`map()`:** changes each array item into a new result. This app maps task objects into HTML strings.
- **`reduce()`:** combines array items into one value. This app uses it to add task minutes.
- **Template literal:** text between backticks that can include values like `${task.title}`.
- **Event handler:** a function called when an event happens, such as submit, click, input, or change.
- **DOM:** the browser's in-memory representation of the HTML page. `document.querySelector()` finds an element in it.

## Short presentation guide

Use your own words and point to the code while explaining it:

> “Our app uses MVC. The model stores the tasks and saves them in localStorage. The views create the form, task list, and dashboard, and they report user actions. The controller connects those parts. For adding a task, the form view reads the fields and calls the controller handler. The controller validates the values and asks the model to add and save the task. Then the controller asks the list and dashboard views to render the updated state.”

Be ready to show the actual functions named above, explain the part you personally worked on, and describe one decision or bug you learned from. Do not claim code as your own work unless you understand it and can explain it. Disclose Copilot assistance in Section 11 of the project report, as required by the course brief.
