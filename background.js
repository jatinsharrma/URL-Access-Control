// Configuration - Update these URLs according to your needs
const CONFIG = {
    SOURCE_URL: 'https://google.com', // URL A - the source URL
    PROTECTED_URLS: [ // URL B(s) - the protected URLs
        'https://silicongarage.in',
        'http://silicongarage.in'
    ],
    ACCESS_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
    CHECK_INTERVAL: 60 * 1000, // Check every minute
    BLOCK_DIRECT_ACCESS: true // Always block direct access
};

// Store for tracking authorized sessions
let authorizedSessions = new Map();
let timers = new Map();

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0) { // Main frame only
        handleNavigation(details);
    }
});

// Listen for tab updates - this is crucial for catching direct navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
        console.log('Tab updated:', tab.url);

        if (isProtectedUrl(tab.url)) {
            console.log('Protected URL detected in tab update');
            // Check access immediately
            setTimeout(() => {
                checkReferrerAndAuthorize(tabId, tab.url, tab);
            }, 300);
        }
    }
});

// Listen for tab removal to clean up timers
chrome.tabs.onRemoved.addListener((tabId) => {
    cleanupSession(tabId);
});

function handleNavigation(details) {
    const { tabId, url } = details;

    console.log('Navigation detected:', url, 'Is protected:', isProtectedUrl(url));

    // Check if navigating to a protected URL
    if (isProtectedUrl(url)) {
        console.log('Protected URL detected, checking access...');
        // Small delay to ensure page starts loading
        setTimeout(() => {
            chrome.tabs.get(tabId, (tab) => {
                if (chrome.runtime.lastError) return;
                checkReferrerAndAuthorize(tabId, url, tab);
            });
        }, 200);
    } else if (isSourceUrl(url)) {
        // User is on source URL - prepare for potential redirect
        console.log('Source URL detected, preparing for redirect...');
        prepareForRedirect(tabId);
    }
}

function checkReferrerAndAuthorize(tabId, url, tab) {
    console.log('Checking referrer for tab', tabId, 'URL:', url);

    // First check if session is already authorized
    if (isSessionAuthorized(tabId, url)) {
        console.log('Session already authorized for', url);
        return;
    }

    // Execute content script to get referrer
    chrome.tabs.sendMessage(tabId, { action: 'getReferrer' }, (response) => {
        if (chrome.runtime.lastError) {
            console.log('Error getting referrer, blocking access:', chrome.runtime.lastError);
            blockAccess(tabId);
            return;
        }

        if (!response) {
            console.log('No response from content script, trying again...');
            // Try once more after a longer delay
            setTimeout(() => {
                chrome.tabs.sendMessage(tabId, { action: 'getReferrer' }, (retryResponse) => {
                    if (chrome.runtime.lastError || !retryResponse) {
                        console.log('Still no response, blocking access');
                        blockAccess(tabId);
                        return;
                    }
                    processReferrerResponse(tabId, url, retryResponse);
                });
            }, 1000);
            return;
        }

        processReferrerResponse(tabId, url, response);
    });
}

function processReferrerResponse(tabId, url, response) {
    const referrer = response?.referrer || '';

    console.log('Processing referrer response:', {
        url: url,
        referrer: referrer,
        isValidReferrer: isValidReferrer(referrer),
        isSessionAuthorized: isSessionAuthorized(tabId, url)
    });

    // Check if referred from source URL
    if (isValidReferrer(referrer)) {
        console.log('Valid referrer found, authorizing access');
        authorizeAccess(tabId, url);
    } else {
        console.log('Invalid or missing referrer, blocking access');
        blockAccess(tabId);
    }
}

function isProtectedUrl(url) {
    if (!url) return false;

    return CONFIG.PROTECTED_URLS.some(protectedUrl => {
        try {
            const protectedDomain = new URL(protectedUrl).hostname;
            const currentDomain = new URL(url).hostname;

            // Check exact match or subdomain match
            return currentDomain === protectedDomain ||
                currentDomain.endsWith('.' + protectedDomain) ||
                url.startsWith(protectedUrl);
        } catch (e) {
            // Fallback to simple string matching
            return url.includes(protectedUrl) || url.includes(protectedUrl.replace('https://', '').replace('http://', ''));
        }
    });
}

function isSourceUrl(url) {
    return url.startsWith(CONFIG.SOURCE_URL);
}

function isValidReferrer(referrer) {
    if (!referrer) {
        console.log('No referrer provided');
        return false;
    }

    const isValid = referrer.includes('google.com') || referrer.includes('www.google.com');
    console.log('Referrer validation:', referrer, '→', isValid);
    return isValid;
}

function prepareForRedirect(tabId) {
    // Mark this tab as potentially redirecting from source
    chrome.storage.session.set({
        [`redirect_${tabId}`]: {
            timestamp: Date.now(),
            prepared: true
        }
    });
}

function isSessionAuthorized(tabId, url) {
    const domain = new URL(url).hostname;
    return authorizedSessions.has(`${tabId}_${domain}`);
}

function authorizeAccess(tabId, url) {
    const domain = new URL(url).hostname;
    const sessionKey = `${tabId}_${domain}`;

    // Clear any existing timer for this session
    if (timers.has(sessionKey)) {
        clearTimeout(timers.get(sessionKey));
    }

    // Store authorization
    authorizedSessions.set(sessionKey, {
        authorizedAt: Date.now(),
        domain: domain,
        tabId: tabId
    });

    // Set timer to revoke access
    const timer = setTimeout(() => {
        revokeAccess(tabId, domain);
    }, CONFIG.ACCESS_DURATION);

    timers.set(sessionKey, timer);

    console.log(`Access authorized for tab ${tabId} to domain ${domain}`);
}

function revokeAccess(tabId, domain) {
    const sessionKey = `${tabId}_${domain}`;

    // Remove authorization
    authorizedSessions.delete(sessionKey);
    timers.delete(sessionKey);

    // Check if tab still exists and is on protected domain
    chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) return;

        if (tab.url && new URL(tab.url).hostname.includes(domain)) {
            // Close tab or show error page
            showErrorPage(tabId);
        }
    });

    console.log(`Access revoked for tab ${tabId} to domain ${domain}`);
}

function blockAccess(tabId) {
    showErrorPage(tabId);
}

function showErrorPage(tabId) {
    const errorUrl = chrome.runtime.getURL('error.html');
    chrome.tabs.update(tabId, { url: errorUrl });
}

function cleanupSession(tabId) {
    // Clean up all sessions and timers for this tab
    for (let [key, session] of authorizedSessions.entries()) {
        if (session.tabId === tabId) {
            authorizedSessions.delete(key);
            if (timers.has(key)) {
                clearTimeout(timers.get(key));
                timers.delete(key);
            }
        }
    }
}

// Additional listener for web requests to catch all navigation attempts
chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId === 0) { // Main frame only
        const { tabId, url } = details;
        console.log('Navigation committed:', url);

        if (isProtectedUrl(url)) {
            console.log('Protected URL navigation committed, double-checking access...');
            setTimeout(() => {
                if (!isSessionAuthorized(tabId, url)) {
                    checkReferrerAndAuthorize(tabId, url, null);
                }
            }, 100);
        }
    }
});

// Periodic cleanup of expired sessions
setInterval(() => {
    const now = Date.now();
    for (let [key, session] of authorizedSessions.entries()) {
        if (now - session.authorizedAt > CONFIG.ACCESS_DURATION) {
            revokeAccess(session.tabId, session.domain);
        }
    }
}, CONFIG.CHECK_INTERVAL);