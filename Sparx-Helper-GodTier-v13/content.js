function getSparxContent() {
  const selectors = ["main", "article", ".question-text", ".passage", ".math-problem", "[class*='question']"];
  for (let sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.length > 50) return el.innerText.trim();
  }
  return document.body.innerText.trim();
}

function detectPlatform() {
  const url = window.location.href;
  if (url.includes('reader')) return "Sparx Reader";
  if (url.includes('maths')) return "Sparx Maths";
  if (url.includes('science')) return "Sparx Science";
  return "Sparx Platform";
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_SPARX_CONTENT") {
    sendResponse({ 
      text: getSparxContent(),
      platform: detectPlatform()
    });
  }
});

// Auto answer on page load (light version)
setTimeout(() => {
  if (document.body.innerText.includes("?") || document.querySelector(".question")) {
    chrome.runtime.sendMessage({type: "AUTO_ANSWER_TRIGGER"});
  }
}, 2000);