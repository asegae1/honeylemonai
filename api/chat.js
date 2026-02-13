let chats = JSON.parse(localStorage.getItem('lemon_chats_v2') || '{}');
let currentChatId = null;

// モデル選択メニューの構築
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

  // 隠し性格(PERSONALITY)を注入
  const systemPrompt = `CORE_ID: ${selectedModel.PERSONALITY}\nUSER_SETTING: ${document.getElementById('personalityInput').value}\nLEN: ${document.getElementById('lengthSelect').value}`;

  for (let i = 0; i < batchCount; i++) {
    const aiDiv = document.createElement('div');
    aiDiv.className = 'msg ai';
    aiDiv.innerText = `${selectedModel.Models} 応答中...`;
    group.appendChild(aiDiv);

    setTimeout(() => {
      const result = `[${selectedModel.Models}] 隠し性格を反映した回答シミュレーションです。`;
      aiDiv.innerText = result;
      chats[currentChatId].messages.push({ text: result, type: 'ai' });
      save();
    }, 600 + (i * 200));
  }
}

function createNewChat() { currentChatId = Date.now(); chats[currentChatId] = { title: "新しい会話", messages: [] }; save(); renderChat(); }
function loadChat(id) { currentChatId = id; renderChat(); renderHistory(); }
function save() { localStorage.setItem('lemon_chats_v2', JSON.stringify(chats)); renderHistory(); }

function renderChat() {
  const box = document.getElementById('chat-box'); box.innerHTML = "";
  if (currentChatId && chats[currentChatId]) {
    chats[currentChatId].messages.forEach(m => {
      const d = document.createElement('div'); d.className = `msg ${m.type}`; d.innerText = m.text; box.appendChild(d);
    });
  }
  box.scrollTop = box.scrollHeight;
}

function renderHistory() {
  const list = document.getElementById('history-list');
  list.innerHTML = Object.keys(chats).reverse().map(id => `
    <div class="history-item ${id == currentChatId ? 'active' : ''}" onclick="loadChat('${id}')">
      <span style="flex:1; overflow:hidden;">${chats[id].title}</span>
      <div style="display:flex; gap:10px;">
        <div class="icon-edit" onclick="renameChat(event, '${id}')"></div>
        <div class="icon-trash" onclick="deleteChat(event, '${id}')"></div>
      </div>
    </div>
  `).join('');
}

function renameChat(e, id) { e.stopPropagation(); const n = prompt("名前変更", chats[id].title); if(n){chats[id].title=n; save();} }
function deleteChat(e, id) { e.stopPropagation(); if(confirm("削除？")){delete chats[id]; if(currentChatId==id)currentChatId=null; save(); renderChat();} }

window.onload = () => { initModels(); if (Object.keys(chats).length > 0) loadChat(Object.keys(chats).reverse()[0]); else createNewChat(); };
