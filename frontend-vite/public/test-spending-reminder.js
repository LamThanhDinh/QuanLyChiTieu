// Test script for spending reminder functionality
// Run this in browser console to test the spending reminder features

console.log("=== Testing Spending Reminder Functionality ===");

// Test 1: Check if spending reminder service is working
async function testSpendingReminderService() {
  try {
    console.log("1. Testing Spending Reminder Service...");

    // Import the service functions (assuming they're available globally or you can import them)
    const {
      getSpendingReminderSettings,
      saveSpendingReminderSettings,
      getDailySpending,
      getMonthlySpending,
      generateSpendingNotifications,
    } = await import("/src/api/spendingReminderService.js");

    // Test getting default settings
    const defaultSettings = getSpendingReminderSettings();
    console.log("Default settings:", defaultSettings);

    // Test saving custom settings
    const testSettings = {
      enabled: true,
      dailyLimit: 500000,
      monthlyLimit: 10000000,
      reminderTime: "10:00",
      notificationThreshold: 75,
      includeGoals: true,
      includeSources: true,
    };

    const saveResult = saveSpendingReminderSettings(testSettings);
    console.log("Save settings result:", saveResult);

    // Test getting saved settings
    const savedSettings = getSpendingReminderSettings();
    console.log("Saved settings:", savedSettings);

    // Test daily spending calculation
    const dailySpending = await getDailySpending();
    console.log("Daily spending:", dailySpending);

    // Test monthly spending calculation
    const monthlySpending = await getMonthlySpending();
    console.log("Monthly spending:", monthlySpending);

    // Test notification generation
    const notifications = await generateSpendingNotifications();
    console.log("Generated notifications:", notifications);

    console.log("✅ Spending Reminder Service tests completed");
  } catch (error) {
    console.error("❌ Error testing Spending Reminder Service:", error);
  }
}

// Test 2: Check if notification service integration is working
async function testNotificationIntegration() {
  try {
    console.log("2. Testing Notification Integration...");

    const { getAllNotifications, getUnreadNotificationCount } = await import(
      "/src/api/notificationService.js"
    );

    const allNotifications = await getAllNotifications();
    console.log("All notifications:", allNotifications);

    const unreadCount = await getUnreadNotificationCount();
    console.log("Unread count:", unreadCount);

    console.log("✅ Notification Integration tests completed");
  } catch (error) {
    console.error("❌ Error testing Notification Integration:", error);
  }
}

// Test 3: Check localStorage functionality
function testLocalStorage() {
  try {
    console.log("3. Testing LocalStorage functionality...");

    // Test saving and retrieving settings
    const testData = {
      enabled: true,
      dailyLimit: 300000,
      monthlyLimit: 8000000,
      reminderTime: "08:30",
      notificationThreshold: 90,
      includeGoals: false,
      includeSources: true,
    };

    localStorage.setItem("spendingReminderSettings", JSON.stringify(testData));
    const retrieved = JSON.parse(
      localStorage.getItem("spendingReminderSettings")
    );

    console.log("Test data:", testData);
    console.log("Retrieved data:", retrieved);
    console.log(
      "Data match:",
      JSON.stringify(testData) === JSON.stringify(retrieved)
    );

    console.log("✅ LocalStorage tests completed");
  } catch (error) {
    console.error("❌ Error testing LocalStorage:", error);
  }
}

// Test 4: Simulate notification scenarios
async function testNotificationScenarios() {
  try {
    console.log("4. Testing Notification Scenarios...");

    // Simulate high spending scenario
    const highSpendingSettings = {
      enabled: true,
      dailyLimit: 100000, // Low limit to trigger notifications
      monthlyLimit: 2000000,
      reminderTime: "09:00",
      notificationThreshold: 50, // Low threshold to trigger notifications
      includeGoals: true,
      includeSources: true,
    };

    localStorage.setItem(
      "spendingReminderSettings",
      JSON.stringify(highSpendingSettings)
    );

    const { generateSpendingNotifications } = await import(
      "/src/api/spendingReminderService.js"
    );
    const notifications = await generateSpendingNotifications();

    console.log("High spending scenario notifications:", notifications);

    // Reset to default settings
    localStorage.removeItem("spendingReminderSettings");

    console.log("✅ Notification Scenarios tests completed");
  } catch (error) {
    console.error("❌ Error testing Notification Scenarios:", error);
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting all tests...");

  await testSpendingReminderService();
  await testNotificationIntegration();
  testLocalStorage();
  await testNotificationScenarios();

  console.log("🎉 All tests completed!");
}

// Auto-run tests
runAllTests();

// Make functions available globally for manual testing
window.testSpendingReminder = {
  testSpendingReminderService,
  testNotificationIntegration,
  testLocalStorage,
  testNotificationScenarios,
  runAllTests,
};
