import * as functions from "firebase-functions/v2"; // Import v2
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const sendMetricAlerts = functions.firestore.onDocumentUpdated(
  "users/{userId}",
  async (event) => {
    const newData = event.data?.after.data();
    const previousData = event.data?.before.data();

    if (!newData || !previousData) {
      console.log("No data found in the document.");
      return;
    }

    // Get new alerts
    const newAlerts = newData.alerts.slice(previousData.alerts?.length || 0);

    if (newAlerts.length > 0 && newData.fcmToken) {
      const messages = newAlerts.map((alert: any) => ({
        notification: {
          title: `🚨 ${alert.type.toUpperCase()} ALERT`,
          body: `${alert.type} is at ${alert.value} (Threshold: ${alert.threshold.critical})`,
        },
        token: newData.fcmToken,
      }));

      // Send all notifications
      for (const message of messages) {
        await admin.messaging().send(message);
      }

      // 🔹 Manually update alerts array
      const updatedAlerts = newData.alerts.map((alert: any) => ({
        ...alert,
        triggered: true, // Set triggered to true
      }));

      // 🔹 Write back updated array
      await event.data?.after.ref.update({
        alerts: updatedAlerts,
      });
    }

    return null;
  }
);
