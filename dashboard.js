function logDebug(msg) {
  const consoleBox = document.getElementById("debugConsole");
  consoleBox.textContent += `\n${msg}`;
}

document.getElementById("loginBtn").onclick = async () => {
  const key = document.getElementById("masterKey").value;
  if (!key) return;

  chrome.runtime.sendMessage({ type: "setMasterKey", key }, (res) => {
    if (res.success) {
      logDebug("🔐 Master key set successfully.");
      document.getElementById("authSection").style.display = "none";
      document.getElementById("mainSection").style.display = "block";
      loadCredentials(key);
    } else {
      logDebug("❌ Failed to set master key.");
    }
  });
};

document.getElementById("saveBtn").onclick = async () => {
  chrome.runtime.sendMessage({ type: "getMasterKey" }, async (res) => {
    const key = res.key;
    if (!key) return logDebug("🔒 Master key missing!");

    const site = document.getElementById("site").value;
    const url = document.getElementById("url").value;
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    const encrypted = await encryptData({ url, user, pass }, key);
    await chrome.storage.local.set({ [site]: encrypted });
    logDebug(`✅ Saved credentials for ${site}`);
    loadCredentials(key);
  });
};

function loadCredentials(key) {
  chrome.storage.local.get(null, async (data) => {
    const list = document.getElementById("siteList");
    list.innerHTML = '';

    for (const [site, encrypted] of Object.entries(data)) {
      // Ignore system keys like masterKey
      if (site === "masterKey") continue;

      try {
        const decrypted = await decryptData(encrypted, key);
        const li = document.createElement("li");
        li.textContent = `${site}: ${decrypted.user} / ${decrypted.pass}`;
        list.appendChild(li);
      } catch (e) {
        logDebug(`❗ Failed to decrypt "${site}" — possibly wrong key or invalid data.`);
      }
    }
  });
}
