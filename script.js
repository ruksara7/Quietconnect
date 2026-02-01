const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const chatSection = document.getElementById("chat");
const messagesEl = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");

let socket = null;
let connected = false;

function setStatus(text, cls) {
  statusEl.textContent = text;
  statusEl.className = `status ${cls}`;
}

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

startBtn.addEventListener("click", () => {
  if (socket) return;

  setStatus("Connecting…", "connecting");
  startBtn.disabled = true;

  socket = io("https://quiet-connect.onrender.com", {
    transports: ["websocket", "polling"],
    timeout: 20000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    connected = true;
    setStatus("Connected", "connected");
    chatSection.classList.remove("hidden");
  });

  socket.on("disconnect", () => {
    connected = false;
    setStatus("Disconnected / Server unavailable", "error");
    startBtn.disabled = false;
    socket = null;
  });

  socket.on("connect_error", () => {
    setStatus("Server waking up… retrying", "connecting");
  });

  socket.on("message", (msg) => {
    addMessage(msg, "peer");
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!connected || !input.value.trim()) return;

  const msg = input.value.trim();
  socket.emit("message", msg);
  addMessage(msg, "me");
  input.value = "";
});
