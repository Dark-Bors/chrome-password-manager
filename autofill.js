chrome.runtime.sendMessage({ type: "getMasterKey" }, async (res) => {
  const masterKey = res.key;
  if (!masterKey) return;

  const siteKey = Object.keys(localStorage).find(k => window.location.href.includes(k)) || "Polarion";

  chrome.storage.local.get(siteKey, async (data) => {
    if (!data[siteKey]) return;

    try {
      const decrypted = await decryptData(data[siteKey], masterKey);
      const userInput = document.querySelector("input[type='text'], input[name*='user']");
      const passInput = document.querySelector("input[type='password']");
      if (userInput && passInput) {
        userInput.value = decrypted.user;
        passInput.value = decrypted.pass;
        console.log("[Autofill] Credentials inserted.");
      }
    } catch (e) {
      console.warn("[Autofill] Failed to decrypt credentials", e);
    }
  });
});
