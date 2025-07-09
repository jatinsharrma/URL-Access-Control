// Content script for protected URLs
// This script validates tokens and blocks access if invalid


async function validateToken(token) {
  try {
    const result = await chrome.storage.local.get(["sharedVar"]);
    const sharedVar = result.sharedVar;
    return token === sharedVar;
  } catch (e) {
    console.error("Error in validateToken:", e);
    return false;
  }
}

// Function to extract token from URL
function extractTokenFromUrl() {
  let hash = window.location.hash;
  hash = hash.split('|')[0].slice(1,);
  if (!hash) return null;
  return hash;
}

// Function to show error page
function showErrorPage() {
  // Stop all loading
  window.stop();
  
  // Clear the page
  document.documentElement.innerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Access Denied</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
        }
        .error-container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 500px;
        }
        .error-icon {
          font-size: 48px;
          color: #e74c3c;
          margin-bottom: 20px;
        }
        .error-title {
          font-size: 24px;
          color: #333;
          margin-bottom: 16px;
        }
        .error-message {
          font-size: 16px;
          color: #666;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .error-code {
          font-size: 12px;
          color: #999;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-icon">🚫</div>
        <div class="error-title">Access Denied</div>
        <div class="error-message">
          This page can only be accessed through authorized navigation from the <strong>AIR VISIOIN INFINITY RUDRA KAVACH</strong>.
          <br><br>
          Please return to the <strong>AIR VISIOIN INFINITY RUDRA KAVACH</strong> and use the provided links.
        </div>
        <div class="error-code">Error Code: UNAUTHORIZED_ACCESS</div>
      </div>
    </body>
    </html>
  `;
}

// Function to validate access
async function validateAccess() {
  const currentUrl = window.location.href;
  
  // Extract token from URL
  const token = extractTokenFromUrl();
  
  if (!token) {
    console.log('No no don`t do this, i know you are trying a way around.');
    showErrorPage();
    return;
  }
  
  // Validate token
  if (!(await validateToken(token))) {
    console.log('Hmmmm.... something is fishy.');
    showErrorPage();
    return;
  }
  
  console.log('Access granted - valid token found');
  
  // Clean up the URL by removing the token (optional)
  if (window.location.hash.includes('token=')) {
    const newHash = window.location.hash.replace(/[?&]?token=[^&]*/, '').replace(/^#&/, '#');
    history.replaceState(null, null, window.location.pathname + window.location.search + newHash);
  }
}

// Check access immediately if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(validateAccess, 100);
  });
} else {
  setTimeout(validateAccess, 100);
}

// Also check on any navigation within the page
window.addEventListener('popstate', validateAccess);
window.addEventListener('hashchange', validateAccess);	