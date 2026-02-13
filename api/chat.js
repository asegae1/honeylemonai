let chats = JSON.parse(localStorage.getItem('lemon_chats_v2') || '{}');
let currentChatId = null;

// モデル選択肢の初期化
function initModels() {
  const select = document.getElementById('modelSelect');
  if (!window.HoneyLemonModels) return;
  Object.keys(window.HoneyLemonModels).forEach(key => {
    const opt = document.createElement('option');
    opt.value = key; opt.innerText = key;
    select.appendChild(opt);
  });
}

// 履歴の描画（名前変更・削除機能付き）
function renderHistory() {
  const list = document.getElementById('history-list');
  list.innerHTML = Object.keys(chats).reverse().map(id => `
    <div class="history-item ${id == currentChatId ? 'active' : ''}" onclick="loadChat('${id}')">
      <span style="flex:1; overflow:hidden; text-overflow:ellipsis;">${chats[id].title}</span>
      <div style="display:flex; gap:8px; margin-left:5px;">
        <div class="icon-edit" onclick="renameChat(event, '${id}')"></div>
        <div class="icon-trash" onclick="deleteChat(event, '${id}')"></div>
      </div>
    </div>
  `).join('');
}

// メッセージUI追加（コード分裂ロジック内蔵）
function addMsgToUI(text, type, container) {
  const d = document.createElement('div');
  d.className = `msg ${type}`;
  
  const parts = text.split(/```/);
  parts.forEach((part, i) => {
    if (i % 2 === 1) { // コード部分
      const code = document.createElement('div');
      code.className = 'code-block';
      code.innerHTML = `<pre style="margin:0">${part.trim()}</pre>`;
      d.appendChild(code);
    } else { // テキスト部分
      const span = document.createElement('span');
      span.innerText = part;
      d.appendChild(span);
    }
  });
  container.appendChild(d);
  container.scrollTop = container.scrollHeight;
}

async function run() {
  const input = document.getElementById('input');
  if (!input.value) return;
  if (!currentChatId) createNewChat();

  const userText = input.value;
  const batchCount = parseInt(document.getElementById('batchSelect').value);
  const selectedKey = document.getElementById('modelSelect').value;
  const model = window.HoneyLemonModels[selectedKey];

  // 履歴保存
  chats[currentChatId].messages.push({ text: userText, type: 'user' });
  if(chats[currentChatId].title === "新しい会話") chats[currentChatId].title = userText.substring(0, 10);
  
  const box = document.getElementById('chat-box');
  addMsgToUI(userText, 'user', box);
  input.value = "";

  // Batch分裂グループの作成
  const group = document.createElement('div');
  group.className = `response-group batch-${batchCount}`;
  box.appendChild(group);

  // プロンプト構築（隠し性格 PERSONALITY を注入）
  const systemPrompt = `CORE_ID: ${model.PERSONALITY}\nSURFACE: ${document.getElementById('personalityInput').value}\nLEN: ${document.getElementById('lengthSelect').value}`;

  for (let i = 0; i < batchCount; i++) {
    const aiPlaceholder = document.createElement('div');
    aiPlaceholder.className = 'msg ai';
    aiPlaceholder.innerText = "Thinking...";
    group.appendChild(aiPlaceholder);

    // 生成シミュレーション
    setTimeout(() => {
      const response = `[${model.Models} v${model.Version}] ${userText}に対する回答です。\`\`\`javascript\nconsole.log("HoneyLemon Logic Active");\n\`\`\``;
      aiPlaceholder.innerText = "";
      addMsgToUI(response, 'ai', aiPlaceholder);
      chats[currentChatId].messages.push({ text: response, type: 'ai' });
      save();
    }, 500 + (i * 200));
  }
}

// 共通ヘルパー
function createNewChat() { currentChatId = Date.now(); chats[currentChatId] = { title: "新しい会話", messages: [] }; save(); renderChat(); }
function loadChat(id) { currentChatId = id; renderChat(); renderHistory(); }
function save() { localStorage.setItem('lemon_chats_v2', JSON.stringify(chats)); renderHistory(); }
function renderChat() {
  const box = document.getElementById('chat-box'); box.innerHTML = "";
  if (currentChatId && chats[currentChatId]) {
    chats[currentChatId].messages.forEach(m => addMsgToUI(m.text, m.type, box));
  }
}
function renameChat(e, id) { e.stopPropagation(); const n = prompt("名前を変更:", chats[id].title); if(n){chats[id].title=n; save();} }
function deleteChat(e, id) { e.stopPropagation(); if(confirm("削除しますか？")){delete chats[id]; if(currentChatId==id)currentChatId=null; save(); renderChat();} }

window.onload = () => { initModels(); if (Object.keys(chats).length > 0) loadChat(Object.keys(chats).reverse()[0]); else createNewChat(); };
