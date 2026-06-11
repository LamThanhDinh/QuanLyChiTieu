// Test integration between SpendingReminder and Header notifications
// Run this in browser console to verify the integration

console.log("=== Testing Spending Reminder & Header Integration ===");

// Test function to simulate spending and check notifications
async function testSpendingNotificationIntegration() {
  try {
    console.log("🧪 Test 1: Check if Header displays spending notifications");

    // First, save some test settings to trigger notifications
    const testSettings = {
      enabled: true,
      dailyLimit: 50000, // Very low limit to trigger notifications easily
      monthlyLimit: 1000000,
      reminderTime: "09:00",
      notificationThreshold: 50, // Low threshold
      includeGoals: true,
      includeSources: true,
    };

    localStorage.setItem(
      "spendingReminderSettings",
      JSON.stringify(testSettings)
    );
    console.log("✅ Set test spending reminder settings:", testSettings);

    // Import notification services
    const { getAllNotifications, getUnreadNotificationCount } = await import(
      "/src/api/notificationService.js"
    );

    // Test getting all notifications (should include both goal and spending notifications)
    const allNotifications = await getAllNotifications();
    console.log("📋 All notifications:", allNotifications);

    // Test unread count
    const unreadCount = await getUnreadNotificationCount();
    console.log("🔔 Unread notification count:", unreadCount);

    // Check if notifications include spending-related ones
    const spendingNotifications = allNotifications.filter(
      (n) => n.type === "spending_limit"
    );
    console.log("💰 Spending notifications:", spendingNotifications);

    console.log("✅ Test 1 completed");
  } catch (error) {
    console.error("❌ Error in Test 1:", error);
  }
}

// Test function to check Header notification display
function testHeaderNotificationDisplay() {
  try {
    console.log("🧪 Test 2: Check Header notification icon");

    // Find notification badge in header
    const notificationBadge = document.querySelector(
      '[class*="notificationBadge"]'
    );
    const notificationIcon = document.querySelector(
      '[class*="notificationIcon"]'
    );

    if (notificationIcon) {
      console.log("✅ Found notification icon in header");

      if (notificationBadge) {
        console.log(
          "🔔 Notification badge found with count:",
          notificationBadge.textContent
        );
      } else {
        console.log(
          "ℹ️ No notification badge (probably no unread notifications)"
        );
      }

      // Simulate click to open dropdown
      console.log("🖱️ Simulating notification icon click...");
      notificationIcon.click();

      setTimeout(() => {
        const dropdown =
          document.querySelector('[class*="notificationDropdown"]') ||
          document.querySelector('[class*="dropdown"]');

        if (dropdown) {
          console.log("✅ Notification dropdown opened");

          // Look for spending notification items
          const notificationItems = dropdown.querySelectorAll(
            '[class*="notification"]'
          );
          console.log(
            `📋 Found ${notificationItems.length} notification items in dropdown`
          );

          notificationItems.forEach((item, index) => {
            const text = item.textContent;
            if (text.includes("chi tiêu") || text.includes("spending")) {
              console.log(
                `💰 Spending notification ${index + 1}:`,
                text.substring(0, 100) + "..."
              );
            }
          });
        } else {
          console.log("⚠️ Notification dropdown not found");
        }

        // Close dropdown
        notificationIcon.click();
      }, 500);
    } else {
      console.log("❌ Notification icon not found in header");
    }

    console.log("✅ Test 2 completed");
  } catch (error) {
    console.error("❌ Error in Test 2:", error);
  }
}

// Test function to verify useNotifications hook integration
async function testUseNotificationsHook() {
  try {
    console.log("🧪 Test 3: Test useNotifications hook integration");

    // Check if Header component is using useNotifications
    const headerElements = document.querySelectorAll("header");

    if (headerElements.length > 0) {
      console.log("✅ Found header element");

      // Force a notification refresh by modifying settings
      const currentSettings = JSON.parse(
        localStorage.getItem("spendingReminderSettings") || "{}"
      );

      // Toggle a setting to trigger a refresh
      currentSettings.enabled = !currentSettings.enabled;
      localStorage.setItem(
        "spendingReminderSettings",
        JSON.stringify(currentSettings)
      );

      console.log("🔄 Modified settings to trigger refresh");

      // Wait for potential useEffect to run
      setTimeout(async () => {
        try {
          const { getUnreadNotificationCount } = await import(
            "/src/api/notificationService.js"
          );
          const newCount = await getUnreadNotificationCount();
          console.log(
            "📊 New notification count after settings change:",
            newCount
          );

          // Restore original setting
          currentSettings.enabled = !currentSettings.enabled;
          localStorage.setItem(
            "spendingReminderSettings",
            JSON.stringify(currentSettings)
          );

          console.log("✅ Test 3 completed");
        } catch (error) {
          console.error("❌ Error getting new count:", error);
        }
      }, 1000);
    } else {
      console.log("❌ Header element not found");
    }
  } catch (error) {
    console.error("❌ Error in Test 3:", error);
  }
}

