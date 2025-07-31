const API_KEY = "tgp_v1_A7lt4a5E93XTwL3fXNbI1xOl5yknaB4a6KBsNHJbnds";
const API_URL = "https://api.together.xyz/v1/chat/completions";

const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceSelect = document.getElementById("voiceSelect");
const muteToggle = document.getElementById("muteToggle");

let voices = [];

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

// Chrome loads voices asynchronously
speechSynthesis.onvoiceschanged = populateVoices;

// Main button click handler
sendBtn.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;

  chatbox.innerHTML += `<div><strong>You:</strong> ${message}</div>`;
  chatbox.scrollTop = chatbox.scrollHeight;
  userInput.value = "";

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

    chatbox.innerHTML += `<div><strong>AI:</strong> ${reply}</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;

 // Speak using selected voice (if not muted)
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
