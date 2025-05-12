(async () => {
  // Try to detect login input fields
  const usernameField = document.querySelector(
    'input[type="email"], input[type="text"][autocomplete*="user"], input[name*="user"], input[name*="email"]'
  );
  const passwordField = document.querySelector(
    'input[type="password"]'
  );

  if (!usernameField || !passwordField) {
    console.log("[Autofill] No login fields found.");
    return;
  }

  // Ask background for master key
  chrome.runtime.sendMessage({ type: "getMasterKey" }, async (res) => {
    const key = res.key;
    if (!key) {
      console.warn("[Autofill] No master key available.");
      return;
    }

    const hostname = window.location.hostname;

    // Load stored encrypted credentials
    chrome.storage.local.get([hostname], async (result) => {
      const encrypted = result[hostname];
      if (!encrypted) {
        console.log(`[Autofill] No stored credentials for ${hostname}`);
        return;
      }

      try {
        const creds = await decryptData(encrypted, key);
        usernameField.value = creds.user;
        passwordField.value = creds.pass;
        console.log("[Autofill] Credentials inserted.");
      } catch (e) {
        console.warn("[Autofill] Failed to decrypt credentials.", e);
      }
    });
  });

  // Optional: detect login submission and offer to save
  document.addEventListener("submit", async (e) => {
    const form = e.target;
    const user = form.querySelector('input[type="email"], input[type="text"]')?.value;
    const pass = form.querySelector('input[type="password"]')?.value;

    if (user && pass) {
      const save = confirm("Save updated login?");
      if (save) {
        chrome.runtime.sendMessage({
          type: "saveCredential",
          payload: {
            site: window.location.hostname,
            user,
            pass
          }
        });
      }
    }
  }, true);
})();
