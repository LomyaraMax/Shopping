import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIM3ZzC-H4yqYAS6F0ONmamGEU2yJiTq0",
  authDomain: "shopping-6b162.firebaseapp.com",
  databaseURL: "https://shopping-6b162-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shopping-6b162",
  storageBucket: "shopping-6b162.appspot.com",
  messagingSenderId: "91005141152",
  appId: "1:91005141152:web:c5f951bf20f604ac2e89c5"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const listRef = ref(db, 'shoppingList');
const tasksRef = ref(db, 'taskList');

// DOM элементы
const itemInput = document.getElementById('itemInput');
const addBtn = document.getElementById('addBtn');
const itemList = document.getElementById('itemList');

const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

// Универсальная функция добавления
function addEntry(refPath, input) {
  const name = input.value.trim();
  if (!name) return;
  push(refPath, { name })
    .then(() => input.value = '')
    .catch(err => console.error('Ошибка при добавлении:', err));
}

addBtn.addEventListener('click', () => addEntry(listRef, itemInput));
addTaskBtn.addEventListener('click', () => addEntry(tasksRef, taskInput));

// Рендер списка с чекбоксами
function renderList(refPath, container) {
  onValue(refPath, snapshot => {
    const data = snapshot.val();
    container.innerHTML = '';
    if (!data) return;

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
            remove(ref(db, `${refPath._path.p.join('/')}/${id}`))
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

// Запуск рендера
renderList(listRef, itemList);
renderList(tasksRef, taskList);
