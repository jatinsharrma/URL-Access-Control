# URL Access Control Chrome Extensions

This project contains two Chrome extensions designed to control access to specific URLs based on different validation mechanisms. Each extension is implemented in its own directory with distinct features and functionalities.

## Extensions Overview

### 1. **Block Refered Requests**
- **Purpose**: Controls access to URLs based on referrer validation.
- **Features**:
  - Referrer-based access control: Users can only access URL B when redirected from URL A.
  - Time-based sessions: Access remains valid for 15-30 minutes after initial redirect.
  - Subdomain support: Users can navigate within subdomains of protected sites.
  - Auto-expiration: Sessions automatically expire after the configured time.
  - Custom error page for unauthorized access attempts.
  - Tab management: Automatically closes tabs or shows error when access expires.
- **Directory**: `Block Refered Requests/`

### 2. **Block Unrefered Requests**
- **Purpose**: Controls access to URLs based on token validation.
- **Features**:
  - Validates tokens passed in the URL.
  - Blocks access to protected pages if the token is invalid or missing.
  - Displays a custom error page for unauthorized access.
  - Supports two types of content scripts:
    - `content-script-root.js`: Handles token validation for the root website.
    - `content-script-protected.js`: Manages session storage for protected URLs.
- **Directory**: `Block Unrefered Requests/`

## Installation

### For Both Extensions
1. Clone the repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top-right corner.
4. Click "Load unpacked" and select the respective extension folder (`Block Refered Requests/` or `Block Unrefered Requests/`).

## Usage

### Block Refered Requests
- Navigate to URL A (e.g., `https://ROOT.com`) to initiate a session.
- Access protected URLs (e.g., `https://URL1.com`) within the session duration.

### Block Unrefered Requests
- Navigate to the root website (e.g., `https://ROOT.in`) to set the shared variable.
- Access protected URLs (e.g., `https://URL1.com`) with valid tokens stored in the URL.

## Configuration

### Block Refered Requests
- Update `CONFIG` in `background.js` to define source and protected URLs, session duration, and other settings.
- Modify `content.js` for referrer validation logic.
- Customize `error.html` for unauthorized access messages.

### Block Unrefered Requests
- Update `manifest.json` to define root and protected URLs.
- Customize `content-script-root.js` and `content-script-protected.js` for token validation logic.
- Modify `error.html` for unauthorized access messages.

## Permissions

Both extensions require the following permissions:
- `tabs`: To manage and monitor browser tabs.
- `storage`: To store session or token information.
- `webNavigation`: To detect navigation events.
- `activeTab`: To interact with the current tab.
- `host_permissions`: To access specified URLs.

## File Structure

## Security Considerations

- **Block Refered Requests**:
  - Referrer validation ensures initial access is authorized.
  - Sessions automatically expire after the configured duration.
  - No persistent storage of sensitive information.

- **Block Unrefered Requests**:
  - Token validation ensures secure navigation.
  - Unauthorized access is blocked with a custom error page.
  - Shared variables are securely stored using Chrome's local storage.

## License

This project is provided as-is for educational and non-commercial use. For commercial use or modifications, please contact the author.

## Support

For issues or questions:
1. Check the browser console for error messages.
2. Verify all configuration URLs are correct.
3. Test with simple HTTP/HTTPS URLs first.
4. Ensure all required permissions are granted.
