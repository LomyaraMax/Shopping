import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 1. Конфиг проекта Блокнота (Дела и Покупки)
const notebookConfig = {
  apiKey: "AIzaSyBIM3ZzC-H4yqYAS6F0ONmamGEU2yJiTq0",
  authDomain: "shopping-6b162.firebaseapp.com",
  databaseURL: "https://shopping-6b162-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shopping-6b162",
  storageBucket: "shopping-6b162.appspot.com",
  messagingSenderId: "91005141152",
  appId: "1:91005141152:web:c5f951bf20f604ac2e89c5"
};

// 2. Конфиг проекта Отчётов и Графика (Вторая база)
const scheduleConfig = {
  apiKey: "AIzaSyArdBRpk8EyzBJ_Uruk2rYGzlzdS-Eaj50",
  authDomain: "mid-np-470dc.firebaseapp.com",
  databaseURL: "https://mid-np-470dc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mid-np-470dc",
  storageBucket: "mid-np-470dc.firebasestorage.app",
  messagingSenderId: "1051368843938",
  appId: "1:1051368843938:web:bf019281005027580345fb"
};

// Инициализация двух параллельных подключений
const notebookApp = initializeApp(notebookConfig);
const scheduleApp = initializeApp(scheduleConfig, "scheduleApp");

const db = getDatabase(notebookApp);          // База для дел и покупок
const scheduleDb = getDatabase(scheduleApp);  // База для графика смен

const listRef = ref(db, 'shoppingList');
const tasksRef = ref(db, 'taskList');

// DOM Элементы
const itemInput = document.getElementById('itemInput');
const addBtn = document.getElementById('addBtn');
const itemList = document.getElementById('itemList');

const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

const tasksBadge = document.getElementById('tasksBadge');
const shoppingBadge = document.getElementById('shoppingBadge');

// Переключение вкладок
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');

    if (targetTab === 'tasks') {
      document.getElementById('tasksSection').classList.add('active');
    } else if (targetTab === 'shopping') {
      document.getElementById('shoppingSection').classList.add('active');
    } else if (targetTab === 'schedule') {
      document.getElementById('scheduleSection').classList.add('active');
    }
  });
});

// Добавление дел и покупок
function addEntry(refPath, input) {
  const name = input.value.trim();
  if (!name) return;
  push(refPath, { name })
    .then(() => input.value = '')
    .catch(err => console.error('Ошибка при добавлении:', err));
}

addBtn.addEventListener('click', () => addEntry(listRef, itemInput));
addTaskBtn.addEventListener('click', () => addEntry(tasksRef, taskInput));

itemInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addEntry(listRef, itemInput);
});
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addEntry(tasksRef, taskInput);
});

function renderList(refPath, container, type, badgeEl) {
  onValue(refPath, snapshot => {
    const data = snapshot.val();
    container.innerHTML = '';
    
    if (!data) {
      badgeEl.textContent = '0';
      return;
    }

    const keys = Object.keys(data);
    badgeEl.textContent = keys.length;

    for (let id in data) {
      const item = data[id];
      const li = document.createElement('li');

      const checkbox = document.createElement('input');
      checkbox.type = "checkbox";
      checkbox.classList.add("checkbox");

      const label = document.createElement('span');
      label.textContent = item.name;

      checkbox.onchange = () => {
        if (checkbox.checked) {
          li.classList.add('fade-out');
          setTimeout(() => {
            const itemRef = type === 'Покупка'
              ? ref(db, `shoppingList/${id}`)
              : ref(db, `taskList/${id}`);
            remove(itemRef)
              .catch(err => console.error('Ошибка при удалении:', err));
          }, 300);
        }
      };

      li.appendChild(checkbox);
      li.appendChild(label);
      container.appendChild(li);
    }
  });
}

renderList(listRef, itemList, 'Покупка', shoppingBadge);
renderList(tasksRef, taskList, 'Дело', tasksBadge);

