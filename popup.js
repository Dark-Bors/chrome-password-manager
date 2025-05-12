document.getElementById("loginBtn").onclick = async () => {
    const key = document.getElementById("masterKey").value;
    if (!key) return;
  
    window.masterKey = key;
    document.getElementById("authSection").style.display = "none";
    document.getElementById("mainSection").style.display = "block";
    loadCredentials();
  };
  
  document.getElementById("saveBtn").onclick = async () => {
    const site = document.getElementById("site").value;
    const url = document.getElementById("url").value;
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
  
    const encrypted = await encryptData({ url, user, pass }, window.masterKey);
    chrome.storage.local.set({ [site]: encrypted });
    loadCredentials();
  };
  
  async function loadCredentials() {
    chrome.storage.local.get(null, async (data) => {
      const list = document.getElementById("siteList");
      list.innerHTML = '';
      for (const [site, encrypted] of Object.entries(data)) {
        const decrypted = await decryptData(encrypted, window.masterKey);
        const li = document.createElement("li");
        li.textContent = `${site}: ${decrypted.user} / ${decrypted.pass}`;
        list.appendChild(li);
      }
    });
  }
  