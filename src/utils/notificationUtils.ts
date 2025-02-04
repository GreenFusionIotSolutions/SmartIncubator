// src/utils/notificationUtils.ts
import { Incubator } from "../components/MonitoringDashboard";
import { db } from "../config/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export const checkMetricThresholds = async (incubator: Incubator, userId: string) => {
  const alerts = [];
  
  // Define thresholds
  const thresholds = {
    temperature: { max: 35, min: 20 },
    humidity: { max: 70, min: 30 },
    airQualityIndex: { max: 100 },
    uvRadiation: { max: 5 },
    lightIntensity: { max: 2000 },
  };

  // Check each metric
  if (incubator.temperature > thresholds.temperature.max || incubator.temperature < thresholds.temperature.min) {
    alerts.push(`Temperature critical (${incubator.temperature}°C)`);
  }
  
  if (incubator.humidity > thresholds.humidity.max || incubator.humidity < thresholds.humidity.min) {
    alerts.push(`Humidity critical (${incubator.humidity}%)`);
  }

  if (incubator.airQualityIndex > thresholds.airQualityIndex.max) {
    alerts.push(`Air quality critical (${incubator.airQualityIndex})`);
  }

  if (incubator.uvRadiation > thresholds.uvRadiation.max) {
    alerts.push(`UV radiation critical (${incubator.uvRadiation}mW/cm²)`);
  }

  if (incubator.lightIntensity > thresholds.lightIntensity.max) {
    alerts.push(`Light intensity critical (${incubator.lightIntensity}lux)`);
  }

  if (incubator.flameDetected) {
    alerts.push("Flame detected!");
  }

  // Store alerts in Firestore and trigger notifications
  if (alerts.length > 0) {
    const notification = {
      message: alerts.join(", "),
      userId,
      timestamp: new Date().toISOString(),
      read: false
    };

    try {
      // Store notification in Firestore
      await setDoc(doc(db, "notifications", `${userId}_${Date.now()}`), notification);
    } catch (error) {
      console.error("Error saving notification:", error);
    }
  }
};