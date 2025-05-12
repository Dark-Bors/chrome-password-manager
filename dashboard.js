document.addEventListener("DOMContentLoaded", () => {
  // Show PIN or master key section on load
  chrome.storage.local.get("encryptedMasterKey", (res) => {
    if (res.encryptedMasterKey) {
      document.getElementById("pinSection").style.display = "block";
    } else {
      document.getElementById("authSection").style.display = "block";
    }
  });

  // Log debug messages to UI
  function logDebug(msg) {
    const consoleBox = document.getElementById("debugConsole");
    consoleBox.textContent += `\n${msg}`;
  }

  // Master Key Unlock
  document.getElementById("loginBtn").onclick = async () => {
    const key = document.getElementById("masterKey").value;
    if (!key) return;

    chrome.runtime.sendMessage({ type: "setMasterKey", key }, async (res) => {
      if (res.success) {
        logDebug("🔐 Master key set successfully.");

        // Save encrypted version of master key using PIN
        const pin = prompt("Set a 6-digit PIN to unlock faster next time:");
        if (pin && pin.length === 6) {
          const encryptedMasterKey = await encryptMasterKey(key, pin);
          await chrome.storage.local.set({ encryptedMasterKey });
          logDebug("🔐 Master key saved with PIN.");
        }

        document.getElementById("authSection").style.display = "none";
        document.getElementById("mainSection").style.display = "block";
        loadCredentials(key);
      } else {
        logDebug("❌ Failed to set master key.");
      }
    });
  };

  // PIN Unlock
  document.getElementById("pinUnlockBtn").onclick = async () => {
    const pin = document.getElementById("pin").value;
    if (!pin) return;

    chrome.storage.local.get("encryptedMasterKey", async (res) => {
      try {
        const masterKey = await decryptMasterKey(res.encryptedMasterKey, pin);

        chrome.runtime.sendMessage({ type: "setMasterKey", key: masterKey }, (res) => {
          if (res.success) {
            logDebug("🔓 Unlocked via PIN");
            document.getElementById("pinSection").style.display = "none";
            document.getElementById("mainSection").style.display = "block";
            loadCredentials(masterKey);
          }
        });
      } catch (e) {
        logDebug("❌ Wrong PIN!");
      }
    });
  };

  // Save Credential
  document.getElementById("saveBtn").onclick = async () => {
    chrome.runtime.sendMessage({ type: "getMasterKey" }, async (res) => {
      const key = res.key;
      if (!key) return logDebug("🔒 Master key missing!");

      const url = document.getElementById("url").value;
      const hostname = new URL(url).hostname; 

      const user = document.getElementById("username").value;
      const pass = document.getElementById("password").value;

      const encrypted = await encryptData({ url, user, pass }, key);
      await chrome.storage.local.set({ [hostname]: encrypted });
      logDebug(`✅ Saved credentials for ${hostname}`);
      loadCredentials(key);
    });
  };

  // Load Saved Credentials
  function loadCredentials(key) {
    chrome.storage.local.get(null, async (data) => {
      const list = document.getElementById("siteList");
      list.innerHTML = '';

      for (const [site, encrypted] of Object.entries(data)) {
        if (site === "encryptedMasterKey") continue;

        try {
          const decrypted = await decryptData(encrypted, key);
          const li = document.createElement("li");
          li.textContent = `${site} → ${decrypted.user} / ${decrypted.pass}`;
          list.appendChild(li);
        } catch (e) {
          logDebug(`❗ Failed to decrypt "${site}" — possibly wrong key or invalid data.`);
        }
      }
    });
  }
});
