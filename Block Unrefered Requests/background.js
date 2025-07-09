// Create a periodic alarm to trigger every 15 minutes
chrome.alarms.create('deleteSharedVar', { delayInMinutes: 15, periodInMinutes: 15 });

// Listen for the alarm event
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'deleteSharedVar') {
    try {
      // Check if 'sharedVar' exists in local storage
      const result = await chrome.storage.local.get('sharedVar');
      if (result.sharedVar !== undefined) {
        // Remove 'sharedVar' from local storage
        await chrome.storage.local.remove('sharedVar');
      }
    } catch (error) {
      console.error('I don\'t know but this happened :', error);
    }
  }
});