// ==========================================
// ЛОГИКА КАЛЕНДАРЯ И ГРАФИКА
// ==========================================
let calCurrentDate = new Date();
let selectedCalDay = null;
let calScheduleData = {};
let activeScheduleUnsub = null;

const MONTH_NAMES = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function getCalMonthKey() {
  const yyyy = calCurrentDate.getFullYear();
  const mm = String(calCurrentDate.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

function initScheduleCalendar() {
  const monthKey = getCalMonthKey();
  document.getElementById('calMonthTitle').textContent = `${MONTH_NAMES[calCurrentDate.getMonth()]} ${calCurrentDate.getFullYear()}`;

  // Чтение сведений напрямую из узла schedules/{monthKey} второй базы
  const currentRef = ref(scheduleDb, `schedules/${monthKey}`);
  
  if (activeScheduleUnsub) {
    activeScheduleUnsub();
  }

  activeScheduleUnsub = onValue(currentRef, snap => {
    calScheduleData = snap.val() || {};
    renderScheduleGrid();
  });
}

function renderScheduleGrid() {
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';

  ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(d => {
    const h = document.createElement('div');
    h.className = 'cal-weekday';
    h.textContent = d;
    grid.appendChild(h);
  });

  const year = calCurrentDate.getFullYear();
  const month = calCurrentDate.getMonth();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDayIndex; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'cal-day';

    // Проверяем формат day_X (как в базе mid-np-470dc) или просто число
    const shift = calScheduleData[`day_${day}`] || calScheduleData[day] || calScheduleData[String(day)];

    if (shift === '98') cell.classList.add('st-98');
    if (shift === '163') cell.classList.add('st-163');
    if (shift === 'vh') cell.classList.add('st-vh');

    const numSpan = document.createElement('span');
    numSpan.className = 'cal-day-num';
    numSpan.textContent = day;

    const badgeSpan = document.createElement('span');
    badgeSpan.className = 'cal-day-badge';
    if (shift === '98') badgeSpan.textContent = '98';
    if (shift === '163') badgeSpan.textContent = '163';
    if (shift === 'vh') badgeSpan.textContent = 'ВХ';

    cell.appendChild(numSpan);
    cell.appendChild(badgeSpan);

    cell.addEventListener('click', () => openShiftModal(day));
    grid.appendChild(cell);
  }
}

document.getElementById('prevMonthBtn').addEventListener('click', () => {
  calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
  initScheduleCalendar();
});

document.getElementById('nextMonthBtn').addEventListener('click', () => {
  calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
  initScheduleCalendar();
});

// Управление выбором смены
const shiftModalOverlay = document.getElementById('shiftModalOverlay');

function openShiftModal(day) {
  selectedCalDay = day;
  document.getElementById('shiftModalTitle').textContent = `${day} ${MONTH_NAMES[calCurrentDate.getMonth()]}`;
  shiftModalOverlay.classList.add('active');
}

function closeShiftModal() {
  shiftModalOverlay.classList.remove('active');
}

shiftModalOverlay.addEventListener('click', (e) => {
  if (e.target === shiftModalOverlay) closeShiftModal();
});

function setShift(type) {
  if (!selectedCalDay) return;
  const monthKey = getCalMonthKey();
  
  // Запись по каноничному пути schedules/{monthKey}/day_{day}
  const dayRef = ref(scheduleDb, `schedules/${monthKey}/day_${selectedCalDay}`);

  if (type === null) {
    remove(dayRef);
  } else {
    set(dayRef, type);
  }
  closeShiftModal();
}

document.getElementById('btnShift98').addEventListener('click', () => setShift('98'));
document.getElementById('btnShift163').addEventListener('click', () => setShift('163'));
document.getElementById('btnShiftVh').addEventListener('click', () => setShift('vh'));
document.getElementById('btnShiftReset').addEventListener('click', () => setShift(null));

// Инициализация календаря
initScheduleCalendar();
