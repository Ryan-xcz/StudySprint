# Study Sprint

Study Sprint is a small study-task planner. Add a task and an estimated number of minutes, keep the list current, and see the unfinished focus time update as you type or mark work complete.

## Features

- Add, edit, complete, and delete study tasks.
- Show a view-rendered validation message for missing or invalid values.
- Recalculate unfinished focus time from saved tasks and the current form input.
- Save tasks in browser `localStorage` so they remain after a reload.
- Use three separate views so a three-person group can each own a visible component.

## Project structure

```text
index.html
css/
  style.css
js/
  model.js
  controller.js
  views/
    View.js
    DashboardView.js
    TaskFormView.js
    TaskListView.js
```

## MVC responsibilities

- **Model** (`js/model.js`): owns the exported state object, task changes, and localStorage load/save. It does not import views or use the DOM.
- **Views** (`js/views/`): extend `View`, render the data supplied by the controller, and report user actions through handler methods. They do not import the model.
- **Controller** (`js/controller.js`): subscribes to view handlers, validates form data, calls model functions, derives the dashboard values, and asks views to render updated data.

Example data flow for adding a task: `TaskFormView` submits form values to `controlSubmitTask`; the controller validates them and calls `model.addTask`; the model updates and saves `state`; the controller then renders the task list and dashboard views.

## Beginner code walkthrough

Think of the app as three jobs:

1. **The view notices an action.** For example, `TaskFormView` listens for the form's submit event, reads the input fields, and passes the values to a handler. The view does not decide how to save a task.
2. **The controller decides what to do.** `controlSubmitTask` checks the values. If they are valid, it asks the model to add or update the task. If not, it asks the form view to show an error.
3. **The model changes and saves data.** `addTask` puts a task in `state.tasks` and calls the private `saveState` function. The controller then asks the views to display the new state.

### Important terms in this project

- **State** is the current data in memory. Here it is the `state` object in `js/model.js`.
- **Handler** is a function that runs after an event, such as submitting the form or clicking Delete. Views receive handlers from the controller.
- **Render** means building the HTML for a view and putting it inside its parent element.
- **Derived value** is calculated from existing data instead of saved separately. The focus-time total is the minutes for tasks that are not complete, plus a valid number currently typed in the form.
- **`localStorage`** is browser storage. The model converts the state to JSON when saving and parses the JSON when loading it again.

### Follow the add-task code

1. `TaskFormView.addHandlerSubmit` catches the submit and calls `getFormData()`.
2. The controller's `controlSubmitTask` calls `validateTask()`.
3. When valid, the controller calls `model.addTask(taskData)`.
4. The model creates a task object, adds it to `state.tasks`, and saves it.
5. The controller calls `renderAll()`. `TaskListView` and `DashboardView` build updated markup from the current data.

When studying the code, start from this path and open each named function. Try changing one value, then explain which function receives it next and which layer owns the next step.

## Run locally

Because this app uses JavaScript modules, open it through a local web server rather than directly as a `file://` page. For example, with Python installed, run `python -m http.server 8000` in the project folder and visit `http://localhost:8000`.

## GitHub Pages

Push the project to the group's GitHub repository. In repository settings, enable GitHub Pages and deploy from the `main` branch root. The app has no build step or backend.

## Group handoff

Replace the member placeholders below with the group's actual names and assign one view to each person before dividing implementation work:

| Member | Suggested visible ownership |
| --- | --- |
| Member 1: [name] | `TaskFormView.js` and its controller handler |
| Member 2: [name] | `TaskListView.js` and its controller handler |
| Member 3: [name] | `DashboardView.js` and its controller summary |

Make meaningful commits from each member's own GitHub account. Check every assigned line together so each person can explain their contribution. Add the required report sections, screenshots, test results, video and PDF using the course template.

## AI use disclosure

This starter was created with GitHub Copilot assistance. Every member should review, understand, and adapt their assigned code, then disclose the tool and affected files/functions in Section 11 of the written report. Do not list AI-assisted code as understood until you can explain it.

## Suggested checks

1. Submit an empty task name and confirm an error appears without adding a task.
2. Enter zero, a decimal, or more than 720 minutes and confirm validation appears.
3. Add a valid task and confirm it appears in the list and total.
4. Type a different minute estimate and watch the focus-time value update.
5. Edit a task and verify its title and minutes change.
6. Complete a task and confirm its minutes no longer count as remaining.
7. Delete a task and reload the page to confirm saved tasks persist.