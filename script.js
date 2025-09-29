// ---------- AUTH WITH LOCALSTORAGE ----------
function register() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  if (!username || !password) {
    alert("Please fill all fields");
    return;
  }
  let users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[username]) {
    alert("Username already exists");
    return;
  }
  users[username] = { password: password };
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registered successfully! You can now log in.");
}

function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  let users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[username] && users[username].password === password) {
    localStorage.setItem("currentUser", username);
    document.getElementById("userDisplay").textContent = username;
    document.getElementById("authContainer").classList.add("hidden");
    document.getElementById("appContainer").classList.remove("hidden");
  } else {
    alert("Invalid credentials");
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  document.getElementById("appContainer").classList.add("hidden");
  document.getElementById("authContainer").classList.remove("hidden");
}

// Keep logged in if currentUser exists
window.onload = () => {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    document.getElementById("userDisplay").textContent = currentUser;
    document.getElementById("authContainer").classList.add("hidden");
    document.getElementById("appContainer").classList.remove("hidden");
  }
};

// ---------- QUIZ SYSTEM SAMPLE (Placeholder) ----------
const questions = {
  Math: [
    { q: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
    { q: "What is 10 - 3?", options: ["7", "5", "8", "6"], answer: "7" }
  ],
  Science: [
    { q: "Which organ pumps blood?", options: ["Lungs", "Heart", "Liver", "Kidney"], answer: "Heart" },
    { q: "Which system helps us breathe?", options: ["Digestive", "Respiratory", "Circulatory", "Nervous"], answer: "Respiratory" }
  ]
};

function startSubject(subject) {
  const quizContainer = document.getElementById("quizContainer");
  quizContainer.classList.remove("hidden");
  quizContainer.innerHTML = `<h2>${subject} Quiz</h2>`;
  loadQuiz(subject, 0);
}

function loadQuiz(subject, index) {
  const quizContainer = document.getElementById("quizContainer");
  if (index >= questions[subject].length) {
    quizContainer.innerHTML = `<p>Quiz finished!</p>`;
    return;
  }
  const q = questions[subject][index];
  quizContainer.innerHTML = `
    <h3>${q.q}</h3>
    ${q.options
      .map(
        (opt) => `<button onclick="checkAnswer('${subject}', ${index}, '${opt}')">${opt}</button>`
      )
      .join("")}
  `;
}

function checkAnswer(subject, index, chosen) {
  const q = questions[subject][index];
  const buttons = document.querySelectorAll("#quizContainer button");
  buttons.forEach((btn) => {
    if (btn.textContent === q.answer) {
      btn.style.background = "#4caf50"; // green for correct
    } else if (btn.textContent === chosen) {
      btn.style.background = "#e53935"; // red for wrong
    }
    btn.disabled = true;
  });
  setTimeout(() => loadQuiz(subject, index + 1), 800);
}
```
