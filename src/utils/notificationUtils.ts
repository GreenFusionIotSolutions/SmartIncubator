import { db } from "../config/firebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export const checkMetricThresholds = (incubator: any, userId: string) => {
  const thresholds = {
    temperature: { warn: 30, critical: 35 },
    humidity: { warn: [40, 60], critical: [30, 70] },
    airQualityIndex: { warn: 50, critical: 100 },
    uvRadiation: { warn: 3, critical: 5 },
    lightIntensity: { warn: 1000, critical: 2000 }
  };

  const alerts = [];

  if (incubator.temperature >= thresholds.temperature.warn) {
    alerts.push({
      type: 'temperature',
      value: incubator.temperature,
      threshold: thresholds.temperature,
      timestamp: new Date().toISOString()
    });
  }

  if (incubator.humidity <= thresholds.humidity.critical[0] || 
      incubator.humidity >= thresholds.humidity.critical[1]) {
    alerts.push({
      type: 'humidity',
      value: incubator.humidity,
      threshold: thresholds.humidity,
      timestamp: new Date().toISOString()
    });
  }

  if (incubator.airQualityIndex >= thresholds.airQualityIndex.warn) {
    alerts.push({
      type: 'airQuality',
      value: incubator.airQualityIndex,
      threshold: thresholds.airQualityIndex,
      timestamp: new Date().toISOString()
    });
  }

  if (alerts.length > 0) {
    // Write alerts to Firestore to trigger Cloud Function
    const userRef = doc(db, "users", userId);
    updateDoc(userRef, {
      alerts: arrayUnion(...alerts),
      fcmToken: localStorage.getItem('fcmToken') // Ensure token is stored
    });
  }
};