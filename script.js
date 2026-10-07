import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  set
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";


// =====================================================
// FIREBASE
// =====================================================

const notebookConfig = {
  apiKey: "AIzaSyBIM3ZzC-H4yqAS6F0ONmamGEU2yJiTq0",
  authDomain: "shopping-6b162.firebaseapp.com",
  databaseURL:
    "https://shopping-6b162-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shopping-6b162",
  storageBucket: "shopping-6b162.appspot.com",
  messagingSenderId: "91005141152",
  appId: "1:91005141152:web:c5f951bf20f604ac2e89c5"
};

const scheduleConfig = {
  apiKey: "AIzaSyArdBRpk8EyzBJ_Uruk2rYGzlzdS-Eaj50",
  authDomain: "mid-np-470dc.firebaseapp.com",
  databaseURL:
    "https://mid-np-470dc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mid-np-470dc",
  storageBucket: "mid-np-470dc.firebasestorage.app",
  messagingSenderId: "1051368843938",
  appId: "1:1051368843938:web:bf019281005027580345fb"
};

const notebookApp =
  initializeApp(notebookConfig);

const scheduleApp =
  initializeApp(
    scheduleConfig,
    "scheduleApp"
  );

const db =
  getDatabase(notebookApp);

const scheduleDb =
  getDatabase(scheduleApp);


// =====================================================
// REFERENCES
// =====================================================

const listRef =
  ref(db, "shoppingList");

const tasksRef =
  ref(db, "taskList");

const taskGroupsRef =
  ref(db, "taskGroups");


// =====================================================
// DOM — ПОКУПКИ
// =====================================================

const itemInput =
  document.getElementById("itemInput");

const addBtn =
  document.getElementById("addBtn");

const itemList =
  document.getElementById("itemList");


// =====================================================
// DOM — ДЕЛА
// =====================================================

const taskInput =
  document.getElementById("taskInput");

const addTaskBtn =
  document.getElementById("addTaskBtn");

const taskList =
  document.getElementById("taskList");

const tasksBadge =
  document.getElementById("tasksBadge");


// =====================================================
// DOM — БЛОКИ ДЕЛ
// =====================================================

const taskGroupsView =
  document.getElementById("taskGroupsView");

const taskBlockView =
  document.getElementById("taskBlockView");

const addTaskGroupBtn =
  document.getElementById("addTaskGroupBtn");

const backToGroupsBtn =
  document.getElementById("backToGroupsBtn");

const currentTaskGroupTitle =
  document.getElementById(
    "currentTaskGroupTitle"
  );

const deleteCurrentGroupBtn =
  document.getElementById(
    "deleteCurrentGroupBtn"
  );


// =====================================================
// DOM — МОДАЛКА СОЗДАНИЯ БЛОКА
// =====================================================

const groupModalOverlay =
  document.getElementById(
    "groupModalOverlay"
  );

const groupNameInput =
  document.getElementById(
    "groupNameInput"
  );

const saveGroupBtn =
  document.getElementById(
    "saveGroupBtn"
  );

const cancelGroupBtn =
  document.getElementById(
    "cancelGroupBtn"
  );


// =====================================================
// СОСТОЯНИЕ
// =====================================================

let taskGroupsData = {};

let currentTaskGroupId = null;


// =====================================================
// ВКЛАДКИ
// =====================================================

const tabBtns =
  document.querySelectorAll(".tab-btn");

const tabContents =
  document.querySelectorAll(".tab-content");

tabBtns.forEach(btn => {

  btn.addEventListener(
    "click",
    () => {

      const targetTab =
        btn.dataset.tab;

      tabBtns.forEach(b => {
        b.classList.remove("active");
      });

      tabContents.forEach(c => {
        c.classList.remove("active");
      });

      btn.classList.add("active");

      if (targetTab === "tasks") {

        document
          .getElementById("tasksSection")
          .classList.add("active");

      }
      else if (targetTab === "shopping") {

        document
          .getElementById("shoppingSection")
          .classList.add("active");

      }
      else if (targetTab === "schedule") {

        document
          .getElementById("scheduleSection")
          .classList.add("active");

      }

    }
  );

});


// =====================================================
// ПОКУПКИ — ДОБАВЛЕНИЕ
// =====================================================

