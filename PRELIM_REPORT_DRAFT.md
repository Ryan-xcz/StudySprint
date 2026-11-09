# Study Sprint

## Cover Page

**Project title:** Study Sprint  
**Group name:** [Group name]  
**Members:** [Full name — role; identify the group leader]  
**Course and section:** ITPFE 1 — Web Systems and Technologies 2, [Section]  
**Instructor:** [Instructor name]  
**Date submitted:** [Date]  
**Repository:** [GitHub repository link]  
**Live app:** [GitHub Pages link]  
**Video:** [Video link]

## 1. Project Overview

**Problem**  
Students often have several study tasks but no simple way to organize them or estimate the time needed. As a result, they may forget tasks, underestimate their workload, or lose track of what they have completed.

**Users**  
The intended users are students who want to plan study tasks and keep track of estimated study time. They can use the app when planning a study session and update the list as tasks are completed.

**Solution**  
Study Sprint is a browser-based study planner. Users can add a task with an estimated number of minutes, edit or delete tasks, and mark tasks complete. The dashboard recalculates the remaining focus time from unfinished tasks and valid minutes currently entered in the form. Tasks are saved in the browser's localStorage, so they remain after the page is reloaded on the same browser and device.

## 2. Features

Replace the owner placeholders with the member who actually implemented and can explain each feature.

| Feature | What the user can do | Owner |
| --- | --- | --- |
| Task management | Add, edit, complete, and delete study tasks with an estimated duration. | [Member] |
| Form validation | Submit a task name and a whole-minute estimate from 1 to 720; see an error if either value is invalid. | [Member] |
| Live dashboard and persistence | See the remaining focus time recalculate while typing or completing a task; retain task data after reload using localStorage. | [Member] |

## 3. Architecture

