async function encryptData(data, key) {
    const text = JSON.stringify(data);
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw", enc.encode(key), { name: "PBKDF2" }, false, ["deriveKey"]
    );
    const derivedKey = await window.crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: enc.encode("salt"), iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv }, derivedKey, enc.encode(text)
    );
    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(ciphertext))
    };
  }
  
  async function decryptData(encrypted, key) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw", enc.encode(key), { name: "PBKDF2" }, false, ["deriveKey"]
    );
    const derivedKey = await window.crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: enc.encode("salt"), iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    const iv = new Uint8Array(encrypted.iv);
    const data = new Uint8Array(encrypted.data);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv }, derivedKey, data
    );
    return JSON.parse(new TextDecoder().decode(decrypted));
  }
  
  async function encryptMasterKey(masterKey, pin) {
    return encryptData({ masterKey }, pin);
  }
  
  async function decryptMasterKey(encrypted, pin) {
    const result = await decryptData(encrypted, pin);
    return result.masterKey;
  }
  