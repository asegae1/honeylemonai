let chats = JSON.parse(localStorage.getItem('lemon_chats_v2') || '{}');
let currentChatId = null;

function initModels() {
  const select = document.getElementById('modelSelect');
  if (!window.HoneyLemonModels) return;
  Object.keys(window.HoneyLemonModels).forEach(key => {
    const opt = document.createElement('option');
    opt.value = key; opt.innerText = key;
    select.appendChild(opt);
  });
}

async function run() {
  const input = document.getElementById('input');
  if (!input.value) return;
  if (!currentChatId) createNewChat();

  const userText = input.value;
  const batchCount = parseInt(document.getElementById('batchSelect').value);
  const selectedModel = window.HoneyLemonModels[document.getElementById('modelSelect').value];
  
  chats[currentChatId].messages.push({ text: userText, type: 'user' });
  if(chats[currentChatId].title === "新しい会話") chats[currentChatId].title = userText.substring(0, 10);
  renderChat();
  input.value = "";

  const box = document.getElementById('chat-box');
  const group = document.createElement('div');
  group.className = `response-group batch-${batchCount}`;
  box.appendChild(group);

  // 重要：隠し性格(PERSONALITY)をシステム命令に組み込む
  const hiddenCore = selectedModel.PERSONALITY;
  const surfaceTone = document.getElementById('personalityInput').value;
  const length = document.getElementById('lengthSelect').value;

  for (let i = 0; i < batchCount; i++) {
    const aiDiv = document.createElement('div');
    aiDiv.className = 'msg ai';
    aiDiv.innerText = `${selectedModel.Models} 思考中...`;
    group.appendChild(aiDiv);

    // 擬似API実行
    setTimeout(() => {
      const response = `[Core: ${hiddenCore.substring(0,10)}...] ${surfaceTone || '標準'}な回答です。`;
      aiDiv.innerText = response;
      chats[currentChatId].messages.push({ text: response, type: 'ai' });
      save();
    }, 600 + (i * 200));
  }
}

function renderChat() {
  const box = document.getElementById('chat-box'); box.innerHTML = "";
  if (currentChatId && chats[currentChatId]) {
    chats[currentChatId].messages.forEach(m => {
      const d = document.createElement('div'); d.className = `msg ${m.type}`; d.innerText = m.text; box.appendChild(d);
    });
  }
  box.scrollTop = box.scrollHeight;
}

function createNewChat() { currentChatId = Date.now(); chats[currentChatId] = { title: "新しい会話", messages: [] }; save(); renderChat(); }
function loadChat(id) { currentChatId = id; renderChat(); renderHistory(); }
function save() { localStorage.setItem('lemon_chats_v2', JSON.stringify(chats)); renderHistory(); }
function renderHistory() {
  const list = document.getElementById('history-list');
  list.innerHTML = Object.keys(chats).reverse().map(id => `
    <div class="history-item ${id == currentChatId ? 'active' : ''}" onclick="loadChat('${id}')">
      <span>${chats[id].title}</span>
    </div>
  `).join('');
}

window.onload = () => { initModels(); if (Object.keys(chats).length > 0) loadChat(Object.keys(chats).reverse()[0]); else createNewChat(); };
