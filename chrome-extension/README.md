# MedCompare Chrome Extension

> A Buyhatke-style Chrome extension that scans medicine product pages across all 8 Indian pharmacy platforms and shows instant price comparison — without leaving the current site.

## Features

- **Auto-detection**: Detects when you're on a medicine product page on any of the 8 supported pharmacy sites
- **Floating "Compare Prices" button**: Slides in from the right edge — click to trigger comparison
- **Sliding sidebar panel**: Shows live prices from all 8 platforms, lowest price badge, unit prices (₹/tablet), delivery speeds, and generic savings alert
- **Toolbar popup**: Manual search for any medicine, even without being on a pharmacy site
- **Quick sample searches**: Pre-loaded popular medicines (Dolo 650, Pan 40, etc.)
- **Direct buy links**: One-click links to the store with the best price
- **SPA support**: Works on React/Next.js SPAs (1mg, Zepto) that update content without a full page reload

## Supported Sites

| Site | Domain |
|------|--------|
| Apollo Pharmacy | apollopharmacy.in |
| PharmEasy | pharmeasy.in |
| Tata 1mg | 1mg.com |
| Netmeds | netmeds.com |
| Zepto | zepto.com |
| Amazon Pharmacy | amazon.in |
| Truemeds | truemeds.in |
| PlatinumRx | platinumrx.in |

## Installation (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `chrome-extension/` folder from the MedCompare repository
5. The MedCompare icon (💊) will appear in your Chrome toolbar

## Usage

### Auto-mode (Recommended)
1. Browse to any medicine product page on a supported pharmacy site
2. A green **"Compare Prices"** button will slide in from the bottom-right after ~1 second
3. Click it to open the price comparison sidebar
4. The sidebar fetches live prices from all 8 platforms via the MedCompare API

### Manual mode (Toolbar popup)
1. Click the MedCompare 💊 icon in the Chrome toolbar
2. If on a pharmacy page, the detected medicine name shows automatically
3. Click **"Compare"** or type any medicine name in the search box
4. Quick-search chips for common medicines (Dolo 650, Pan 40, etc.)

## API Backend

The extension calls: `https://medcompare-lac3.onrender.com/api/search?q=MEDICINE_NAME&pincode=560001`

To change the API URL or add your own pincode support, update `API_BASE` in:
- `background.js`
- `popup.js`

## Development

No build step required — this is plain HTML/CSS/JavaScript Manifest V3.

After making changes:
1. Go to `chrome://extensions/`
2. Click the refresh icon on the MedCompare extension card
3. Reload the pharmacy page

## Files

```
chrome-extension/
├── manifest.json     # MV3 manifest — permissions, content scripts
├── background.js     # Service worker — fetches MedCompare API
├── content.js        # Injected into pharmacy pages — extracts medicine name, shows sidebar
├── content.css       # Sidebar, floating button, and result styles
├── popup.html        # Toolbar popup UI
├── popup.js          # Popup logic — detection + manual search
├── popup.css         # Popup styles
├── README.md
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```
