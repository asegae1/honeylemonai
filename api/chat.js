let chats = JSON.parse(localStorage.getItem('lemon_v4') || '{}');
let currentId = null;

function init() {
    const sel = document.getElementById('modelSelect');
    if (window.HoneyLemonModels) {
        Object.keys(window.HoneyLemonModels).forEach(m => {
            let opt = document.createElement('option');
            opt.value = m; opt.innerText = m;
            sel.appendChild(opt);
        });
    }
    renderHistory();
}

async function run() {
    const input = document.getElementById('input');
    if (!input.value) return;
    if (!currentId) createNewChat();

    // システム設定の取得
    const userText = input.value;
    const personality = document.getElementById('personalityInput').value;
    const modelKey = document.getElementById('modelSelect').value;
    const model = window.HoneyLemonModels[modelKey];
    const length = document.getElementById('lengthSelect').value;
    const batch = parseInt(document.getElementById('batchSelect').value);

    addMsg(userText, 'user');
    chats[currentId].messages.push({ text: userText, type: 'user' });
    input.value = "";

    // 分裂生成（Batch）
    for (let i = 0; i < batch; i++) {
        // 全ての設定を統合したレスポンスのシミュレート
        const response = `[${model.Models}] ${personality || '標準'}な性格で回答します。
（内部性格: ${model.PERSONALITY} / 指定長: ${length}文字）`;

        addMsg(response, 'ai');
        chats[currentId].messages.push({ text: response, type: 'ai' });
    }
    save();
}

function addMsg(text, type) {
    const box = document.getElementById('chat-box');
    const d = document.createElement('div');
    d.className = `msg ${type}`;
    d.innerText = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
}

function createNewChat() {
    currentId = Date.now();
    chats[currentId] = { title: "新しいチャット", messages: [] };
    save();
    renderChat();
}

function renderChat() {
    const box = document.getElementById('chat-box');
    box.innerHTML = "";
    if (currentId && chats[currentId]) {
        chats[currentId].messages.forEach(m => addMsg(m.text, m.type));
    }
}

function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = Object.keys(chats).reverse().map(id => `
        <div class="history-item" onclick="loadChat('${id}')">
            <span>${chats[id].title}</span>
            <div class="del-link" onclick="deleteChat(event, '${id}')">削除</div>
        </div>
    `).join('');
}

function loadChat(id) { currentId = id; renderChat(); renderHistory(); }
function save() { localStorage.setItem('lemon_v4', JSON.stringify(chats)); renderHistory(); }
function deleteChat(e, id) { e.stopPropagation(); delete chats[id]; if(currentId === id) currentId = null; save(); renderChat(); }

window.onload = init;