function addEntry(
  firebaseRef,
  input
) {

  const name =
    input.value.trim();

  if (!name) {
    return;
  }

  push(
    firebaseRef,
    {
      name: name
    }
  )
    .then(() => {

      input.value = "";

    })
    .catch(err => {

      console.error(
        "Ошибка при добавлении:",
        err
      );

      alert(
        "Не удалось добавить. Проверь интернет."
      );

    });

}


addBtn.addEventListener(
  "click",
  () => {

    addEntry(
      listRef,
      itemInput
    );

  }
);


itemInput.addEventListener(
  "keypress",
  e => {

    if (e.key === "Enter") {

      addEntry(
        listRef,
        itemInput
      );

    }

  }
);


// =====================================================
// ПОКУПКИ — ОТОБРАЖЕНИЕ
// =====================================================

function renderShoppingList() {

  onValue(
    listRef,
    snapshot => {

      const data =
        snapshot.val();

      itemList.innerHTML = "";

      if (!data) {

        shoppingBadge.textContent = "0";

        return;

      }

      const keys =
        Object.keys(data);

      shoppingBadge.textContent =
        keys.length;

      for (const id in data) {

        const item =
          data[id];

        const li =
          document.createElement("li");

        const checkbox =
          document.createElement("input");

        checkbox.type =
          "checkbox";

        checkbox.classList.add(
          "checkbox"
        );

        const label =
          document.createElement("span");

        label.textContent =
          item.name;

        checkbox.onchange =
          () => {

            if (!checkbox.checked) {
              return;
            }

            li.classList.add(
              "fade-out"
            );

            setTimeout(() => {

              const itemRef =
                ref(
                  db,
                  `shoppingList/${id}`
                );

              remove(itemRef)
                .catch(err => {

                  console.error(
                    "Ошибка удаления покупки:",
                    err
                  );

                });

            }, 300);

          };

        li.appendChild(
          checkbox
        );

        li.appendChild(
          label
        );

        itemList.appendChild(
          li
        );

      }

    }
  );

}

renderShoppingList();


// =====================================================
// БЛОКИ ДЕЛ — FIREBASE
// =====================================================

onValue(
  taskGroupsRef,
  snapshot => {

    taskGroupsData =
      snapshot.val() || {};

    renderTaskGroups();

    updateTasksBadge();

  }
);


// =====================================================
// ОТОБРАЖЕНИЕ БЛОКОВ
// =====================================================

function renderTaskGroups() {

  taskGroupsView.innerHTML = "";


  // -------------------------------
  // ОБЩИЕ ДЕЛА
  // -------------------------------

  const defaultCard =
    createTaskGroupCard(
      "default",
      "Общие дела",
      null,
      true
    );

  taskGroupsView.appendChild(
    defaultCard
  );


  // -------------------------------
  // СОЗДАННЫЕ БЛОКИ
  // -------------------------------

  Object.keys(taskGroupsData)
    .forEach(groupId => {

      const group =
        taskGroupsData[groupId];

      if (!group) {
        return;
      }

      const items =
        group.items || {};

      const count =
        Object.keys(items).length;

      const card =
        createTaskGroupCard(
          groupId,
          group.name || "Без названия",
          count,
          false
        );

      taskGroupsView.appendChild(
        card
      );

    });

}


// =====================================================
// КАРТОЧКА БЛОКА
// =====================================================

