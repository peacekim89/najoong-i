const APP_URL = "https://nachungi.vercel.app";

// 컨텍스트 메뉴: 링크 우클릭 저장
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-nachungi",
    title: "나중이에 저장",
    contexts: ["link", "page"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const url = info.linkUrl || info.pageUrl;
  if (!url) return;

  const token = await getToken();
  if (!token) {
    chrome.tabs.create({ url: `${APP_URL}/login` });
    return;
  }

  try {
    const res = await fetch(`${APP_URL}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
      credentials: "include",
    });

    const data = await res.json();

    if (res.status === 201) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "나중이",
        message: "저장됐어요! AI가 분석할게요.",
      });
    } else if (res.status === 409) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "나중이",
        message: "이미 저장된 링크예요.",
      });
    } else {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "나중이",
        message: data.error || "저장에 실패했어요.",
      });
    }
  } catch {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "나중이",
      message: "앱에 연결할 수 없어요.",
    });
  }
});

// 앱에서 로그인 완료 후 토큰 동기화
chrome.cookies.onChanged.addListener(({ cookie, removed }) => {
  if (removed) return;
  const appHost = new URL(APP_URL).hostname;
  if (cookie.domain.includes(appHost) && cookie.name.includes("sb-") && cookie.name.includes("-auth-token")) {
    try {
      const session = JSON.parse(decodeURIComponent(cookie.value));
      if (session?.access_token) {
        chrome.storage.local.set({ access_token: session.access_token });
      }
    } catch { /* ignore */ }
  }
});

async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["access_token"], (r) => resolve(r.access_token || null));
  });
}
