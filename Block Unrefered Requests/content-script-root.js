// console.log("Content script loaded on", window.location.href);

setInterval(() => {
  if (document.visibilityState === 'visible' && window.location.pathname === '/dashboard' && sessionStorage.token) {
    console.log("Periodic check: setting sharedVar:", sessionStorage.token);
    // chrome.storage.local.set({ 'sharedVar': sessionStorage.token });
  } else {
    // console.log("Periodic check: conditions not met");
  }
}, 60000); // Runs every 1 minute (60000 ms)