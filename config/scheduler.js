const cron = require('node-cron');
const NotificationService = require('../services/notification.service');

let lastRunDate = ''; // Keeps track of last run date (YYYY-MM-DD) to prevent duplicate runs in the same minute

/**
 * Initialize Node Cron Job Scheduler for daily alerts
 */
function initScheduler() {
  console.log('Initializing walking check daily summary job scheduler...');

  // Run every minute to check if it matches the configured notification time dynamically
  cron.schedule('* * * * *', async () => {
    try {
      const settings = await NotificationService.getNotificationSettings();
      if (!settings.isEnabled) {
        return;
      }

      const now = new Date();
      // Format current time as HH:MM matching server local time
      const currentHHMM = now.toTimeString().substring(0, 5); // "HH:MM"
      const todayStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

      // If current time matches target notification time and it hasn't run today yet
      if (currentHHMM === settings.notificationTime && lastRunDate !== todayStr) {
        console.log(`Scheduler triggered daily summary LINE alert at ${currentHHMM}`);
        lastRunDate = todayStr;
        await NotificationService.sendDailySummary();
      }
    } catch (err) {
      console.error('Error in daily summary scheduler job:', err.message);
    }
  });

  console.log('Scheduler job registered successfully.');
}

module.exports = {
  initScheduler
};
