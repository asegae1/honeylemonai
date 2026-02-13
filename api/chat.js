let chats = JSON.parse(localStorage.getItem('lemon_v8') || '{}');
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
}

async function run(isImage = false) {
    const input = document.getElementById('input');
    if (!input.value) return;
    if (!currentId) createNewChat();

    const text = input.value;
    const model = window.HoneyLemonModels[document.getElementById('modelSelect').value];
    
    addMsg(text, 'user');
    chats[currentId].messages.push({ text, type: 'user' });
    input.value = "";

    if (isImage) {
        // Hugging Face Space への画像生成リクエスト想定
        const aiDiv = document.createElement('div');
        aiDiv.className = 'msg ai';
        aiDiv.innerHTML = `<div>生成中(HuggingFace)...</div><div class="ai-img"></div>`;
        document.getElementById('chat-box').appendChild(aiDiv);
        // ここで本来は fetch("https://huggingface.co/api/...") を行う
    } else {
        // Groq API へのテキストリクエスト想定
        const batch = parseInt(document.getElementById('batchSelect').value);
        for (let i = 0; i < batch; i++) {
            const resp = `[Groq:${model.GroqModel}] Hugging FaceのSpace経由で回答を取得しました。`;
            addMsg(resp, 'ai');
            chats[currentId].messages.push({ text: resp, type: 'ai' });
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
    chats[currentId] = { title: "HFセッション", messages: [] };
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

function save() { localStorage.setItem('lemon_v8', JSON.stringify(chats)); }
window.onload = init;
