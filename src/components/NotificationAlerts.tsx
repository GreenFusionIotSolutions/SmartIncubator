import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Incubator } from "./MonitoringDashboard";

interface Notification {
  id: string;
  message: string;
  type: "Critical" | "Warning";
  timestamp: Date;
}

interface NotificationAlertsProps {
  incubator: Incubator | null;
}

export const NotificationAlerts = ({ incubator }: NotificationAlertsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const prevIncubator = useRef<Incubator | null>(null);

  useEffect(() => {
    const checkThresholds = (current: Incubator, previous: Incubator | null) => {
      const newNotifications: Notification[] = [];

      const addNotification = (metric: string, value: any, status: "Critical" | "Warning") => {
        newNotifications.push({
          id: `${metric}-${Date.now()}`,
          message: `${metric} ${status}: ${value} (Action Required)`,
          type: status,
          timestamp: new Date(),
        });
      };

      // Temperature
      if (!previous || current.temperature !== previous.temperature) {
        if (current.temperature < 20 || current.temperature > 35) {
          addNotification("Temperature", `${current.temperature}°C`, "Critical");
        } else if (current.temperature > 30) {
          addNotification("Temperature", `${current.temperature}°C`, "Warning");
        }
      }

      // Humidity
      if (!previous || current.humidity !== previous.humidity) {
        if (current.humidity < 30 || current.humidity > 70) {
          addNotification("Humidity", `${current.humidity}%`, "Critical");
        } else if (current.humidity < 40 || current.humidity > 60) {
          addNotification("Humidity", `${current.humidity}%`, "Warning");
        }
      }

      // Air Quality
      if (!previous || current.airQualityIndex !== previous.airQualityIndex) {
        if (current.airQualityIndex > 100) {
          addNotification("Air Quality", `AQI ${current.airQualityIndex}`, "Critical");
        } else if (current.airQualityIndex > 50) {
          addNotification("Air Quality", `AQI ${current.airQualityIndex}`, "Warning");
        }
      }

      // UV Radiation
      if (!previous || current.uvRadiation !== previous.uvRadiation) {
        if (current.uvRadiation > 5) {
          addNotification("UV Radiation", `${current.uvRadiation}mW/cm²`, "Critical");
        } else if (current.uvRadiation > 3) {
          addNotification("UV Radiation", `${current.uvRadiation}mW/cm²`, "Warning");
        }
      }

      // Light Intensity
      if (!previous || current.lightIntensity !== previous.lightIntensity) {
        if (current.lightIntensity > 2000) {
          addNotification("Light Intensity", `${current.lightIntensity}lux`, "Critical");
        } else if (current.lightIntensity > 1000) {
          addNotification("Light Intensity", `${current.lightIntensity}lux`, "Warning");
        }
      }

      // Flame Detection
      if (!previous || current.flameDetected !== previous.flameDetected) {
        if (current.flameDetected) {
          addNotification("Flame Detected", "Fire detected!", "Critical");
        }
      }

      setNotifications(prev => [...newNotifications, ...prev]);
    };

    if (incubator && incubator !== prevIncubator.current) {
      checkThresholds(incubator, prevIncubator.current);
      prevIncubator.current = incubator;
    }
  }, [incubator]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications(prev => {
        const now = new Date();
        return prev.filter(n => now.getTime() - n.timestamp.getTime() < 5000);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md w-full">
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`p-4 pr-8 rounded-lg shadow-xl relative ${
              notification.type === "Critical" 
                ? "bg-red-600/90 border-2 border-red-500" 
                : "bg-yellow-600/90 border-2 border-yellow-500"
            }`}
          >
            <p className="font-bold text-sm mb-1">{notification.type} Alert!</p>
            <p className="text-sm">{notification.message}</p>
            <button
              onClick={() => setNotifications(prev => 
                prev.filter(n => n.id !== notification.id)
              )}
              className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};