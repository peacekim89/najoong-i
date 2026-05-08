const APP_URL = "https://najoong-i.vercel.app";

let currentTab = null;

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  document.getElementById("page-title").textContent = tab.title || tab.url;
  document.getElementById("page-url").textContent = tab.url;

  const token = await getStoredToken();
  if (!token) {
    showLogin();
    return;
  }

  document.getElementById("status-dot").classList.add("logged-in");
}

async function handleSave() {
  const btn = document.getElementById("btn-save");
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div> 저장 중...`;

  const token = await getStoredToken();
  if (!token) { showLogin(); return; }

  try {
    const res = await fetch(`${APP_URL}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ url: currentTab.url }),
      credentials: "include",
    });

    const data = await res.json();

    if (res.status === 201) {
      showResult("success", "저장됐어요!", "AI가 자동으로 분석할게요");
    } else if (res.status === 409) {
      showResult("duplicate", "이미 저장된 링크예요", "나중이에서 확인해보세요");
    } else if (res.status === 403) {
      showResult("error", "저장 한도 초과", `무료 플랜은 300개까지 저장 가능해요`);
    } else {
      showResult("error", "저장 실패", data.error || "다시 시도해주세요");
    }
  } catch {
    showResult("error", "연결 실패", "앱에 접속할 수 없어요");
  }
}

function showResult(type, msg, sub) {
  document.getElementById("state-save").style.display = "none";
  document.getElementById("state-result").style.display = "block";

  const icons = { success: "✓", duplicate: "⚠", error: "✕" };
  const icon = document.getElementById("result-icon");
  icon.textContent = icons[type];
  icon.className = `result-icon ${type}`;
  document.getElementById("result-msg").textContent = msg;
  document.getElementById("result-sub").textContent = sub;

  if (type === "success") {
    setTimeout(() => window.close(), 1800);
  }
}

function showLogin() {
  document.getElementById("state-save").style.display = "none";
  document.getElementById("state-result").style.display = "none";
  document.getElementById("state-login").style.display = "block";
}

function openApp(path) {
  chrome.tabs.create({ url: APP_URL + path });
  window.close();
}

async function getStoredToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["access_token"], (result) => {
      resolve(result.access_token || null);
    });
  });
}

// Supabase 세션 쿠키에서 토큰 추출 시도
async function syncTokenFromCookie() {
  try {
    const cookies = await chrome.cookies.getAll({ domain: new URL(APP_URL).hostname });
    const sessionCookie = cookies.find(c => c.name.includes("sb-") && c.name.includes("-auth-token"));
    if (sessionCookie) {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      if (session?.access_token) {
        chrome.storage.local.set({ access_token: session.access_token });
        return session.access_token;
      }
    }
  } catch { /* ignore */ }
  return null;
}

window.handleSave = handleSave;
window.openApp = openApp;

init();
