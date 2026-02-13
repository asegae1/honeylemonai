// api/chat.js
let chats = JSON.parse(localStorage.getItem('lemon_chats_v2') || '{}');
let currentChatId = null;

// モデルの読み込み確認
function init() {
  const select = document.getElementById('modelSelect');
  if (window.HoneyLemonModels) {
    Object.keys(window.HoneyLemonModels).forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.innerText = key;
      select.appendChild(opt);
    });
  }
}

async function run() {
  const input = document.getElementById('input');
  if (!input.value) return;
  if (!currentChatId) createNewChat();

  const userText = input.value;
  const modelKey = document.getElementById('modelSelect').value;
  const model = window.HoneyLemonModels[modelKey];
  const batch = parseInt(document.getElementById('batchSelect').value);

  // 画面表示とデータ保存
  displayMessage(userText, 'user');
  chats[currentChatId].messages.push({ text: userText, type: 'user' });
  input.value = "";

  // PERSONALITY（隠し性格）と性格設定を結合して「分裂」実行
  for (let i = 0; i < batch; i++) {
    const aiResponse = `[${model.Models}] ${userText} に対する ${document.getElementById('personalityInput').value || '標準'} な回答です。`;
    displayMessage(aiResponse, 'ai');
    chats[currentChatId].messages.push({ text: aiResponse, type: 'ai' });
  }
  save();
}

function displayMessage(text, type) {
  const box = document.getElementById('chat-box');
  const d = document.createElement('div');
  d.style.margin = "10px 0";
  d.style.padding = "10px 15px";
  d.style.borderRadius = "10px";
  d.style.maxWidth = "80%";
  d.style.background = type === 'user' ? '#FFD700' : '#fff';
  d.style.alignSelf = type === 'user' ? 'flex-end' : 'flex-start';
  d.innerText = text;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

function createNewChat() {
  currentChatId = Date.now();
  chats[currentChatId] = { title: "新しい会話", messages: [] };
  save();
}

function save() {
  localStorage.setItem('lemon_chats_v2', JSON.stringify(chats));
}

window.onload = init;
