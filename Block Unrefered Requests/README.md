# URL Access Controller Chrome Extension

## Overview
This Chrome extension controls access to specific URLs based on token validation and referrer checks. It ensures secure navigation and prevents unauthorized access to protected pages.

## Features
- Validates tokens passed in the URL.
- Blocks access to protected pages if the token is invalid or missing.
- Displays a custom error page for unauthorized access.
- Added functionality to automatically delete the stored session token after 15 minutes of inactivity. Users will need to navigate to the root URL to reinitialize their session.
- 
- Supports two types of content scripts:
  - `content-script-root.js`: Handles token validation for the root website.
  - `content-script-protected.js`: Manages session storage for protected URLs.

## File Structure
- **`content-script-root.js`**: Sets a share variable which will be used by content-script-protected.js.
- **`content-script-protected.js`**: Checks if website have valid token, if not display error message.
- **`manifest.json`**: Defines the extension's metadata, permissions, and content script configurations.
- **`background.js`**: Controls the shared tokeen expiry.
- **`README.md`**: Documentation for the extension.

## Installation
1. Clone the repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top-right corner.
4. Click "Load unpacked" and select the project folder.

## Usage
- Navigate to `https://ROOTURL.com` to initiate shared variable.
- Access protected URLs like `https://URL1.com` with valid tokens stored in URL

## Permissions
The extension requires the following permissions:
- `activeTab`: To interact with the currently active tab.
- `storage`: To store and retrieve tokens.
- `tabs`: To manage browser tabs.
- `webNavigation`: To allows the extension to track and respond to navigation events within the browser
- `alarms`: To allow it to schedule code to run at a specific time or periodically

## Adding Multiple URLs to the Manifest

The `matches` property in the `manifest.json` file can take multiple URLs in a single array. This approach simplifies configuration and reduces redundancy.

## Chrome Extension Configuration

This section provides detailed steps to configure the Chrome extension by modifying the `manifest.json` file. Follow the steps below to set up the root URL and protected URLs correctly.

### Configuration Steps

All configuration changes are made in the `manifest.json` file. Ensure you have a text editor ready to edit this file.

#### Step 1: Configure the Root URL
Locate the `content_scripts` section in `manifest.json` that specifies the root URL. Replace `https://ROOTURL.com/*` with your actual root URL.

```json
{
  "content_scripts": [
    {
      "matches": ["https://ROOTURL.com/*"],
      "js": ["content-script-root.js"],
      "run_at": "document_start"
    }
  ]
}
```

**Example**:
If your root URL is `https://example.com`, update the section as follows:
```json
{
  "content_scripts": [
    {
      "matches": ["https://example.com/*"],
      "js": ["content-script-root.js"],
      "run_at": "document_start"
    }
  ]
}
```

#### Step 2: Add Protected URLs
Locate the `content_scripts` section in `manifest.json` that defines protected URLs accessible only from the root URL. Replace `https://URL1.com/*` and other placeholders with the actual URLs. Separate each URL with a comma, ensuring **no comma** follows the last URL.

```json
{
  "content_scripts": [
    {
      "matches": [
        "https://URL1.com/*",
        "https://URL2.com/*"
      ],
      "js": ["content-script-protected.js"],
      "run_at": "document_start"
    }
  ]
}
```

**Example**:
If your protected URLs are `https://app1.com/*` and `https://app2.com/*`, update the section as follows:
```json
{
  "content_scripts": [
    {
      "matches": [
        "https://app1.com/*",
        "https://app2.com/*"
      ],
      "js": ["content-script-protected.js"],
      "run_at": "document_start"
    }
  ]
}
```

**Note**: Do not include a trailing comma after the last URL to avoid JSON syntax errors.

#### Step 3: Update Host Permissions
Locate the `host_permissions` section in `manifest.json`. Add all URLs from Step 1 (root URL) and Step 2 (protected URLs) to this section. Ensure each URL is listed correctly and separated by commas.

```json
{
  "host_permissions": [
    "https://ROOTURL.com/*",
    "https://URL1.com/*",
    "https://URL2.com/*"
  ]
}
```

**Example**:
Using the URLs from the previous examples (`https://example.com/*`, `https://app1.com/*`, `https://app2.com/*`), update the section as follows:
```json
{
  "host_permissions": [
    "https://example.com/*",
    "https://app1.com/*",
    "https://app2.com/*"
  ]
}
```

### Important Notes
- Ensure all URLs include the `https://` prefix and end with `/*` to match all subpaths.
- Validate the `manifest.json` file for correct JSON syntax after making changes to avoid errors when loading the extension.
- Test the extension in Chrome after updating the configuration to confirm that the scripts run as expected on the specified URLs.