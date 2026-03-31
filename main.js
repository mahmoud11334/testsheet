const API_URL = "https://script.google.com/macros/s/AKfycbzD4R96WbmIRBTp_WHVehyQ6eqzvBVTL0l0G-HHf89tJj2h0cu0f9txnejik_DdD_ER3w/exec";
const SECRET_KEY = "admin123";

let studentsData = [];
let currentSort = "default";

const modal           = document.getElementById("adminModal");
const adminBtn        = document.getElementById("adminBtn");
const closeModalBtn   = document.getElementById("closeModal");
const sortSelect      = document.getElementById("sortSelect");
const tabButtons      = document.querySelectorAll(".tab-btn");
const tabContents     = document.querySelectorAll(".tab-content");
const addForm         = document.getElementById("addForm");
const addSubmitBtn    = document.getElementById("addSubmitBtn");
const editShowAllBtn  = document.getElementById("editShowAllBtn");
const editSearchBtn   = document.getElementById("editSearchBtn");
const editSearchBox   = document.getElementById("editSearchBox");
const editSearchType  = document.getElementById("editSearchType");
const editSearchInput = document.getElementById("editSearchInput");
const editSearchRunBtn= document.getElementById("editSearchRunBtn");
const editList        = document.getElementById("editList");
const deleteShowAllBtn  = document.getElementById("deleteShowAllBtn");
const deleteSearchBtn   = document.getElementById("deleteSearchBtn");
const deleteSearchBox   = document.getElementById("deleteSearchBox");
const deleteSearchType  = document.getElementById("deleteSearchType");
const deleteSearchInput = document.getElementById("deleteSearchInput");
const deleteSearchRunBtn= document.getElementById("deleteSearchRunBtn");
const deleteList        = document.getElementById("deleteList");
const loadingEl         = document.getElementById("loading");

async function loadStudents() {
  loadingEl.style.display = "flex";
  document.getElementById("students").innerHTML = "";
  try {
    const res = await fetch(API_URL);
    studentsData = await res.json();
    sortStudents(currentSort);
  } catch (err) {
    loadingEl.innerHTML = '<span style="color:#e63946">فشل تحميل البيانات. تحقق من الإعدادات.</span>';
    console.error(err);
    return;
  }
  loadingEl.style.display = "none";
}

function displayStudents(students) {
  const container = document.getElementById("students");
  container.innerHTML = "";
  students.forEach((s, i) => {
    const card = document.createElement("div");
    card.className = "student-card";
    card.style.animationDelay = (i * 0.05) + "s";
    card.innerHTML = `
      <img src="${s.img}" alt="${s.name}"
           onerror="this.src='https://img.icons8.com/?size=100&id=WxWh18GEkDgr&format=png&color=000000'">
      <h2>${s.name}</h2>
      <div class="mark-badge">${s.mark} درجة</div>
      <div class="student-id">رقم: ${s.id}</div>`;
    container.appendChild(card);
  });
}

function getSorted(data) {
  const arr = [...data];
  if (currentSort === "name")     arr.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  if (currentSort === "markHigh") arr.sort((a, b) => Number(b.mark) - Number(a.mark));
  if (currentSort === "markLow")  arr.sort((a, b) => Number(a.mark) - Number(b.mark));
  if (currentSort === "id")       arr.sort((a, b) => Number(a.id)   - Number(b.id));
  return arr;
}

function sortStudents(type) {
  currentSort = type;
  displayStudents(getSorted(studentsData));
}

async function sendPost(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return await res.json();
}

adminBtn.onclick    = () => { modal.style.display = "flex"; };
closeModalBtn.onclick = () => { modal.style.display = "none"; };
modal.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

tabButtons.forEach(btn => {
  btn.onclick = () => {
    tabButtons.forEach(b  => b.classList.remove("active"));
    tabContents.forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  };
});

sortSelect.onchange = e => sortStudents(e.target.value);

