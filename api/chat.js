let chats = JSON.parse(localStorage.getItem('lemon_v3') || '{}');
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
    const lang = document.getElementById('langSelect').value;
    const model = window.HoneyLemonModels[document.getElementById('modelSelect').value];
    const batch = parseInt(document.getElementById('batchSelect').value);
    
    if (!input.value) return;
    if (!currentId) createNewChat();

    const text = input.value;
    addMsg(text, 'user');
    chats[currentId].messages.push({ text, type: 'user' });
    input.value = "";

    // 言語設定による分岐
    const responseBase = lang === 'en' ? "This is a response in English." : "日本語での回答です。";

    for (let i = 0; i < batch; i++) {
        // PERSONALITY（隠し性格）を考慮したシミュレーション
        const aiText = `[${model.Models}] ${responseBase}\n設定: ${model.PERSONALITY}`;
        addMsg(aiText, 'ai');
        chats[currentId].messages.push({ text: aiText, type: 'ai' });
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
    chats[currentId] = { title: "新しい会話", messages: [] };
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
function save() { localStorage.setItem('lemon_v3', JSON.stringify(chats)); renderHistory(); }

window.onload = init;
