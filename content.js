// Content script to handle referrer checking and page validation
(function () {
    'use strict';

    // Store referrer information
    const pageReferrer = document.referrer;
    const currentUrl = window.location.href;

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getReferrer') {
            sendResponse({
                referrer: pageReferrer,
                url: currentUrl,
                timestamp: Date.now()
            });
        } else if (request.action === 'checkAccess') {
            // Additional validation can be performed here
            const hasValidAccess = validateAccess();
            sendResponse({ hasValidAccess });
        }
    });

    function validateAccess() {
        // Check if we have valid session storage or other indicators
        // This is a backup validation method
        const sessionData = sessionStorage.getItem('validAccess');
        if (sessionData) {
            const data = JSON.parse(sessionData);
            const now = Date.now();
            // Check if session is still valid (within time limit)
            return (now - data.timestamp) < (30 * 60 * 1000); // 30 minutes
        }

        // Check if referrer is valid
        return isValidReferrer(pageReferrer);
    }

    function isValidReferrer(referrer) {
        if (!referrer) return false;
        // This should match the source URL from your configuration
        return referrer.includes('example-source.com'); // Update this to match your source URL
    }

    // Store valid access in session storage when page loads with valid referrer
    if (isValidReferrer(pageReferrer)) {
        sessionStorage.setItem('validAccess', JSON.stringify({
            timestamp: Date.now(),
            referrer: pageReferrer
        }));
    }

    // Additional security: Monitor for manual URL changes
    let lastUrl = currentUrl;
    const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            // Notify background script of URL change
            chrome.runtime.sendMessage({
                action: 'urlChanged',
                newUrl: lastUrl,
                referrer: pageReferrer
            });
        }
    });

    observer.observe(document, {
        subtree: true,
        childList: true
    });

    // Handle page visibility changes (when user switches tabs)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // Re-validate access when tab becomes visible
            chrome.runtime.sendMessage({
                action: 'validateAccess',
                url: window.location.href
            });
        }
    });

})();