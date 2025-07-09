// Configuration file for URL Access Controller Extension
// Update these values according to your specific requirements

const EXTENSION_CONFIG = {
    // URL A - The source URL that users must come from
    SOURCE_URL: 'https://ROOT.com',

    // URL B(s) - The protected URLs that require authorization
    // These can be complete URLs or domain patterns
    PROTECTED_URLS: [
        'https://URL1.com',
        'https://URL2.com',
        // Add more protected URLs as needed
    ],

    // Time-based settings
    ACCESS_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
    CHECK_INTERVAL: 60 * 1000,       // Check every minute
    AUTO_CLOSE_DELAY: 30,            // Auto-close error page after 30 seconds (optional)

    // Security settings
    STRICT_DOMAIN_MATCHING: true,    // Require exact domain match vs partial match
    ALLOW_SUBDOMAINS: true,          // Allow access to subdomains of protected URLs

    // Error page settings
    ERROR_PAGE: {
        TITLE: 'Access Denied',
        MESSAGE: 'You don\'t have permission to access this page directly.',
        SHOW_AUTO_CLOSE_TIMER: false,  // Show countdown timer on error page
        REDIRECT_TO_SOURCE: true       // Show "Go to Source" button
    },

    // Development/Debug settings
    DEBUG_MODE: false,               // Enable console logging for debugging
    BYPASS_FOR_DEVELOPMENT: false    // Set to true to bypass restrictions during development
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EXTENSION_CONFIG;
}

// Make available globally for browser extension context
if (typeof window !== 'undefined') {
    window.EXTENSION_CONFIG = EXTENSION_CONFIG;
}

// Validation functions
const ConfigValidator = {
    validate: function () {
        const errors = [];

        if (!EXTENSION_CONFIG.SOURCE_URL || !this.isValidUrl(EXTENSION_CONFIG.SOURCE_URL)) {
            errors.push('SOURCE_URL must be a valid URL');
        }

        if (!Array.isArray(EXTENSION_CONFIG.PROTECTED_URLS) || EXTENSION_CONFIG.PROTECTED_URLS.length === 0) {
            errors.push('PROTECTED_URLS must be a non-empty array');
        }

        EXTENSION_CONFIG.PROTECTED_URLS.forEach((url, index) => {
            if (!this.isValidUrl(url)) {
                errors.push(`PROTECTED_URLS[${index}] is not a valid URL: ${url}`);
            }
        });

        if (EXTENSION_CONFIG.ACCESS_DURATION < 60000) { // Less than 1 minute
            errors.push('ACCESS_DURATION should be at least 60000ms (1 minute)');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    isValidUrl: function (string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
};

// Auto-validate configuration
if (EXTENSION_CONFIG.DEBUG_MODE) {
    const validation = ConfigValidator.validate();
    if (!validation.isValid) {
        console.error('Configuration validation failed:', validation.errors);
    } else {
        console.log('Configuration validation passed');
    }
}