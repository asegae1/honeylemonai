let chats = JSON.parse(localStorage.getItem('lemon_v6') || '{}');
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

async function run(isImage = false) {
    const input = document.getElementById('input');
    if (!input.value) return;
    if (!currentId) createNewChat();

    const userText = input.value;
    const modelKey = document.getElementById('modelSelect').value;
    const model = window.HoneyLemonModels[modelKey];
    const personality = document.getElementById('personalityInput').value;

    addMsg(userText, 'user');
    chats[currentId].messages.push({ text: userText, type: 'user' });
    input.value = "";

    if (isImage) {
        // 画像生成モード
        const aiDiv = document.createElement('div');
        aiDiv.className = 'msg ai';
        aiDiv.innerHTML = `<div>「${userText}」の画像を生成します...</div><div class="ai-image">画像生成AI [${model.GroqModel}] 実行中</div>`;
        document.getElementById('chat-box').appendChild(aiDiv);
    } else {
        // 通常のGroq対話モード
        const batch = parseInt(document.getElementById('batchSelect').value);
        for (let i = 0; i < batch; i++) {
            const response = `[AI: ${model.Models} / Engine: ${model.GroqModel}] 
${personality || '標準'}な性格で回答しました。内部性格「${model.PERSONALITY}」を維持しています。`;
            addMsg(response, 'ai');
            chats[currentId].messages.push({ text: response, type: 'ai' });
        }
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
        </div>
    `).join('');
}

function loadChat(id) { currentId = id; renderChat(); renderHistory(); }
function save() { localStorage.setItem('lemon_v6', JSON.stringify(chats)); renderHistory(); }

window.onload = init;
