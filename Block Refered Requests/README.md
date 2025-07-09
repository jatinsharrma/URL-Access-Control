# URL Access Controller Chrome Extension

A Chrome extension that controls access to specific URLs based on referrer validation and time-based sessions.

## Features

- ✅ **Referrer-based Access Control**: Users can only access URL B when redirected from URL A
- ✅ **Time-based Sessions**: Access remains valid for 15-30 minutes after initial redirect
- ✅ **Multiple Protected URLs**: Support for multiple protected URLs (URL B can be n in number)
- ✅ **Subdomain Support**: Users can navigate within subdomains of protected sites
- ✅ **Auto-expiration**: Sessions automatically expire after the configured time
- ✅ **Error Page**: Custom error page shown for unauthorized access attempts
- ✅ **Tab Management**: Automatically closes tabs or shows error when access expires

## How It Works

1. **Initial Access**: User must be redirected from URL A to access any URL B
2. **Session Creation**: Upon valid redirect, a 15-30 minute session is created
3. **Subdomain Navigation**: Users can freely navigate within the protected domain during the session
4. **Automatic Cleanup**: Sessions expire automatically, closing tabs or showing error pages

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. Download or clone all the extension files to a folder
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension will be installed and active

### Method 2: Pack and Install (Production)

1. In Chrome extensions page, click "Pack extension"
2. Select the extension folder
3. Install the generated `.crx` file

## Configuration

### Step 1: Update URLs in `background.js`

Edit the `CONFIG` object in `background.js`:

```javascript
const CONFIG = {
  SOURCE_URL: 'https://your-source-domain.com', // Replace with your URL A
  PROTECTED_URLS: [ // Replace with your URL B(s)
    'https://your-protected-site1.com',
    'https://your-protected-site2.com',
    'https://subdomain.protected-site.com'
  ],
  ACCESS_DURATION: 30 * 60 * 1000, // 30 minutes
  CHECK_INTERVAL: 60 * 1000 // Check every minute
};
```

### Step 2: Update Content Script

In `content.js`, update the referrer validation:

```javascript
function isValidReferrer(referrer) {
  if (!referrer) return false;
  return referrer.includes('your-source-domain.com'); // Update this
}
```

### Step 3: Update Error Page

In `error.html`, update the source URL:

```javascript
const SOURCE_URL = 'https://your-source-domain.com';
```

## File Structure

```
chrome-extension/
│
├── manifest.json          # Extension manifest and permissions
├── background.js          # Main logic and session management
├── content.js            # Content script for referrer checking
├── error.html            # Error page for unauthorized access
├── config.js             # Configuration file (optional)
└── README.md             # This file
```

## Key Components

### Background Script (`background.js`)
- Monitors navigation events
- Manages authorized sessions
- Handles timer-based access control
- Controls tab behavior

### Content Script (`content.js`)
- Captures referrer information
- Validates access permissions
- Monitors URL changes within pages

### Error Page (`error.html`)
- Professional error interface
- Options to redirect to authorized source
- Optional auto-close functionality

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `SOURCE_URL` | The authorized source URL (URL A) | Required |
| `PROTECTED_URLS` | Array of protected URLs (URL B) | Required |
| `ACCESS_DURATION` | Session duration in milliseconds | 30 minutes |
| `CHECK_INTERVAL` | How often to check for expired sessions | 1 minute |

## Security Features

- **Referrer Validation**: Checks document.referrer for initial access
- **Session Storage**: Uses secure session storage for state management
- **Timer-based Expiration**: Automatic session cleanup
- **Tab Monitoring**: Tracks and manages access across browser tabs
- **URL Pattern Matching**: Flexible URL matching for subdomains

## Testing

1. **Set up test URLs**: Configure your source and protected URLs
2. **Test Direct Access**: Try accessing protected URL directly (should show error)
3. **Test Valid Redirect**: Navigate from source URL to protected URL (should work)
4. **Test Subdomain Navigation**: Navigate within protected domain (should work)
5. **Test Expiration**: Wait for session to expire (should show error or close tab)

## Troubleshooting

### Common Issues

**Extension not working:**
- Check that all URLs in configuration are correct
- Verify extension is enabled in Chrome
- Check browser console for errors

**Error page not showing:**
- Ensure `error.html` is in the extension directory
- Check that `web_accessible_resources` is properly configured in manifest

**Session not persisting:**
- Verify `storage` permission is granted
- Check that timer logic is functioning correctly

### Debug Mode

Enable debug mode by setting `DEBUG_MODE: true` in the configuration to see console logs.

## Permissions Required

- `tabs`: To manage and monitor browser tabs
- `storage`: To store session information
- `webNavigation`: To detect navigation events
- `activeTab`: To interact with current tab
- `host_permissions`: To access all websites for monitoring

## Browser Compatibility

- Chrome 88+
- Chromium-based browsers (Edge, Brave, etc.)
- Manifest V3 compatible

## Security Considerations

- Sessions are stored in memory and automatically cleaned up
- No persistent storage of sensitive information
- Timer-based access ensures sessions don't persist indefinitely
- Referrer checking provides initial validation

## Support

For issues or questions:

1. Check the browser console for error messages
2. Verify all configuration URLs are correct
3. Test with simple HTTP/HTTPS URLs first
4. Ensure all required permissions are granted

## License

This extension is provided as-is for educational an