function createTaskGroupCard(
  groupId,
  groupName,
  count,
  isDefault
) {

  const card =
    document.createElement("div");

  card.className =
    "task-group-card";


  // -------------------------------
  // ИНФОРМАЦИЯ
  // -------------------------------

  const info =
    document.createElement("div");

  info.className =
    "task-group-info";


  const name =
    document.createElement("div");

  name.className =
    "task-group-name";

  name.textContent =
    groupName;


  const countText =
    document.createElement("div");

  countText.className =
    "task-group-count";


  if (isDefault) {

    countText.textContent =
      "Общие дела";

  }
  else {

    countText.textContent =
      count === 1
        ? "1 дело"
        : `${count} дел`;

  }


  info.appendChild(name);
  info.appendChild(countText);


  // -------------------------------
  // ПРАВАЯ ЧАСТЬ
  // -------------------------------

  const actions =
    document.createElement("div");

  actions.className =
    "task-group-actions";


  // -------------------------------
  // СТРЕЛКА
  // -------------------------------

  const arrow =
    document.createElement("div");

  arrow.className =
    "task-group-arrow";

  arrow.textContent =
    "›";

  actions.appendChild(
    arrow
  );


  // -------------------------------
  // КНОПКА УДАЛЕНИЯ
  // -------------------------------

  if (!isDefault) {

    const deleteBtn =
      document.createElement("button");

    deleteBtn.type =
      "button";

    deleteBtn.className =
      "task-group-delete-btn";

    deleteBtn.textContent =
      "🗑️";

    deleteBtn.title =
      "Удалить блок";

    deleteBtn.setAttribute(
      "aria-label",
      "Удалить блок"
    );


    deleteBtn.addEventListener(
      "click",
      async e => {

        // Очень важно:
        // не открываем блок при нажатии корзины
        e.preventDefault();
        e.stopPropagation();

        const confirmed =
          confirm(
            `Удалить блок «${groupName}» и все его дела?`
          );

        if (!confirmed) {
          return;
        }

        await deleteTaskGroup(
          groupId
        );

      }
    );


    actions.appendChild(
      deleteBtn
    );

  }


  card.appendChild(info);
  card.appendChild(actions);


  // -------------------------------
  // ОТКРЫТИЕ БЛОКА
  // -------------------------------

  card.addEventListener(
    "click",
    () => {

      openTaskGroup(
        groupId,
        groupName,
        isDefault
      );

    }
  );


  return card;

}


// =====================================================
// ОТКРЫТЬ БЛОК
// =====================================================

function openTaskGroup(
  groupId,
  groupName,
  isDefault
) {

  currentTaskGroupId =
    groupId;

  currentTaskGroupTitle.textContent =
    groupName;


  // -------------------------------
  // КНОПКА УДАЛЕНИЯ ВНУТРИ БЛОКА
  // -------------------------------

  if (isDefault) {

    deleteCurrentGroupBtn.classList.add(
      "hidden"
    );

  }
  else {

    deleteCurrentGroupBtn.classList.remove(
      "hidden"
    );

  }


  taskGroupsView.classList.add(
    "hidden"
  );

  taskBlockView.classList.remove(
    "hidden"
  );


  taskList.innerHTML = "";


  if (isDefault) {

    renderDefaultTasks();

  }
  else {

    renderGroupTasks(
      groupId
    );

  }


  setTimeout(() => {

    taskInput.focus();

  }, 100);

}


// =====================================================
// НАЗАД К БЛОКАМ
// =====================================================

backToGroupsBtn.addEventListener(
  "click",
  async () => {

    await leaveCurrentTaskGroup();

  }
);


// =====================================================
// ВЫЙТИ ИЗ БЛОКА
// =====================================================

async function leaveCurrentTaskGroup() {

  const groupId =
    currentTaskGroupId;


  // Общие дела
  if (
    !groupId ||
    groupId === "default"
  ) {

    showTaskGroups();

    return;

  }


  const group =
    taskGroupsData[groupId];


  if (!group) {

    showTaskGroups();

    return;

  }


  try {

    // Получаем актуальное содержимое блока
    const itemsRef =
      ref(
        db,
        `taskGroups/${groupId}/items`
      );


    const snapshot =
      await new Promise(
        resolve => {

          onValue(
            itemsRef,
            resolve,
            {
              onlyOnce: true
            }
          );

        }
      );


    const items =
      snapshot.val();


    const hasItems =
      items &&
      Object.keys(items).length > 0;


    // Если блок пустой —
    // удаляем его полностью
    if (!hasItems) {

      await deleteTaskGroup(
        groupId,
        false
      );

      return;

    }


    showTaskGroups();

  }
  catch (error) {

    console.error(
      "Ошибка при выходе из блока:",
      error
    );

    showTaskGroups();

  }

}


// =====================================================
// ПОКАЗАТЬ СПИСОК БЛОКОВ
// =====================================================

function showTaskGroups() {

  currentTaskGroupId =
    null;

  taskBlockView.classList.add(
    "hidden"
  );

  taskGroupsView.classList.remove(
    "hidden"
  );

  taskInput.value = "";

  deleteCurrentGroupBtn.classList.add(
    "hidden"
  );

}


// =====================================================
// УДАЛЕНИЕ БЛОКА
// =====================================================

