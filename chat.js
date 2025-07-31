const API_KEY = "tgp_v1_A7lt4a5E93XTwL3fXNbI1xOl5yknaB4a6KBsNHJbnds";
const API_URL = "https://api.together.xyz/v1/chat/completions";

const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceSelect = document.getElementById("voiceSelect");
const muteToggle = document.getElementById("muteToggle");
const darkToggle = document.getElementById("darkToggle");
const clearChatBtn = document.getElementById("clearChatBtn");

let voices = [];

function renderChatHistory() {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  chatbox.innerHTML = "";
  history.forEach(({ role, content }) => {
    const div = document.createElement("div");
    div.className = role === "user" ? "user" : "ai";
    div.innerHTML = `<strong>${role === "user" ? "You" : "AI"}:</strong> ${content}`;
    chatbox.appendChild(div);
  });
  chatbox.scrollTop = chatbox.scrollHeight;
}

function populateVoices() {
  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";
  voices.forEach((voice, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
}

speechSynthesis.onvoiceschanged = populateVoices;

sendBtn.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;

  chatbox.innerHTML += `<div class="user"><strong>You:</strong> ${message}</div>`;
  chatbox.scrollTop = chatbox.scrollHeight;
  userInput.value = "";

  let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.push({ role: "user", content: message });
  localStorage.setItem("chatHistory", JSON.stringify(history));

  const typingDiv = document.createElement("div");
  typingDiv.id = "typing";
  typingDiv.textContent = "AI is typing...";
  typingDiv.style.fontStyle = "italic";
  typingDiv.style.color = "#999";
  chatbox.appendChild(typingDiv);
  chatbox.scrollTop = chatbox.scrollHeight;

  const payload = {
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    messages: [{ role: "user", content: message }],
    stream: false
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "⚠️ No response.";

    document.getElementById("typing")?.remove();
    chatbox.innerHTML += `<div class="ai"><strong>AI:</strong> ${reply}</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;

    history.push({ role: "assistant", content: reply });
    localStorage.setItem("chatHistory", JSON.stringify(history));

    if (!muteToggle.checked) {
      const utterance = new SpeechSynthesisUtterance(reply);
      const selectedVoice = voices[voiceSelect.value];
      if (selectedVoice) utterance.voice = selectedVoice;
      speechSynthesis.speak(utterance);
    }

  } catch (error) {
    console.error("API Error:", error);
    document.getElementById("typing")?.remove();
    chatbox.innerHTML += `<div style="color:red;"><strong>Error:</strong> ${error.message}</div>`;
  }
});

darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", darkToggle.checked);
});

clearChatBtn.addEventListener("click", () => {
  localStorage.removeItem("chatHistory");
  renderChatHistory();
});

renderChatHistory();
