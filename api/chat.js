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
    if (!input.value) return;
    if (!currentId) createNewChat();

    // --- システム的な設定値の強制取得 ---
    const userText = input.value;
    const lang = document.getElementById('langSelect').value; // 言語設定を取得
    const surface = document.getElementById('personalityInput').value; // 性格設定を取得
    const modelKey = document.getElementById('modelSelect').value;
    const model = window.HoneyLemonModels[modelKey];
    const batch = parseInt(document.getElementById('batchSelect').value);

    addMsg(userText, 'user');
    chats[currentId].messages.push({ text: userText, type: 'user' });
    input.value = "";

    // 分裂表示の実行
    for (let i = 0; i < batch; i++) {
        let responseText = "";
        
        // システム的条件分岐：言語設定を物理的に反映
        if (lang === 'en') {
            responseText = `[${model.Models}] Answer in English mode.\nSetting: ${surface || 'None'}\nCore: ${model.PERSONALITY}`;
        } else {
            responseText = `[${model.Models}] 日本語モードでの回答です。\n設定: ${surface || 'なし'}\n核: ${model.PERSONALITY}`;
        }

        addMsg(responseText, 'ai');
        chats[currentId].messages.push({ text: responseText, type: 'ai' });
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
            <span style="flex:1;">${chats[id].title}</span>
            <div class="del-link" onclick="deleteChat(event, '${id}')">削除</div>
        </div>
    `).join('');
}

function loadChat(id) { currentId = id; renderChat(); renderHistory(); }
function save() { localStorage.setItem('lemon_v3', JSON.stringify(chats)); renderHistory(); }
function deleteChat(e, id) { e.stopPropagation(); delete chats[id]; if(currentId === id) currentId = null; save(); renderChat(); }

window.onload = init;
