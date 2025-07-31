
const API_KEY = "tgp_v1_A7lt4a5E93XTwL3fXNbI1xOl5yknaB4a6KBsNHJbnds";
const API_URL = "https://api.together.xyz/v1/chat/completions";

const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceSelect = document.getElementById("voiceSelect");
const muteToggle = document.getElementById("muteToggle");
const historyList = document.getElementById("historyList");

let voices = [];
let messageHistory = [];

// Load available voices and populate dropdown
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

// Add a chat message to sidebar history
function addToHistory(prompt) {
  const li = document.createElement("li");
  li.textContent = prompt.length > 30 ? prompt.slice(0, 30) + "..." : prompt;
  li.style.cursor = "pointer";
  li.style.padding = "4px";
  li.onclick = () => {
    userInput.value = prompt;
    userInput.focus();
  };
  historyList.prepend(li);
}

// Main button click handler
sendBtn.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;

  chatbox.innerHTML += `<div><strong>You:</strong> ${message}</div>`;
  chatbox.scrollTop = chatbox.scrollHeight;
  userInput.value = "";

  messageHistory.push({ role: "user", content: message });
  addToHistory(message);

  const payload = {
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    messages: messageHistory,
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

    chatbox.innerHTML += `<div><strong>AI:</strong> ${reply}</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
    messageHistory.push({ role: "assistant", content: reply });

    if (!muteToggle.checked) {
      const utterance = new SpeechSynthesisUtterance(reply);
      const selectedVoice = voices[voiceSelect.value];
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      speechSynthesis.speak(utterance);
    }

  } catch (error) {
    console.error("API Error:", error);
    chatbox.innerHTML += `<div style="color:red;"><strong>Error:</strong> ${error.message}</div>`;
  }
});

// Voice-to-text using SpeechRecognition API
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US"; // Change to "fil-PH" if Filipino is supported
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const micBtn = document.createElement("button");
micBtn.textContent = "🎙️ Speak";
micBtn.style.padding = "8px";
micBtn.style.backgroundColor = "#28a745";
micBtn.style.color = "white";
micBtn.style.border = "none";
micBtn.style.borderRadius = "6px";
micBtn.style.cursor = "pointer";
micBtn.style.marginTop = "8px";

document.querySelector(".bottom-bar").appendChild(micBtn);

micBtn.addEventListener("click", () => {
  recognition.start();
  micBtn.textContent = "🎙️ Listening...";
  micBtn.disabled = true;
});

// When speech is recognized
recognition.addEventListener("result", (event) => {
  const transcript = event.results[0][0].transcript;
  userInput.value = transcript;
  sendBtn.click();
});

// Reset button state
recognition.addEventListener("end", () => {
  micBtn.textContent = "🎙️ Speak";
  micBtn.disabled = false;
});
