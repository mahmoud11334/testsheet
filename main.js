const API_URL = "https://script.google.com/macros/s/AKfycbwb3S_9hw1on7h5LrQIwMQak5th6Qp4gGFhUk--p8C8mTQPhWRjXaVjIr4s11ajK3TsLg/exec";
const SECRET_KEY = "admin123";
let studentsData = [];
let currentSort = "default";

const modal = document.getElementById("adminModal");
const adminBtn = document.getElementById("adminBtn");
const closeModal = document.getElementById("closeModal");
const sortSelect = document.getElementById("sortSelect");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const addStudentsTable = document.getElementById("addStudentsTable");
const addForm = document.getElementById("addForm");
const editShowAllBtn = document.getElementById("editShowAllBtn");
const editSearchBtn = document.getElementById("editSearchBtn");
const editSearchBox = document.getElementById("editSearchBox");
const editSearchType = document.getElementById("editSearchType");
const editSearchInput = document.getElementById("editSearchInput");
const editSearchRunBtn = document.getElementById("editSearchRunBtn");
const editList = document.getElementById("editList");
const deleteShowAllBtn = document.getElementById("deleteShowAllBtn");
const deleteSearchBtn = document.getElementById("deleteSearchBtn");
const deleteSearchBox = document.getElementById("deleteSearchBox");
const deleteSearchType = document.getElementById("deleteSearchType");
const deleteSearchInput = document.getElementById("deleteSearchInput");
const deleteSearchRunBtn = document.getElementById("deleteSearchRunBtn");
const deleteList = document.getElementById("deleteList");

async function loadStudents() {
  const res = await fetch(API_URL);
  studentsData = await res.json();
  sortStudents(currentSort);
}

function displayStudents(students) {
  const container = document.getElementById("students");
  container.innerHTML = "";
  students.forEach(s => {
    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `<img src="${s.img}" alt="${s.name}"><h2>${s.name}</h2><p>الدرجة: ${s.mark}</p>`;
    container.appendChild(card);
  });
}

function sortStudents(type) {
  currentSort = type;
  let sorted = [...studentsData];
  if(type==="name") sorted.sort((a,b)=>a.name.localeCompare(b.name));
  if(type==="markHigh") sorted.sort((a,b)=>b.mark-a.mark);
  if(type==="markLow") sorted.sort((a,b)=>a.mark-b.mark);
  if(type==="id") sorted.sort((a,b)=>a.id-b.id);
  displayStudents(sorted);
}

function getSortedStudentsForAdmin() {
  let sorted = [...studentsData];
  if(currentSort==="name") sorted.sort((a,b)=>a.name.localeCompare(b.name));
  if(currentSort==="markHigh") sorted.sort((a,b)=>b.mark-a.mark);
  if(currentSort==="markLow") sorted.sort((a,b)=>a.mark-b.mark);
  if(currentSort==="id") sorted.sort((a,b)=>a.id-b.id);
  return sorted;
}

async function sendPostRequest(data) {
  const res = await fetch(API_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  });
  return await res.json();
}

function openModal() {
  modal.style.display="flex";
  addStudentsTable.innerHTML="";
  addNewRow();
}

function closeModalFn(){modal.style.display="none";}
function switchTab(tabId){
  tabButtons.forEach(b=>b.classList.remove("active"));
  tabContents.forEach(t=>t.classList.remove("active"));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");
}

function addNewRow(){
  const tr = document.createElement("tr");
  tr.innerHTML = `<td><input class="table-input" placeholder="ID"></td><td><input class="table-input" placeholder="الاسم"></td><td><input class="table-input" placeholder="الدرجة"></td><td><input class="table-input" placeholder="رابط الصورة"></td><td><button class="danger-btn">✖</button></td>`;
  tr.querySelector(".danger-btn").onclick=()=>tr.remove();
  addStudentsTable.appendChild(tr);
}

addForm.onsubmit = async e => {
  e.preventDefault();
  const id = addForm.id.value.trim();
  const name = addForm.name.value.trim();
  const mark = addForm.mark.value.trim();
  const img = addForm.img.value.trim();
  if(!id||!name||!mark||!img) return;
  await sendPostRequest({key:SECRET_KEY,action:"add",id,name,mark,img});
  loadStudents();
  addForm.reset();
}

function createEditCard(s){
  const div=document.createElement("div");
  div.className="item-card";
  div.innerHTML=`<div class="item-info"><b>${s.name}</b><span>ID: ${s.id} | الدرجة: ${s.mark}</span></div><div class="item-actions"><button class="edit-action-btn">تعديل</button></div>`;
  div.querySelector(".edit-action-btn").onclick=async ()=>{
    const n=prompt("تعديل الاسم:",s.name);
    const m=prompt("تعديل الدرجة:",s.mark);
    const i=prompt("تعديل رابط الصورة:",s.img);
    if(!n||!m||!i)return;
    await sendPostRequest({key:SECRET_KEY,action:"edit",id:s.id,name:n,mark:m,img:i});
    loadStudents();renderEditAll();
  };
  return div;
}

function createDeleteCard(s){
  const div=document.createElement("div");
  div.className="item-card";
  div.innerHTML=`<div class="item-info"><b>${s.name}</b><span>ID: ${s.id} | الدرجة: ${s.mark}</span></div><div class="item-actions"><button class="delete-action-btn">حذف</button></div>`;
  div.querySelector(".delete-action-btn").onclick=async ()=>{
    if(!confirm("متأكد من الحذف؟"))return;
    await sendPostRequest({key:SECRET_KEY,action:"delete",id:s.id});
    loadStudents();renderDeleteAll();
  };
  return div;
}

function renderEditAll() {
  editList.innerHTML = "";
  editSearchBox.classList.add("hidden");
  getSortedStudentsForAdmin().forEach(s => editList.appendChild(createEditCard(s)));
}