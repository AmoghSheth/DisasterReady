# Mobile Development Guide

## Automatic Mobile Viewport

The app is now configured to automatically display in a **mobile phone aspect ratio** (430px width, centered) when you run the dev server.

## How to Run

```bash
npm run dev
```

The browser will automatically open and the app will be constrained to a mobile viewport with:
- **Width**: 430px (iPhone 14 Pro Max size)
- **Centered**: On your screen with a subtle shadow
- **Responsive**: On actual mobile devices, the constraint is removed

## Mobile Viewport Features

- ✅ **Auto-centered layout**: App appears in the center of your browser
- ✅ **Phone dimensions**: 430px max-width simulates a modern smartphone
- ✅ **Drop shadow**: Visual border helps distinguish the mobile viewport
- ✅ **Responsive override**: On screens ≤430px, constraints are removed for real mobile testing

## Chrome DevTools Mobile Emulation (Optional)

For more advanced mobile testing with touch events and device-specific features:

1. Open Chrome DevTools (F12 or Cmd+Option+I)
2. Click the device toggle button (Cmd+Shift+M)
3. Select a device from the dropdown (iPhone 14 Pro, Pixel 7, etc.)
4. Test with different orientations and network conditions

## Testing on Real Devices

To test on your phone:

1. Find your computer's local IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Make sure your phone is on the same WiFi network

3. Open your phone's browser and navigate to:
   ```
   http://[YOUR_IP]:8080
   ```

## Removing Mobile Constraints

If you want to remove the mobile viewport constraint:

1. Open `src/index.css`
2. Remove or comment out the `#root` max-width styles (lines 68-81)
3. Restart your dev server

## Viewport Dimensions

Current mobile constraint:
- **Width**: 430px (iPhone 14 Pro Max)
- **Height**: Auto (full viewport height)

To change the width, edit the `max-width` value in `src/index.css`.
