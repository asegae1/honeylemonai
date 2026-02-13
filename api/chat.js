let chats = JSON.parse(localStorage.getItem('lemon_groq_v1') || '{}');
let currentId = null;

function init() {
    const sel = document.getElementById('modelSelect');
    // window.HoneyLemonModels がない場合のフォールバック
    const models = window.HoneyLemonModels || { "Groq-Llama3": { PERSONALITY: "高速回答モデル" } };
    Object.keys(models).forEach(m => {
        let opt = document.createElement('option');
        opt.value = m; opt.innerText = m;
        sel.appendChild(opt);
    });
}

async function run() {
    const input = document.getElementById('input');
    if (!input.value) return;
    if (!currentId) createNewChat();

    const text = input.value;
    const modelKey = document.getElementById('modelSelect').value;
    const personality = document.getElementById('personalityInput').value;
    const batch = parseInt(document.getElementById('batchSelect').value);

    addMsg(text, 'user');
    chats[currentId].messages.push({ text, type: 'user' });
    input.value = "";

    // Groq APIを叩く想定のループ
    for (let i = 0; i < batch; i++) {
        const aiMsg = `[Groq:${modelKey}] 思考中...`;
        const msgId = addMsg(aiMsg, 'ai');

        // 擬似的なGroqレスポンス（実際は fetch で Groq API を叩く）
        setTimeout(() => {
            const finalResp = `Groq高速レスポンス: 「${text}」について、${personality || '標準'}な設定で回答しました。`;
            updateMsg(msgId, finalResp);
            chats[currentId].messages.push({ text: finalResp, type: 'ai' });
            save();
        }, 500 + (i * 300));
    }
}

// 画像生成のリクエストをエミュレート
function generateImageRequest() {
    const input = document.getElementById('input');
    if (!input.value) {
        alert("画像の説明を入力してください");
        return;
    }
    addMsg(`画像生成依頼: ${input.value}`, 'user');
    
    const box = document.getElementById('chat-box');
    const d = document.createElement('div');
    d.className = 'msg ai';
    d.innerHTML = `<div>画像を生成しています...</div><div class="gen-image">画像生成プロセスのシミュレーション</div>`;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
    input.value = "";
}

function addMsg(text, type) {
    const box = document.getElementById('chat-box');
    const d = document.createElement('div');
    const id = "msg-" + Date.now() + Math.random();
    d.id = id;
    d.className = `msg ${type}`;
    d.innerText = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
    return id;
}

function updateMsg(id, newText) {
    const target = document.getElementById(id);
    if (target) target.innerText = newText;
}

function createNewChat() {
    currentId = Date.now();
    chats[currentId] = { title: "Groqセッション", messages: [] };
    save();
}

function save() { localStorage.setItem('lemon_groq_v1', JSON.stringify(chats)); }

window.onload = init;
