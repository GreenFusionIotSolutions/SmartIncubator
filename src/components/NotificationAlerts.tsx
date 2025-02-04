import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Siren } from "lucide-react";
import { Incubator } from "./MonitoringDashboard";

// Import your audio file (make sure it's in the correct path)
import emergencySound from "../../public/alert.mp3";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the audio element
  useEffect(() => {
    audioRef.current = new Audio(emergencySound);
    audioRef.current.preload = "auto"; // Preload the audio file
  }, []);

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

      // Play sound for critical notifications
      if (newNotifications.some(n => n.type === "Critical")) {
        if (audioRef.current) {
          audioRef.current.play().catch(error => {
            console.error("Audio playback failed:", error);
          });
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
        return prev.filter(n => now.getTime() - n.timestamp.getTime() < 10000);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md w-full">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`p-4 pr-8 rounded-xl shadow-2xl relative overflow-hidden
              ${notification.type === "Critical" 
                ? "bg-gradient-to-r from-red-600/90 to-red-700/90 border-l-4 border-red-500"
                : "bg-gradient-to-r from-yellow-600/90 to-yellow-700/90 border-l-4 border-yellow-500"}`}
          >
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                {notification.type === "Critical" ? (
                  <Siren className="w-6 h-6 text-red-100" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-100" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-white mb-1">
                  {notification.type} ALERT!
                </p>
                <p className="text-sm text-white/90">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => 
                  prev.filter(n => n.id !== notification.id)
                )}
                className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              className="h-1 bg-white/30 absolute bottom-0 left-0 right-0 origin-left"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 10, ease: "linear" }}
            />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};