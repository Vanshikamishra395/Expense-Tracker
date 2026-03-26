const balance = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const search = document.getElementById("search");
const progressBar = document.getElementById("progress-bar");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentFilter = "all";

function updateValues() {
  const amounts = transactions.map(t => t.amount);
  const income = amounts.filter(i => i > 0).reduce((acc, i) => acc + i, 0);
  const expense = amounts.filter(i => i < 0).reduce((acc, i) => acc + i, 0) * -1;
  const total = income - expense;

  balance.innerText = `₹${total}`;
  incomeEl.innerText = `₹${income}`;
  expenseEl.innerText = `₹${expense}`;

  // Budget logic (Setting 15k as default limit for bar)
  const limit = 15000;
  const ratio = Math.min((expense / limit) * 100, 100);
  progressBar.style.width = `${ratio}%`;
}

function renderTransactions() {
  list.innerHTML = "";
  const query = search.value.toLowerCase();

  let filtered = transactions.filter(t => t.text.toLowerCase().includes(query));

  if (currentFilter === "income") filtered = filtered.filter(t => t.amount > 0);
  if (currentFilter === "expense") filtered = filtered.filter(t => t.amount < 0);

  filtered.forEach(t => {
    const li = document.createElement("li");
    li.classList.add(t.amount < 0 ? "minus" : "plus");

    li.innerHTML = `
      <div>
        <p class="li-desc">${t.text}</p>
        <p class="li-cat">${t.category}</p>
      </div>
      <div style="display: flex; align-items: center;">
        <span class="li-amt" style="color: ${t.amount < 0 ? '#ef4444' : '#10b981'}">
          ${t.amount < 0 ? '-' : '+'}₹${Math.abs(t.amount)}
        </span>
        <button class="delete-btn" onclick="removeTransaction(${t.id})">×</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function addTransaction(e) {
  e.preventDefault();
  if (!text.value || !amount.value) return;

  const t = { id: Date.now(), text: text.value, amount: +amount.value, category: category.value };
  transactions.push(t);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  init();
  text.value = ""; amount.value = "";
}

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  init();
}

function setFilter(type, btn) {
  currentFilter = type;
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTransactions();
}

function generateStatement() {
  if (transactions.length === 0) return alert("No data!");
  let csv = "Description,Category,Amount\n";
  transactions.forEach(t => csv += `${t.text},${t.category},${t.amount}\n`);
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Statement.csv";
  a.click();
}

function init() {
  updateValues();
  renderTransactions();
}

form.addEventListener("submit", addTransaction);
init();