async function deleteTaskGroup(
  groupId,
  returnToGroups = true
) {

  if (!groupId) {
    return false;
  }


  if (groupId === "default") {
    return false;
  }


  const groupRef =
    ref(
      db,
      `taskGroups/${groupId}`
    );


  try {

    console.log(
      "Удаляем блок:",
      groupId
    );


    await remove(
      groupRef
    );


    console.log(
      "Блок успешно удалён:",
      groupId
    );


    // Если удалили открытый блок
    if (
      currentTaskGroupId === groupId
    ) {

      currentTaskGroupId =
        null;

      taskBlockView.classList.add(
        "hidden"
      );

      taskGroupsView.classList.remove(
        "hidden"
      );

      taskInput.value = "";

      deleteCurrentGroupBtn.classList.add(
        "hidden"
      );

    }
    else if (returnToGroups) {

      // Просто обновляем интерфейс
      renderTaskGroups();

    }


    return true;

  }
  catch (error) {

    console.error(
      "ОШИБКА УДАЛЕНИЯ БЛОКА:",
      error
    );


    alert(
      "Не удалось удалить блок.\n\n" +
      "Проверь правила Firebase Realtime Database."
    );


    return false;

  }

}


// =====================================================
// УДАЛЕНИЕ ОТКРЫТОГО БЛОКА
// =====================================================

deleteCurrentGroupBtn.addEventListener(
  "click",
  async e => {

    e.preventDefault();
    e.stopPropagation();


    const groupId =
      currentTaskGroupId;


    if (
      !groupId ||
      groupId === "default"
    ) {

      return;

    }


    const group =
      taskGroupsData[groupId];


    const groupName =
      group?.name ||
      "Без названия";


    const confirmed =
      confirm(
        `Удалить блок «${groupName}» и все его дела?`
      );


    if (!confirmed) {
      return;
    }


    await deleteTaskGroup(
      groupId
    );

  }
);


// =====================================================
// ОБЩИЕ ДЕЛА
// =====================================================

function renderDefaultTasks() {

  onValue(
    tasksRef,
    snapshot => {

      if (
        currentTaskGroupId !== "default"
      ) {

        return;

      }


      const data =
        snapshot.val();


      taskList.innerHTML = "";


      if (!data) {

        updateTasksBadge();

        return;

      }


      for (const id in data) {

        createTaskElement(
          id,
          data[id],
          "default"
        );

      }


      updateTasksBadge();

    }
  );

}


// =====================================================
// ДЕЛА ВНУТРИ БЛОКА
// =====================================================

function renderGroupTasks(
  groupId
) {

  const groupRef =
    ref(
      db,
      `taskGroups/${groupId}/items`
    );


  onValue(
    groupRef,
    snapshot => {

      if (
        currentTaskGroupId !== groupId
      ) {

        return;

      }


      const data =
        snapshot.val();


      taskList.innerHTML = "";


      if (!data) {

        updateTasksBadge();

        return;

      }


      for (const id in data) {

        createTaskElement(
          id,
          data[id],
          groupId
        );

      }


      updateTasksBadge();

    }
  );

}


// =====================================================
// ЭЛЕМЕНТ ДЕЛА
// =====================================================

function createTaskElement(
  id,
  item,
  groupId
) {

  const li =
    document.createElement("li");


  const checkbox =
    document.createElement("input");

  checkbox.type =
    "checkbox";

  checkbox.classList.add(
    "checkbox"
  );


  const label =
    document.createElement("span");

  label.textContent =
    item.name;


  checkbox.onchange =
    () => {

      if (!checkbox.checked) {
        return;
      }


      li.classList.add(
        "fade-out"
      );


      setTimeout(() => {

        let itemRef;


        if (
          groupId === "default"
        ) {

          itemRef =
            ref(
              db,
              `taskList/${id}`
            );

        }
        else {

          itemRef =
            ref(
              db,
              `taskGroups/${groupId}/items/${id}`
            );

        }


        remove(itemRef)
          .catch(err => {

            console.error(
              "Ошибка при удалении дела:",
              err
            );

          });

      }, 300);

    };


  li.appendChild(
    checkbox
  );

  li.appendChild(
    label
  );


  taskList.appendChild(
    li
  );

}


// =====================================================
// ДОБАВИТЬ ДЕЛО
// =====================================================

addTaskBtn.addEventListener(
  "click",
  addCurrentTask
);


