// ==================== Ambil data profile ====================
window.addEventListener('DOMContentLoaded', () => {
  const data = JSON.parse(localStorage.getItem('chatUser'));
  if (data) {
    const nameEl = document.getElementById('chatUserName');
    const imgEl = document.getElementById('chatUserImg');
    if(nameEl) nameEl.textContent = data.name;
    if(imgEl) imgEl.src = data.img;
  }

  // Tampilkan info profil dari URL
  const params = new URLSearchParams(window.location.search);
  const profileId = params.get('id');
  const profileInfo = document.getElementById('profile-info');
  if(profileId && window.profiles){
    const prof = profiles.find(p => p.id == profileId);
    if(prof){
      profileInfo.textContent = `💬 Kamu chat dengan ${prof.name}, ${prof.age} tahun`;
    }
  }
});

// ==================== Chat box ====================
const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('messageInput');
const chatBox = document.getElementById('chat-box');

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;

  const userMsg = document.createElement('div');
  userMsg.className = 'user-msg';
  userMsg.textContent = msg;
  chatBox.appendChild(userMsg);

  messageInput.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  // balasan cupid otomatis
  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'bot-msg';
    const replies = [
      "Hehe, kamu manis banget 💗",
      "Wah serius nih? 😳",
      "Cupid jadi deg-degan 🥰",
      "Hmm... sepertinya kamu tipe penyayang ya 💞",
      "Cerita dong, kamu suka kopi atau teh? ☕🍵",
      "Haha lucu banget kamu 😆"
    ];
    botMsg.textContent = replies[Math.floor(Math.random() * replies.length)];
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 800);
}

// ==================== Popup Email Sebelum Back ====================
const backBtn = document.getElementById('backBtn');
const emailPopup = document.getElementById('emailPopup');
const saveEmailBtn = document.getElementById('saveEmailBtn');
const cancelEmailBtn = document.getElementById('cancelEmailBtn');
const userEmailInput = document.getElementById('userEmail');

backBtn.addEventListener('click', () => {
  emailPopup.style.display = 'flex';
  userEmailInput.focus();
});

cancelEmailBtn.addEventListener('click', () => {
  emailPopup.style.display = 'none';
  window.location.href = 'index.html';
});

saveEmailBtn.addEventListener('click', () => {
  const email = userEmailInput.value.trim();
  if(email && email.match(/^\S+@\S+\.\S+$/)){
    localStorage.setItem('userEmail', email);
    emailPopup.style.display = 'none';

    // popup notifikasi lucu
    const notif = document.createElement('div');
    notif.className = 'email-notif';
    notif.textContent = '💘 Doi bakal balas ngehubungi balik kalo dia serius sama kamu!';
    document.body.appendChild(notif);

    setTimeout(() => {
      notif.classList.add('show');
      setTimeout(() => {
        notif.classList.remove('show');
        document.body.removeChild(notif);
        window.location.href = 'index.html';
      }, 3000);
    }, 100);
  } else {
    alert('Email tidak valid, coba lagi!');
    userEmailInput.focus();
  }
});

// klik di luar popup untuk tutup
window.addEventListener('click', (e) => {
  if(e.target === emailPopup){
    emailPopup.style.display = 'none';
  }
});