addForm.onsubmit = async e => {
  e.preventDefault();
  const fd    = new FormData(addForm);
  const id    = fd.get("sid").trim();
  const name  = fd.get("sname").trim();
  const mark  = fd.get("smark").trim();
  const img   = fd.get("simg").trim();
  if (!id || !name || !mark || !img) return;

  addSubmitBtn.disabled    = true;
  addSubmitBtn.textContent = "أستغل وقت الانتظار في الاستغفار";
  try {
    await sendPost({ key: SECRET_KEY, action: "add", id, name, mark: Number(mark), img });
    await loadStudents();
    addForm.reset();
  } catch {
    alert("حدث خطأ أثناء الحفظ");
  }
  addSubmitBtn.disabled    = false;
  addSubmitBtn.textContent = "حفظ الطالب";
};

function filterStudents(students, type, query) {
  const q = query.toLowerCase().trim();
  if (!q) return students;
  return students.filter(s => {
    if (type === "id")   return String(s.id).includes(q);
    if (type === "name") return s.name.toLowerCase().includes(q);
    if (type === "mark") return String(s.mark).includes(q);
    return true;
  });
}

function renderList(container, students, cardFn) {
  container.innerHTML = "";
  if (!students.length) {
    container.innerHTML = '<p class="empty-msg">لا توجد نتائج</p>';
    return;
  }
  students.forEach(s => container.appendChild(cardFn(s)));
}

function createEditCard(s) {
  const div = document.createElement("div");
  div.className = "item-card";
  div.innerHTML = `
    <div class="item-info">
      <b>${s.name}</b>
      <span>رقم: ${s.id} &nbsp;|&nbsp; الدرجة: ${s.mark}</span>
    </div>
    <div class="item-actions">
      <button class="edit-action-btn">تعديل</button>
    </div>`;

  div.querySelector(".edit-action-btn").onclick = async () => {
    const n = prompt("الاسم:", s.name);
    if (n === null) return;
    const m = prompt("الدرجة:", s.mark);
    if (m === null) return;
    const i = prompt("رابط الصورة:", s.img);
    if (i === null) return;
    try {
      await sendPost({ key: SECRET_KEY, action: "edit", id: s.id, name: n.trim(), mark: Number(m), img: i.trim() });
      await loadStudents();
      renderEditAll();
    } catch {
      alert("حدث خطأ أثناء التعديل");
    }
  };
  return div;
}

function createDeleteCard(s) {
  const div = document.createElement("div");
  div.className = "item-card";
  div.innerHTML = `
    <div class="item-info">
      <b>${s.name}</b>
      <span>رقم: ${s.id} &nbsp;|&nbsp; الدرجة: ${s.mark}</span>
    </div>
    <div class="item-actions">
      <button class="delete-action-btn">حذف</button>
    </div>`;

  div.querySelector(".delete-action-btn").onclick = async () => {
    if (!confirm(`هل أنت متأكد من حذف "${s.name}"؟`)) return;
    try {
      await sendPost({ key: SECRET_KEY, action: "delete", id: s.id });
      await loadStudents();
      renderDeleteAll();
    } catch {
      alert(" حدث خطأ أثناء الحذف");
    }
  };
  return div;
}

function renderEditAll() {
  editSearchBox.classList.add("hidden");
  editSearchInput.value = "";
  renderList(editList, getSorted(studentsData), createEditCard);
}

function renderDeleteAll() {
  deleteSearchBox.classList.add("hidden");
  deleteSearchInput.value = "";
  renderList(deleteList, getSorted(studentsData), createDeleteCard);
}

editShowAllBtn.onclick    = renderEditAll;
deleteShowAllBtn.onclick  = renderDeleteAll;

editSearchBtn.onclick   = () => editSearchBox.classList.toggle("hidden");
deleteSearchBtn.onclick = () => deleteSearchBox.classList.toggle("hidden");

editSearchRunBtn.onclick = () => {
  const results = filterStudents(getSorted(studentsData), editSearchType.value, editSearchInput.value);
  renderList(editList, results, createEditCard);
};

deleteSearchRunBtn.onclick = () => {
  const results = filterStudents(getSorted(studentsData), deleteSearchType.value, deleteSearchInput.value);
  renderList(deleteList, results, createDeleteCard);
};

editSearchInput.onkeydown   = e => { if (e.key === "Enter") editSearchRunBtn.click(); };
deleteSearchInput.onkeydown = e => { if (e.key === "Enter") deleteSearchRunBtn.click(); };

window.onload = loadStudents;