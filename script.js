// James Sunday - Portfolio
// This file controls: the mobile menu, background sound, footer year,
// greeting, skill bars, the academic planner and the contact form.


// ---------- Mobile menu ----------
const menuButton = document.querySelector(".nav-toggle");
const menu = document.getElementById("nav");

if (menuButton) {
  menuButton.addEventListener("click", function () {
    menu.classList.toggle("open");
  });
}


// ---------- Footer year ----------
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}


// ---------- Greeting on the homepage ----------
const greeting = document.getElementById("greeting");
if (greeting) {
  const hour = new Date().getHours();
  let timeOfDay = "evening";

  if (hour < 12) {
    timeOfDay = "morning";
  } else if (hour < 17) {
    timeOfDay = "afternoon";
  }

  greeting.textContent = "Good " + timeOfDay + ", welcome to my portfolio!";
}


// ---------- Background ambient sound ----------
const ambient = document.getElementById("ambient");
const soundButton = document.getElementById("soundButton");

function updateSoundButton() {
  if (ambient.paused) {
    soundButton.textContent = "Sound: Off";
    soundButton.classList.remove("on");
  } else {
    soundButton.textContent = "Sound: On";
    soundButton.classList.add("on");
  }
}

if (ambient && soundButton) {
  ambient.volume = 0.3; // keep it quiet

  // carry on from where the last page stopped
  ambient.addEventListener("loadedmetadata", function () {
    const savedTime = sessionStorage.getItem("ambientTime");
    if (savedTime) {
      ambient.currentTime = Number(savedTime);
    }
  });

  ambient.addEventListener("play", updateSoundButton);
  ambient.addEventListener("pause", updateSoundButton);

  // some browsers block autoplay until a click, so we catch the error
  if (sessionStorage.getItem("ambientOn") === "yes") {
    ambient.play().catch(function () {
      updateSoundButton();
    });
  }

  soundButton.addEventListener("click", function () {
    if (ambient.paused) {
      ambient.play();
      sessionStorage.setItem("ambientOn", "yes");
    } else {
      ambient.pause();
      sessionStorage.setItem("ambientOn", "no");
    }
  });

  window.addEventListener("beforeunload", function () {
    sessionStorage.setItem("ambientTime", ambient.currentTime);
  });
}


// ---------- Skill bars (About page) ----------
const bars = document.querySelectorAll(".bar div");

setTimeout(function () {
  for (let i = 0; i < bars.length; i++) {
    bars[i].style.width = bars[i].getAttribute("data-level") + "%";
  }
}, 200);


// ---------- Academic Planner ----------
// Each task looks like:
// { text: "Revise notes", due: "2026-12-01", priority: "high", completed: false }
let tasks = [];
let currentFilter = "all";

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

function saveTasks() {
  localStorage.setItem("adewoleTasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("adewoleTasks");
  if (saved) {
    try {
      tasks = JSON.parse(saved);
    } catch (error) {
      tasks = [];
    }
  }
}

function addTask(text, dueDate, priority) {
  tasks.push({ text: text, due: dueDate, priority: priority, completed: false });
  saveTasks();
  showTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  showTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  showTasks();
}

function clearCompleted() {
  const remaining = [];
  for (let i = 0; i < tasks.length; i++) {
    if (!tasks[i].completed) {
      remaining.push(tasks[i]);
    }
  }
  tasks = remaining;
  saveTasks();
  showTasks();
}

// draws the task list, counter and progress bar
function showTasks() {
  taskList.innerHTML = "";
  let doneCount = 0;
  let shownCount = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    if (task.completed) {
      doneCount++;
    }

    // skip tasks that do not match the chosen filter
    if (currentFilter === "active" && task.completed) {
      continue;
    }
    if (currentFilter === "completed" && !task.completed) {
      continue;
    }

    shownCount++;

    const li = document.createElement("li");
    li.className = "task " + task.priority;
    if (task.completed) {
      li.classList.add("done");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", function () {
      toggleTask(i);
    });

    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = task.text;

    if (task.due) {
      const small = document.createElement("small");
      small.textContent = "Due: " + task.due;
      textSpan.appendChild(small);
    }

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = task.priority + " priority";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
      deleteTask(i);
    });

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(badge);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
  }

  if (shownCount === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty";
    emptyItem.textContent = "No tasks here yet. Add one above!";
    taskList.appendChild(emptyItem);
  }

  taskCounter.textContent =
    tasks.length + " total | " + doneCount + " completed | " + (tasks.length - doneCount) + " remaining";

  let percent = 0;
  if (tasks.length > 0) {
    percent = Math.round((doneCount / tasks.length) * 100);
  }
  progressBar.style.width = percent + "%";
  progressText.textContent = percent + "% complete";
}