### 3.1 Folder Structure

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
README.md
CODE_EXPLANATION.md
CODE_BLOCKS_EXPLAINED.md
PRELIM_REPORT_DRAFT.md
```

### 3.2 State Object

The model's initial state is:

```js
export const state = {
  tasks: [],
};
```

`tasks` is the array that holds the app's task objects. A task in that array has this structure:

```js
{
  id: 'unique-id',
  title: 'Review biology',
  minutes: 30,
  completed: false,
}
```

- `id` uniquely identifies a task for edit, complete, and delete actions.
- `title` stores the task name entered by the user.
- `minutes` stores the estimated duration as a number.
- `completed` stores whether the task has been marked done.

### 3.3 Responsibilities

**Model**  
The model in `js/model.js` owns the exported `state` object and contains functions to load, add, update, complete, find, and delete tasks. After each change, it saves the state to localStorage. It does not access the DOM or import views.

**Views**  
The classes in `js/views/` extend the shared `View` class and generate the markup for the form, task list, and dashboard. They listen for user events and call handlers supplied by the controller. They do not import the model or change task state directly.

**Controller**  
The controller in `js/controller.js` imports the model and views, connects view events to controller functions, validates task input, and calculates dashboard values. It calls model functions when data changes and asks views to render updated data. It does not build the view markup itself.

## 4. Views

Replace each owner with the person who wrote and understands that view and its related controller behavior.

| View class | Parent element it renders into | Handler methods it exposes | Owner |
| --- | --- | --- | --- |
| `TaskFormView` | `[data-view="form"]` | `addHandlerSubmit`, `addHandlerInput`, `addHandlerCancel` | [Member] |
| `TaskListView` | `[data-view="tasks"]` | `addHandlerAction` | [Member] |
| `DashboardView` | `[data-view="dashboard"]` | No user-action handlers; it receives summary data and renders it | [Member] |

All three classes extend `View` from `js/views/View.js`.

## 5. Tracing One User Action: Adding a Task

Example input: task name `Review biology`, estimated minutes `30`.

1. In `TaskFormView.js`, `addHandlerSubmit()` catches the form submission, prevents the browser's normal page reload, and calls `getFormData()`. The returned values are `{ title: 'Review biology', minutes: '30' }`.
2. In `controller.js`, `init()` connected the form submit event to `controlSubmitTask()`, so that function receives the form data.
3. `controlSubmitTask()` calls `validateTask()`. If valid and not editing an existing task, it calls `model.addTask(taskData)` in `model.js`.
4. `addTask()` creates the task object, converts minutes from text to the number `30`, adds the object to `state.tasks`, and calls `saveState()` to store it in localStorage.
5. The controller resets the form and calls `renderAll()`.
6. `TaskListView.render()` receives the task array and displays the new task. `DashboardView.render()` receives values from `getSummary()` and displays one planned task and 30 remaining minutes.

## 6. Screenshots

Add 3–5 screenshots from the running app. Include one screenshot showing a validation error. Replace these placeholders with the group's actual screenshots and captions.

1. **Initial app screen:** [Insert screenshot] — The dashboard, empty task list, and task form before adding a task.
2. **Validation message:** [Insert screenshot] — The error shown after submitting an empty or invalid task.
3. **Task added:** [Insert screenshot] — A task appears in the list and the remaining minutes update.
4. **Task completed:** [Insert screenshot] — The completed task is checked and its minutes are no longer counted as remaining.

## 7. Testing

The Actual result column below reflects browser checks performed on the current app. The group should repeat these checks on its final deployed version and update the results if they differ.

| # | What we tested | Input | Expected result | Actual result | Pass? |
| --- | --- | --- | --- | --- | --- |
| 1 | Empty task name | Submit with both fields empty | Error appears; no task is added | Error message appeared; task list stayed empty | Yes |
| 2 | Invalid zero-minute estimate | Name `Read chapter`, minutes `0` | Validation error appears; task is not added | Whole-number/range error appeared; task list stayed empty | Yes |
| 3 | Add a valid task | `Review algebra`, 30 minutes | Task appears and remaining total becomes 30 | Task appeared; dashboard showed 30 minutes | Yes |
| 4 | Live minutes preview | Type 30 in the minutes field | Dashboard preview updates before submit | Dashboard showed 30-minute preview while typing | Yes |
| 5 | Edit a task | Change task name and minutes from `Review algebra`, 30 to `Review algebra and graphs`, 45 | Existing task updates; it is not duplicated | Title and minutes updated; total showed 45 | Yes |
| 6 | Complete a task | Check the task's checkbox | Completed count changes and its minutes stop counting as remaining | Remaining focus time changed to 0 |     |
| 7 | Data after reload | Reload after saving and completing a task | Task and completion state remain | Task title and checked state remained after reload | Yes |
| 8 | Delete a task | Select Delete | Task disappears; empty state appears when no tasks remain | Task disappeared and empty state appeared | Yes |

## 8. Challenges and Solutions

Use a challenge your group actually encountered. The first row is based on an implementation issue found while testing this starter; keep it only if it matches your group's experience.

| Challenge | How we solved it | What we learned |
| --- | --- | --- |
| The task form container was empty on the first browser check because the form view had not been rendered during startup. | The controller's `init()` function was updated to call `formView.render()` before registering the form handlers. | A view needs its initial markup before users can interact with its controls. Browser testing can reveal issues that syntax checks do not catch. |
| [Add a challenge your group actually faced] | [Describe the fix your group made] | [Describe what your group learned] |

## 9. Individual Contributions

Fill this table from the actual GitHub history and each member's real work. The shares must total 100%. Do not assign someone code they did not write or cannot explain.

| Member | Views and functions written | Number of commits | Share of work (%) |
| --- | --- | ---: | ---: |
| Ryan Mangaliwan | [Enter the view(s) and controller/model functions Ryan actually wrote] | [Ryan's GitHub commit count] | [Ryan's actual share]% |
| Abdul Bantao | [Enter the view(s) and controller/model functions Abdul actually wrote] | [Abdul's GitHub commit count] | [Abdul's actual share]% |
| [Member 3] | [Actual view(s) and controller/model functions] | [GitHub count] | [%] |
| **Total** |  |  | **100%** |

**Member signatures:**  
[Ryan Mangaliwan signature and date]  
[Abdul Bantao signature and date]  
[Member 3 signature and date]

## 10. Individual Reflections

Each member must write their own 100–150 words. Describe what you personally built, what MVC made easier or harder, and what you would do differently. Do not submit a shared or invented reflection in place of each member's own account.

**Ryan Mangaliwan**  
My contribution to Study Sprint so far has been helping organize the project, creating the GitHub repository, and working through the project documentation. I asked for explanations of the app so I could understand how the form, task list, dashboard, controller, and model fit together. I learned that MVC separates these jobs: views display information, the model stores task data, and the controller connects them. At first, it was difficult for me to understand why one user action can pass through several files before the screen changes. Reviewing the task flow helped make that clearer. Next, I want to take ownership of a specific view, make my own meaningful commits, and practice explaining that code myself. I should describe those contributions in the final report only after I have completed them.

**Abdul Bantao**  
My contribution to Study Sprint was smaller than Ryan's. Ryan handled most of the project setup and initial development, while I contributed by [describe the specific work you actually completed]. My smaller role meant I had fewer chances to follow the whole MVC process at first. I learned that a view displays information and reports user actions, the controller connects those actions to the model, and the model manages and saves task data. This project also showed me that group work needs clear responsibilities and regular communication. If I worked on the project again, I would volunteer for a specific feature earlier, make regular commits under my own account, and test and explain my part before the final demo. I should be able to identify the files and functions I worked on and describe my contribution honestly.

**[Member 3 name]**  
[The group brief says groups have 3–4 members, so the third member should add their own 100–150 word reflection here. If your instructor has approved a two-person group, confirm whether this section should be removed.]

These first two are starting drafts, not confirmed accounts of your work. Replace each bracketed part and revise any sentence that does not match what that member actually built, tested, and learned.

## 11. References and AI Use

**Course materials and references used**

- ITPFE 1 Prelim Project Brief and Written Documentation Template, supplied for this project.
- [Add any documentation, tutorials, or other course materials your group actually used.]
- **Abdul Bantao:** ITPFE 1 Prelim Project Brief and Written Documentation Template only. Confirm this is accurate and add any other materials he personally used.

**AI use disclosure**

GitHub Copilot was used during the development and documentation of Study Sprint by Ryan. It helped create the initial app structure and features, explain the MVC code, improve code readability, test app behavior in the browser, and prepare project documentation. The group should verify that each member's row accurately reflects that member's own AI use and be ready to explain all submitted code.

| Member | AI tool | What you asked it | Files or functions affected |
| --- | --- | --- | --- |
| Ryan Mangaliwan | GitHub Copilot | Help plan and build a plain-JavaScript MVC study planner from the course brief; explain the code and its MVC flow; make the code easier to understand; help test the app; draft project documentation and reflections | `index.html`, `css/style.css`, `js/model.js`, `js/controller.js` (including `getSummary`, `validateTask`, and task control functions), `js/views/View.js`, `js/views/TaskFormView.js`, `js/views/TaskListView.js`, `js/views/DashboardView.js`, `README.md`, `CODE_EXPLANATION.md`, `CODE_BLOCKS_EXPLAINED.md`, `PRELIM_REPORT_DRAFT.md` |
| Abdul Bantao | GitHub Copilot (limited use; confirm with Abdul) | Asked for a brief explanation of the task-list view and how its action reaches the controller | `js/views/TaskListView.js` and `controlTaskAction()` in `js/controller.js` (keep only if these match his actual AI use) |

## Before Exporting the PDF

- Replace every square-bracket placeholder with accurate group information.
- Confirm the problem, features, tests, and challenge match the final app.
- Add 3–5 real screenshots, including a validation error.
- Add the GitHub repository, working GitHub Pages, and video links.
- Confirm all members have at least five meaningful commits under their own accounts.
- Make sure contribution shares total 100% and reflections are each 100–150 words written by that member.
- Verify the AI disclosure against actual use.
- Export the finished report as `GroupName_PrelimProject.pdf`.