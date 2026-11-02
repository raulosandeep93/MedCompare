// MedCompare Extension — Service Worker (background.js)
// Handles messages from content scripts and popup

const API_BASE = 'https://medcompare-lac3.onrender.com/api';

// Listen for messages from content.js or popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SEARCH_MEDICINE') {
    const { medicineName, pincode } = message;
    fetchMedicineComparison(medicineName, pincode)
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Keep message channel open for async response
  }

  if (message.type === 'GET_TAB_INFO') {
    sendResponse({ tabId: sender.tab?.id });
    return false;
  }
});

async function fetchMedicineComparison(query, pincode = '560001') {
  const url = `${API_BASE}/search?q=${encodeURIComponent(query)}&pincode=${encodeURIComponent(pincode)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Unknown API error');
  }
  return json.data;
}