// Test function to verify real-time updates
function testRealTimeUpdates() {
  try {
    console.log("🧪 Test 4: Test real-time notification updates");

    const notificationBadge = document.querySelector(
      '[class*="notificationBadge"]'
    );
    const initialCount = notificationBadge
      ? notificationBadge.textContent
      : "0";

    console.log("📊 Initial notification count:", initialCount);

    // Create a very restrictive setting to force notifications
    const forceNotificationSettings = {
      enabled: true,
      dailyLimit: 1, // 1 VND - will definitely trigger notifications
      monthlyLimit: 1000,
      reminderTime: "09:00",
      notificationThreshold: 1, // 1% threshold
      includeGoals: true,
      includeSources: true,
    };

    localStorage.setItem(
      "spendingReminderSettings",
      JSON.stringify(forceNotificationSettings)
    );
    console.log("⚡ Set extreme notification settings to force updates");

    // Check for changes in the badge after 2 seconds
    setTimeout(() => {
      const newBadge = document.querySelector('[class*="notificationBadge"]');
      const newCount = newBadge ? newBadge.textContent : "0";

      console.log("📊 New notification count:", newCount);

      if (newCount !== initialCount) {
        console.log(
          "✅ Notification count changed - real-time updates working!"
        );
      } else {
        console.log(
          "ℹ️ No change in notification count (might need actual transaction data)"
        );
      }

      // Restore reasonable settings
      const reasonableSettings = {
        enabled: true,
        dailyLimit: 200000,
        monthlyLimit: 5000000,
        reminderTime: "09:00",
        notificationThreshold: 80,
        includeGoals: true,
        includeSources: true,
      };

      localStorage.setItem(
        "spendingReminderSettings",
        JSON.stringify(reasonableSettings)
      );
      console.log("🔄 Restored reasonable settings");

      console.log("✅ Test 4 completed");
    }, 2000);
  } catch (error) {
    console.error("❌ Error in Test 4:", error);
  }
}

// Run all tests
async function runIntegrationTests() {
  console.log("🚀 Starting Spending Reminder & Header Integration Tests...");
  console.log("⏱️ This will take about 10 seconds to complete all tests");

  await testSpendingNotificationIntegration();

  setTimeout(() => {
    testHeaderNotificationDisplay();
  }, 2000);

  setTimeout(() => {
    testUseNotificationsHook();
  }, 4000);

  setTimeout(() => {
    testRealTimeUpdates();
  }, 6000);

  setTimeout(() => {
    console.log("🎉 All integration tests completed!");
    console.log("📝 Summary:");
    console.log("- Check console output above for detailed results");
    console.log("- Look for ✅ (success) and ❌ (error) indicators");
    console.log("- Verify notification badge in header shows correct count");
    console.log(
      "- Try clicking notification icon to see dropdown with spending notifications"
    );
  }, 10000);
}

// Auto-run tests
runIntegrationTests();

// Make test functions available globally
window.testSpendingIntegration = {
  testSpendingNotificationIntegration,
  testHeaderNotificationDisplay,
  testUseNotificationsHook,
  testRealTimeUpdates,
  runIntegrationTests,
};

// Instructions for manual testing
console.log(`
📋 MANUAL TESTING INSTRUCTIONS:

1. Open Developer Console (F12)
2. Run: window.testSpendingIntegration.runIntegrationTests()
3. Check header notification icon for badge count
4. Click notification icon to see dropdown
5. Look for spending-related notifications (💰 icon)
6. Go to Profile > Settings > Toggle spending reminder
7. Modify spending limits to very low values
8. Check if notification count updates automatically

🔍 What to look for:
- Notification badge shows correct count
- Dropdown includes spending notifications
- Spending notifications have 💰 icon
- Real-time updates when settings change
- Integration between Settings and Header works seamlessly
`);