taskInput.addEventListener(
  "keypress",
  e => {

    if (e.key === "Enter") {

      addCurrentTask();

    }

  }
);


function addCurrentTask() {

  const name =
    taskInput.value.trim();


  if (!name) {
    return;
  }


  // Общие дела
  if (
    currentTaskGroupId === "default"
  ) {

    push(
      tasksRef,
      {
        name: name
      }
    )
      .then(() => {

        taskInput.value = "";

      })
      .catch(err => {

        console.error(
          "Ошибка добавления дела:",
          err
        );

      });


    return;

  }


  // Если блок не открыт
  if (!currentTaskGroupId) {
    return;
  }


  const groupTasksRef =
    ref(
      db,
      `taskGroups/${currentTaskGroupId}/items`
    );


  push(
    groupTasksRef,
    {
      name: name
    }
  )
    .then(() => {

      taskInput.value = "";

    })
    .catch(err => {

      console.error(
        "Ошибка добавления дела:",
        err
      );

    });

}


// =====================================================
// СОЗДАНИЕ БЛОКА
// =====================================================

addTaskGroupBtn.addEventListener(
  "click",
  openGroupModal
);


function openGroupModal() {

  groupNameInput.value = "";

  groupModalOverlay.classList.add(
    "active"
  );


  setTimeout(() => {

    groupNameInput.focus();

  }, 100);

}


function closeGroupModal() {

  groupModalOverlay.classList.remove(
    "active"
  );

}


cancelGroupBtn.addEventListener(
  "click",
  closeGroupModal
);


groupModalOverlay.addEventListener(
  "click",
  e => {

    if (
      e.target === groupModalOverlay
    ) {

      closeGroupModal();

    }

  }
);


saveGroupBtn.addEventListener(
  "click",
  createTaskGroup
);


groupNameInput.addEventListener(
  "keypress",
  e => {

    if (e.key === "Enter") {

      createTaskGroup();

    }

  }
);


function createTaskGroup() {

  const name =
    groupNameInput.value.trim();


  if (!name) {
    return;
  }


  const newGroupRef =
    push(taskGroupsRef);


  set(
    newGroupRef,
    {
      name: name
    }
  )
    .then(() => {

      closeGroupModal();

    })
    .catch(err => {

      console.error(
        "Ошибка создания блока:",
        err
      );


      alert(
        "Не удалось создать блок."
      );

    });

}


// =====================================================
// СЧЁТЧИК ДЕЛ
// =====================================================

function updateTasksBadge() {

  let total =
    0;


  onValue(
    tasksRef,
    snapshot => {

      const data =
        snapshot.val();


      if (data) {

        total +=
          Object.keys(data).length;

      }


      let groupsTotal =
        0;


      Object.keys(taskGroupsData)
        .forEach(groupId => {

          const group =
            taskGroupsData[groupId];


          if (!group) {
            return;
          }


          const items =
            group.items || {};


          groupsTotal +=
            Object.keys(items).length;

        });


      tasksBadge.textContent =
        total + groupsTotal;

    },
    {
      onlyOnce: true
    }
  );

}


// =====================================================
// КАЛЕНДАРЬ
// =====================================================

let calCurrentDate =
  new Date();

let selectedCalDay =
  null;

let calScheduleData =
  {};

let activeScheduleUnsub =
  null;


const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь"
];


function getCalMonthKey() {

  const yyyy =
    calCurrentDate.getFullYear();


  const mm =
    String(
      calCurrentDate.getMonth() + 1
    ).padStart(2, "0");


  return `${yyyy}-${mm}`;

}


function initScheduleCalendar() {

  const monthKey =
    getCalMonthKey();


  document
    .getElementById("calMonthTitle")
    .textContent =
      `${MONTH_NAMES[calCurrentDate.getMonth()]} ${calCurrentDate.getFullYear()}`;


  const currentRef =
    ref(
      scheduleDb,
      `schedules/${monthKey}`
    );


  if (activeScheduleUnsub) {

    activeScheduleUnsub();

  }


  activeScheduleUnsub =
    onValue(
      currentRef,
      snap => {

        calScheduleData =
          snap.val() || {};

        renderScheduleGrid();

      }
    );

}


