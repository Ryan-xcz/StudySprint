# Study Sprint Video Presentation Script

**Target length:** About 7 minutes  
**Recording:** Screen record at 1080p. Set the editor font to at least 16 px. Show the running app during the demo and the relevant source files during each code walkthrough.

## Before Recording

- Replace `[Member 3 name]` with the third group member's name. The brief requires 3–4 members.
- Abdul's code section below uses `TaskListView.js` as a suggested small area. Keep it only if Abdul actually worked on or has been assigned this code and can explain it. Do not say he wrote code he did not write.
- Each person should replace wording that does not match their real work. The report's individual contributions and AI disclosure must match the video and GitHub commits.
- Clear or prepare a demo task, for example `Review biology`, 30 minutes. Confirm it persists after reload, then delete it after recording if you want to restore the empty app.

## Timed Script

### 0:00–0:30 | Introduction — Ryan

**Show:** App open in the browser.

**Say:**

> Hello, we are [group name]. Our members are Ryan Mangaliwan, Abdul Bantao, and [Member 3 name]. Our project is called Study Sprint. It helps students organize study tasks, estimate how many minutes they need, and keep track of unfinished work. We built it with plain JavaScript using Model-View-Controller, or MVC, and it saves tasks in the browser.

### 0:30–2:00 | Live Demo — Ryan

**Show and do:**

1. With the form empty, select **Add task** to show the validation message.
2. Enter `Review biology` and `30` minutes. Pause so the dashboard's live estimate is visible.
3. Select **Add task** and show the task row and updated dashboard.
4. Check the task's checkbox and show the remaining minutes change to zero.
5. Reload the page and show that the task and completed status are saved.
6. Select Delete to clean up the demo task.

**Say:**

> First, I submit the empty form. The app shows an error and does not add a task. Now I enter “Review biology” and 30 minutes. While I type, the dashboard previews the focus time. This is only a preview; it is not saved until I submit. After I select Add task, the task appears and the dashboard updates. When I mark it complete, its minutes are no longer counted as remaining. After reloading, the task and completed status are still here because the model saved them in localStorage. I will delete the demo task now.

### 2:00–3:00 | Trace One Action — Ryan

**Show:** `js/views/TaskFormView.js`, then `js/controller.js`, then `js/model.js`, then the views in the browser.

**Say:**

> I will trace adding “Review biology.” In `TaskFormView.js`, `addHandlerSubmit()` catches the form submission and `getFormData()` returns the title and minutes. The controller connected that handler to `controlSubmitTask()` in `controller.js`. That function calls `validateTask()`. If the values are valid, it calls `model.addTask()` in `model.js`. The model creates a task object, puts it in `state.tasks`, and saves it to localStorage. Then the controller calls `renderAll()`. The task list and dashboard views receive the updated data and redraw their parts of the page. That is the View to Controller to Model to View flow.

### 3:00–4:00 | Ryan's Code Walkthrough: Model and Controller

**Show:** `js/model.js` and `js/controller.js`.

**Say:**

> My walkthrough is the model and controller. In `model.js`, `state` holds the tasks. `loadState()` restores them when the app starts. `addTask()`, `updateTask()`, `toggleTask()`, and `deleteTask()` change the data and save it. The model does not build HTML or select page elements. In `controller.js`, `validateTask()` checks the task name and minutes. `controlSubmitTask()` chooses whether to add a new task or update an existing one. `getSummary()` calculates the dashboard numbers from the task data and the current form input. The controller is the only layer that connects model functions with view methods.

### 4:00–5:00 | Abdul's Code Walkthrough: Task List

**Show:** `js/views/TaskListView.js`. Point to `generateMarkup()`, `generateTaskMarkup()`, `addHandlerAction()`, and then `controlTaskAction()` in `js/controller.js`.

**Suggested wording, only if accurate for Abdul's actual contribution:**

> My part was the task-list area. `generateMarkup()` shows an empty message when there are no tasks. When tasks exist, it uses `map()` to build a row for each task. `generateTaskMarkup()` puts the task title, minutes, checkbox, and action buttons into one row. `addHandlerAction()` listens for Edit, Delete, and checkbox changes. It sends the action and task ID to the controller; it does not change the model itself. The controller routes the action to the edit, delete, or complete function. My contribution was [briefly name the actual code or change Abdul completed].

**If Abdul did not write this code:** Have him choose and explain a small piece he genuinely worked on, or first make a real, reviewed contribution and commit it. Do not present this suggested role as completed work if it was not.

### 5:00–6:00 | [Member 3 name]'s Walkthrough: Form and Dashboard

**Show:** `js/views/TaskFormView.js` and `js/views/DashboardView.js`.

**Suggested wording, to be adapted to the third member's real contribution:**

> I will explain the form and dashboard views. `TaskFormView.generateMarkup()` creates the form. `getFormData()` reads the title and minutes, and the handler methods report submit, typing, and cancel actions to the controller. The form view displays validation errors when the controller asks it to. `DashboardView.generateMarkup()` receives a summary object and displays the total task count, completed count, and remaining minutes. The dashboard displays those values; the controller calculates them. My contribution was [name the actual code or change this member completed].

### 6:00–6:30 | Challenge and Lesson — Ryan

**Show:** `init()` in `js/controller.js` and the app form in the browser.

**Say:**

> One issue we found during browser checking was that the form container could be empty if the form view was not rendered at startup. The controller's `init()` now calls `formView.render()` before users interact with it. We learned that creating a view object is not enough; its markup must be rendered, and browser testing can catch problems that a syntax check will miss. Keep this challenge in our report only if it matches our group's actual experience.

### 6:30–7:00 | Wrap-up — All Members

**Say, one short sentence each:**

> Ryan: The most useful thing I learned was how the controller connects the screen to the saved task data.
>
> Abdul: I learned [a real lesson from Abdul's contribution].
>
> [Member 3 name]: I would improve [one realistic improvement] next time.
>
> Together: Thank you for watching our Study Sprint presentation.

## Code-File Quick Reference

| File | What to point at while explaining |
| --- | --- |
| `index.html` | The three `data-view` containers and the module script that loads `controller.js` |
| `css/style.css` | A task row style and a mobile media query; CSS controls appearance, not task data |
| `js/model.js` | `state`, `loadState()`, `saveState()`, and the task-changing functions |
| `js/controller.js` | `init()`, `validateTask()`, `controlSubmitTask()`, `getSummary()`, and action handlers |
| `js/views/View.js` | `render()` and the required child `generateMarkup()` method |
| `js/views/TaskFormView.js` | Form markup, `getFormData()`, and submit/input/cancel handlers |
| `js/views/TaskListView.js` | Empty state, task-row markup, and action event handling |
| `js/views/DashboardView.js` | How the view displays the summary object supplied by the controller |

## Recording Check

- Keep the completed recording between 5 and 8 minutes; this script targets about 7 minutes including pauses for the demo.
- Make sure every member speaks and explains their own actual work.
- Include one validation error and a reload that demonstrates saved data.
- Keep the editor text readable, use no music over speech, and set the video link so the instructor can open it.
- Disclose GitHub Copilot use in Section 11 of the report. Do not claim AI-assisted code as personally written unless that accurately describes each member's contribution and the member can explain it.
