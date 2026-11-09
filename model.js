const STORAGE_KEY = 'study-sprint-state';

export const state = {
tasks: [],
};

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

function saveState() {
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addTask(taskData) {
const task = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: taskData.title,
    minutes: Number(taskData.minutes),
    completed: false,
};

state.tasks.push(task);  saveState();
  return task;
}

export function updateTask(id, taskData) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  task.title = taskData.title;
  task.minutes = Number(taskData.minutes);
  saveState();
}

export function toggleTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveState();
}

export function deleteTask(id) {
  state.tasks = state.tasks.filter((task) => task.id !== id);
  saveState();
}

export function getTask(id) {
  return state.tasks.find((task) => task.id === id);
}
