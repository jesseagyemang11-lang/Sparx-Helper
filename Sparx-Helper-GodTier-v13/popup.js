async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function askLocalAI(prompt, model = "phi3") {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        options: { temperature: 0.65, num_ctx: 16384 }
      })
    });
    const data = await response.json();
    return data.response || "No response from Ollama.";
  } catch(e) {
    return "❌ Ollama not running.\n\nPlease run: ollama serve";
  }
}

function addToMemory(answer) {
  chrome.storage.local.get(["memory"], (data) => {
    let mem = data.memory || [];
    mem.unshift({ time: new Date().toLocaleTimeString(), answer: answer.substring(0, 280) + "..." });
    if (mem.length > 20) mem.pop();
    chrome.storage.local.set({ memory: mem });
  });
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    ['main-panel', 'ocr-panel', 'tools-panel'].forEach(p => {
      const panel = document.getElementById(p);
      if (panel) panel.style.display = p.includes(tab.dataset.tab) ? 'block' : 'none';
    });
  });
});

document.getElementById('autoSolveBtn').addEventListener('click', async () => {
  const status = document.getElementById('answer');
  status.innerText = "🔍 Detecting and solving...";
  
  const tab = await getCurrentTab();
  chrome.tabs.sendMessage(tab.id, {type: "GET_SPARX_CONTENT"}, async (resp) => {
    if (!resp) {
      status.innerText = "No Sparx content detected.";
      return;
    }
    
    const prompt = `You are Sparx Helper God Tier. Solve this question perfectly. Subject: ${resp.platform}. Be accurate, show working for Maths, cite evidence for Reader/Science.\n\n${resp.text}`;
    const answer = await askLocalAI(prompt, "llama3.1");
    status.innerText = answer;
    addToMemory(answer);
  });
});

document.getElementById('captureOCRBtn').addEventListener('click', async () => {
  const status = document.getElementById('answer');
  status.innerText = "📸 Capturing screenshot...";
  
  const tab = await getCurrentTab();
  chrome.runtime.sendMessage({type: "CAPTURE_SCREENSHOT"}, (resp) => {
    status.innerText = "✅ Screenshot captured.\n\nOCR with Tesseract.js coming in next update (very soon).\n\nFor now, paste image to online OCR or use built-in AI.";
  });
});

// More buttons can be wired similarly...

console.log("Sparx Helper God Tier UI Loaded");