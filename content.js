document.addEventListener('submit', async (e) => {
    const form = e.target;
    const username = form.querySelector('input[type="text"], input[type="email"]')?.value;
    const password = form.querySelector('input[type="password"]')?.value;
  
    if (username && password) {
      const confirmed = confirm("Save this login?");
      if (confirmed) {
        // Send message to background or popup to save
        chrome.runtime.sendMessage({
          type: "saveCredential",
          payload: { site: location.hostname, user: username, pass: password }
        });
      }
    }
  }, true);
  