function renderScheduleGrid() {

  const grid =
    document.getElementById(
      "calGrid"
    );


  grid.innerHTML = "";


  [
    "Пн",
    "Вт",
    "Ср",
    "Чт",
    "Пт",
    "Сб",
    "Вс"
  ]
    .forEach(d => {

      const h =
        document.createElement(
          "div"
        );

      h.className =
        "cal-weekday";

      h.textContent =
        d;

      grid.appendChild(
        h
      );

    });


  const year =
    calCurrentDate.getFullYear();

  const month =
    calCurrentDate.getMonth();


  const firstDayIndex =
    (
      new Date(
        year,
        month,
        1
      ).getDay() + 6
    ) % 7;


  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  for (
    let i = 0;
    i < firstDayIndex;
    i++
  ) {

    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "cal-day empty";

    grid.appendChild(
      empty
    );

  }


  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const cell =
      document.createElement(
        "div"
      );

    cell.className =
      "cal-day";


    const shift =
      calScheduleData[`day_${day}`] ||
      calScheduleData[day] ||
      calScheduleData[String(day)];


    if (shift === "98") {

      cell.classList.add(
        "st-98"
      );

    }


    if (shift === "163") {

      cell.classList.add(
        "st-163"
      );

    }


    if (shift === "vh") {

      cell.classList.add(
        "st-vh"
      );

    }


    const numSpan =
      document.createElement(
        "span"
      );

    numSpan.className =
      "cal-day-num";

    numSpan.textContent =
      day;


    const badgeSpan =
      document.createElement(
        "span"
      );

    badgeSpan.className =
      "cal-day-badge";


    if (shift === "98") {

      badgeSpan.textContent =
        "98";

    }


    if (shift === "163") {

      badgeSpan.textContent =
        "163";

    }


    if (shift === "vh") {

      badgeSpan.textContent =
        "ВХ";

    }


    cell.appendChild(
      numSpan
    );

    cell.appendChild(
      badgeSpan
    );


    cell.addEventListener(
      "click",
      () => openShiftModal(day)
    );


    grid.appendChild(
      cell
    );

  }

}


// =====================================================
// КАЛЕНДАРЬ — МЕСЯЦЫ
// =====================================================

document
  .getElementById("prevMonthBtn")
  .addEventListener(
    "click",
    () => {

      calCurrentDate.setMonth(
        calCurrentDate.getMonth() - 1
      );

      initScheduleCalendar();

    }
  );


document
  .getElementById("nextMonthBtn")
  .addEventListener(
    "click",
    () => {

      calCurrentDate.setMonth(
        calCurrentDate.getMonth() + 1
      );

      initScheduleCalendar();

    }
  );


// =====================================================
// МОДАЛКА СМЕНЫ
// =====================================================

const shiftModalOverlay =
  document.getElementById(
    "shiftModalOverlay"
  );


function openShiftModal(day) {

  selectedCalDay =
    day;


  document
    .getElementById(
      "shiftModalTitle"
    )
    .textContent =
      `${day} ${MONTH_NAMES[calCurrentDate.getMonth()]}`;


  shiftModalOverlay.classList.add(
    "active"
  );

}


function closeShiftModal() {

  shiftModalOverlay.classList.remove(
    "active"
  );

}


shiftModalOverlay.addEventListener(
  "click",
  e => {

    if (
      e.target === shiftModalOverlay
    ) {

      closeShiftModal();

    }

  }
);


// =====================================================
// УСТАНОВКА СМЕНЫ
// =====================================================

function setShift(type) {

  if (!selectedCalDay) {
    return;
  }


  const monthKey =
    getCalMonthKey();


  const dayRef =
    ref(
      scheduleDb,
      `schedules/${monthKey}/day_${selectedCalDay}`
    );


  if (type === null) {

    remove(dayRef);

  }
  else {

    set(
      dayRef,
      type
    );

  }


  closeShiftModal();

}


document
  .getElementById("btnShift98")
  .addEventListener(
    "click",
    () => setShift("98")
  );


document
  .getElementById("btnShift163")
  .addEventListener(
    "click",
    () => setShift("163")
  );


document
  .getElementById("btnShiftVh")
  .addEventListener(
    "click",
    () => setShift("vh")
  );


document
  .getElementById("btnShiftReset")
  .addEventListener(
    "click",
    () => setShift(null)
  );


// =====================================================
// ЗАПУСК
// =====================================================

initScheduleCalendar();