// only run the planner code on the planner page
if (taskForm) {
  loadTasks();
  showTasks();

  taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskInput = document.getElementById("taskInput");
    const taskDate = document.getElementById("taskDate");
    const taskPriority = document.getElementById("taskPriority");
    const taskError = document.getElementById("taskError");
    const text = taskInput.value.trim();

    if (text === "") {
      taskError.textContent = "Please type a task before adding.";
      return;
    }

    taskError.textContent = "";
    addTask(text, taskDate.value, taskPriority.value);
    taskInput.value = "";
    taskDate.value = "";
    taskInput.focus();
  });

  const filterButtons = document.querySelectorAll(".filters button[data-filter]");

  for (let i = 0; i < filterButtons.length; i++) {
    filterButtons[i].addEventListener("click", function () {
      currentFilter = filterButtons[i].getAttribute("data-filter");

      for (let j = 0; j < filterButtons.length; j++) {
        filterButtons[j].classList.remove("active");
      }
      filterButtons[i].classList.add("active");

      showTasks();
    });
  }

  document.getElementById("clearButton").addEventListener("click", clearCompleted);
}


// ---------- Contact form validation ----------
const contactForm = document.getElementById("contactForm");
const fieldIds = ["name", "email", "phone", "message"];

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  document.getElementById(fieldId + "Error").textContent = message;

  if (message === "") {
    field.classList.remove("invalid");
    field.classList.add("valid");
  } else {
    field.classList.remove("valid");
    field.classList.add("invalid");
  }
}

// checks one field, returns true if it is OK
function checkField(fieldId) {
  const value = document.getElementById(fieldId).value.trim();

  // 1. no field should be empty
  if (value === "") {
    showError(fieldId, "This field cannot be empty.");
    return false;
  }

  // 2. email must look like name@site.com
  if (fieldId === "email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      showError(fieldId, "Please enter a valid email address.");
      return false;
    }
  }

  // 3. phone number must be digits only
  if (fieldId === "phone") {
    const digitsOnly = /^[0-9]+$/;
    if (!digitsOnly.test(value)) {
      showError(fieldId, "Phone number must contain digits only.");
      return false;
    }
  }

  showError(fieldId, "");
  return true;
}

if (contactForm) {
  for (let i = 0; i < fieldIds.length; i++) {
    document.getElementById(fieldIds[i]).addEventListener("blur", function () {
      checkField(fieldIds[i]);
    });
  }

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let allGood = true;
    for (let i = 0; i < fieldIds.length; i++) {
      if (!checkField(fieldIds[i])) {
        allGood = false;
      }
    }

    const status = document.getElementById("formStatus");

    if (allGood) {
      const name = document.getElementById("name").value.trim();
      status.textContent = "Thank you, " + name + "! Your message has been sent.";
      status.className = "form-status ok";
      contactForm.reset();

      for (let i = 0; i < fieldIds.length; i++) {
        document.getElementById(fieldIds[i]).classList.remove("valid");
      }
    } else {
      status.className = "form-status";
    }
  });
}
