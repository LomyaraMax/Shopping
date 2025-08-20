import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIM3ZzC-H4yqYAS6F0ONmamGEU2yJiTq0",
  authDomain: "shopping-6b162.firebaseapp.com",
  databaseURL: "https://shopping-6b162-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shopping-6b162",
  storageBucket: "shopping-6b162.firebasestorage.app",
  messagingSenderId: "91005141152",
  appId: "1:91005141152:web:c5f951bf20f604ac2e89c5"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const listRef = ref(db, 'shoppingList');
const historyRef = ref(db, 'history');

// Элементы DOM
const itemInput = document.getElementById('itemInput');
const addBtn = document.getElementById('addBtn');
const itemList = document.getElementById('itemList');
const historyList = document.getElementById('historyList');
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');
const closeHistory = document.getElementById('closeHistory');

// Добавление товара
function addItem() {
  const name = itemInput.value.trim();
  if (!name) return;
  push(listRef, { name, done: false })
    .then(() => itemInput.value = '')
    .catch(err => console.error('Ошибка при добавлении:', err));
}
addBtn.addEventListener('click', addItem);

// Отображение списка
onValue(listRef, snapshot => {
  const data = snapshot.val();
  itemList.innerHTML = '';
  if (!data) return;

  for (let id in data) {
    const item = data[id];
    const li = document.createElement('li');

    const label = document.createElement('span');
    label.textContent = item.name;
    if (item.done) label.classList.add('done');
    label.style.cursor = 'pointer';
    label.title = "Нажмите, чтобы отметить как куплено";
    label.onclick = () => {
      update(ref(db, 'shoppingList/' + id), { done: !item.done })
        .catch(err => console.error('Ошибка при обновлении:', err));
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Удалить';
    delBtn.classList.add('delete-btn');
    delBtn.onclick = () => {
      const deleteDate = new Date().toISOString();
      push(historyRef, { name: item.name, date: deleteDate })
        .then(() => remove(ref(db, 'shoppingList/' + id)))
        .catch(err => console.error('Ошибка при удалении:', err));
    };

    li.appendChild(label);
    li.appendChild(delBtn);
    itemList.appendChild(li);
  }
});

// История удалённых
onValue(historyRef, snapshot => {
  const data = snapshot.val();
  historyList.innerHTML = '';
  if (!data) {
    historyList.innerHTML = '<li>История пуста</li>';
    return;
  }

  const grouped = {};
  for (let id in data) {
    const item = data[id];
    const dateObj = new Date(item.date);
    const dayKey = dateObj.toLocaleDateString();
    if (!grouped[dayKey]) grouped[dayKey] = [];
    grouped[dayKey].push({ ...item, id });
  }

  const sortedDays = Object.keys(grouped).sort((a,b) => new Date(b) - new Date(a));

  sortedDays.forEach(day => {
    const dayHeader = document.createElement('h4');
    dayHeader.textContent = day;
    historyList.appendChild(dayHeader);

    grouped[day].forEach(item => {
      const dateObj = new Date(item.date);
      const timeString = dateObj.toLocaleTimeString();
      const li = document.createElement('li');
      li.textContent = `${item.name} (${timeString})`;
      historyList.appendChild(li);
    });
  });
});

// Открыть/закрыть историю
historyBtn.onclick = () => {
  historyModal.classList.remove('hidden');
  historyBtn.style.display = 'none';
};

closeHistory.onclick = () => {
  historyModal.classList.add('hidden');
  historyBtn.style.display = 'block';
};
