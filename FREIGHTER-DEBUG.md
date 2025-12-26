# Freighter Detection Issues - Debugging Guide

## Current Status
Freighter extension is installed but NOT being detected by the application.

## Symptoms
- `window.freighterApi` is `false`
- `window.stellar` is `false`
- Extension is installed and working in testnet

## Possible Causes

### 1. CSP (Content Security Policy) Blocking
**Check in browser console for CSP violations:**
- Open DevTools → Console tab
- Look for messages like: `Refused to execute inline script because it violates CSP`
- Look for: `Refused to connect to 'chrome-extension://...'`

**Current CSP:**
```
script-src 'self' 'unsafe-eval' 'unsafe-inline' chrome-extension: moz-extension: https:; 
connect-src 'self' https: wss: chrome-extension: moz-extension:;
```

### 2. Extension Permissions
**Verify Freighter has permission to run on your site:**
1. Right-click Freighter icon → "Manage extension"
2. Check "Site access" section
3. Should be "On all sites" or specifically allow `colmena-beta.vercel.app`

### 3. Manifest V3 Issues
Freighter might be using Manifest V3 which injects scripts differently.

**Check extension manifest:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Details" on Freighter
4. Check "Manifest version"

### 4. Timing Issues
Extension might inject after page load.

**Current retry mechanism:** 10 attempts over 1 second

### 5. Browser Compatibility
- Chrome/Brave: Should work
- Firefox: Uses different injection method
- Safari: Not supported

## Debugging Steps

### Step 1: Check Console for CSP Violations
```javascript
// Run in browser console
console.log('CSP Meta:', document.querySelector('meta[http-equiv="Content-Security-Policy"]'));
```

### Step 2: Check All Window Properties
```javascript
// Run in browser console
Object.keys(window).filter(k => 
  k.toLowerCase().includes('freighter') || 
  k.toLowerCase().includes('stellar') ||
  k.toLowerCase().includes('wallet')
);
```

### Step 3: Manual Freighter Test
```javascript
// Run in browser console AFTER page loads
setTimeout(() => {
  console.log('Freighter API:', window.freighterApi);
  console.log('Stellar:', window.stellar);
}, 5000);
```

### Step 4: Check Extension Content Scripts
1. Open DevTools
2. Go to Sources tab
3. Look for `chrome-extension://` entries
4. Check if Freighter scripts are loaded

### Step 5: Verify Extension is Active
1. Click Freighter icon
2. Should show your wallet
3. Check network is set to TESTNET
4. Try connecting to another dapp (e.g., Stellar Lab)

## Solutions

### Solution 1: Update Extension Permissions
```
1. chrome://extensions/
2. Find Freighter
3. Click "Details"
4. Site access → "On all sites"
5. Reload page
```

### Solution 2: Disable Other Extensions
Some extensions conflict with wallet extensions. Try disabling:
- Other crypto wallets
- Ad blockers (temporarily)
- Privacy extensions

### Solution 3: Clear Extension Cache
```
1. chrome://extensions/
2. Find Freighter
3. Click "Remove"
4. Reinstall from https://www.freighter.app/
5. Restore wallet with seed phrase
```

### Solution 4: Try Different Browser
Test in a clean browser profile:
```
1. Open Chrome/Brave in Incognito
2. Install Freighter
3. Visit site
4. Check if detected
```

## Expected Behavior

When working correctly, you should see:
```
🔍 Freighter Detection:
  - window.freighterApi: true
  - window.stellar: false (or true)
  - isInstalled: true
```

## Next Steps

1. **Check browser console for CSP violations**
2. **Verify extension permissions**
3. **Test in different browser/profile**
4. **Report findings**
