//src/components/MonitoringDashboard.tsx
import React, { useEffect, useState } from "react";
import { dbA, doc, onSnapshot } from "../config/firebaseConfig";
import { motion } from "framer-motion";
import { NotificationAlerts } from "./NotificationAlerts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Flame,
  Lightbulb,
  ChevronLeft,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export interface Incubator {
  temperature: number;
  humidity: number;
  airQualityIndex: number;
  uvRadiation: number;
  flameDetected: boolean;
  lightIntensity: number;
  cameraFeed: string;
}

function MetricCard({ icon, title, value, status, alert }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className={`p-5 rounded-2xl shadow-xl border-2 flex flex-col justify-between h-full 
        ${alert ? "bg-red-900/20 border-red-800" : "bg-gray-900 border-[#BB86FC]/30"}`}
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-3 rounded-full bg-gradient-to-br from-[#BB86FC]/20 to-[#a671ed]/30 shadow-lg">
          {React.cloneElement(icon as React.ReactElement, {
            className: "text-[#BB86FC]", // Purple accent
            size: 25,
          })}
        </div>
        <h4 className="text-sm font-bold text-[#BB86FC] uppercase tracking-wider">
          {title}
        </h4>
      </div>

      <div className="flex items-center justify-between">
        <p
          className={`text-2xl font-extrabold truncate ${
            alert ? "text-red-400" : "text-gray-100"
          }`}
        >
          {value !== null && value !== undefined ? value : "--"}
        </p>
        {value !== null && value !== undefined && status && (
          <div className="flex items-center space-x-2">
            <div
              className={`w-4 h-4 rounded-full ${
                status === "Critical"
                  ? "bg-red-500 animate-pulse"
                  : status === "Warning"
                  ? "bg-yellow-500 animate-pulse"
                  : status === "Stale"
                  ? "bg-gray-500 animate-pulse"
                  : "bg-green-500"
              }`}
            ></div>
            <p
              className={`text-xs font-bold uppercase tracking-wider ${
                status === "Critical"
                  ? "text-red-600"
                  : status === "Warning"
                  ? "text-yellow-600"
                  : status === "Stale"
                  ? "text-gray-600"
                  : "text-green-600"
              }`}
            >
              {status}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export const MonitoringDashboard = () => {
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const [incubator, setIncubator] = useState<Incubator | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  type MetricsData = {
    labels: string[];
    temperature: number[];
    humidity: number[];
    airQualityIndex: number[];
    uvRadiation: number[];
    lightIntensity: number[];
  };
  const [metricsData, setMetricsData] = useState<MetricsData>({
    labels: [],
    temperature: [],
    humidity: [],
    airQualityIndex: [],
    uvRadiation: [],
    lightIntensity: [],
  });
  
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const goBack = () => {
    window.history.back();
  };

  const convertToDateFormat = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${year}-${month}-${day}_${hours}-${minutes}`;
  };

  const fetchMetricsWithTimeout = async (dateTime: string) => {
    console.log("Fetching document for ID:", dateTime);
    setLoading(true);
  
    const timeout = setTimeout(() => {
      console.warn("Timeout reached: No data fetched within 2 minutes.");
      setLoading(false);
    }, 120000);
  
    try {
      const docRef = doc(dbA, "values", dateTime);
  
      // Establish a real-time listener
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          clearTimeout(timeout);
          console.log("Document data:", docSnap.data());
          const data = docSnap.data() as Incubator;
  
          setIncubator(data);
          setLastUpdated(new Date());
          setMetricsData((prevData) => ({
            labels: [...prevData.labels, dateTime],
            temperature: [...prevData.temperature, data.temperature],
            humidity: [...prevData.humidity, data.humidity],
            airQualityIndex: [...prevData.airQualityIndex, data.airQualityIndex],
            uvRadiation: [...prevData.uvRadiation, data.uvRadiation],
            lightIntensity: [...prevData.lightIntensity, data.lightIntensity],
          }));
  
          setLoading(false);
        } else {
          console.warn(`No document found for ID: ${dateTime}`);
        }
      });
  
      return unsubscribe; // Keep the listener alive
    } catch (error) {
      console.error("Error fetching metrics:", error);
      clearTimeout(timeout);
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      now.setSeconds(0, 0); // Ensure the time aligns to the current minute
      const formattedDateTime = convertToDateFormat(now);
      fetchMetricsWithTimeout(formattedDateTime);
    }, 60000); // Fetch every 60 seconds
  
    return () => clearInterval(interval);
  }, []);
  

  useEffect(() => {
    const formattedDateTime = convertToDateFormat(selectedDateTime);
    fetchMetricsWithTimeout(formattedDateTime);
  }, [selectedDateTime]);

  const isStale =
    lastUpdated && new Date().getTime() - lastUpdated.getTime() > 60000;


  const chartData = {
    labels: metricsData.labels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: metricsData.temperature,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Humidity (%)",
        data: metricsData.humidity,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Air Quality Index",
        data: metricsData.airQualityIndex,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "UV Radiation (mW/cm²)",
        data: metricsData.uvRadiation,
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Light Intensity (lux)",
        data: metricsData.lightIntensity,
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="p-6 bg-gradient-to-br from-black via-gray-900 to-purple-900 min-h-screen">
    <NotificationAlerts incubator={incubator} />
      <h1 className="text-4xl font-bold mb-8 text-center text-[#BB86FC] tracking-tight">
        Incubator Monitoring Dashboard
      </h1>

      {/* Back Button with Left Arrow */}
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <button
          onClick={goBack}
          className="absolute top-4 left-4 p-2 rounded-full bg-[#a671ed] hover:bg-[#BB86FC] text-white shadow-lg transition-colors"
        >
          <ChevronLeft className="text-gray-800" size={24} />
        </button>
      </div>

      {/* Date Picker Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsDatePickerVisible(!isDatePickerVisible)}
          className="p-3 rounded-lg shadow-md bg-[#a671ed] text-white font-semibold hover:bg-[#BB86FC] focus:ring-2 focus:ring-[#BB86FC] transition-colors"
        >
          Select Date & Time
        </button>
      </div>

      {/* Date-Time Picker */}
      {isDatePickerVisible && (
        <div className="flex justify-end mb-6 mr-9">
          <DatePicker
            selected={selectedDateTime}
            // onChange={(date: Date) => setSelectedDateTime(date)}
            onChange={(date: Date | null) => {
              if (date) setSelectedDateTime(date);
            }}
            dateFormat="yyyy-MM-dd'T'HH:mm"
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={1}
            className="p-3 rounded-lg shadow-md bg-gray-900 border border-[#BB86FC]/30 text-gray-100 focus:ring-2 focus:ring-[#BB86FC]"
          />
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Larger Video Feed */}
        <div className="relative flex flex-col items-start h-[400px] lg:h-[500px] lg:w-[75%] col-span-1 lg:col-span-2 bg-gray-900 p-6 rounded-2xl shadow-xl border border-[#BB86FC]/30 overflow-hidden">
          {/* Camera Monitoring Heading */}
          <div className="w-full mb-2 p-2 bg-[#BB86FC]/10 rounded-lg shadow-md flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-[#BB86FC]">Camera Monitoring</h2>
                <p className="text-sm text-gray-600">Live video feed from the incubator camera</p>
              </div>
              {selectedDateTime.toISOString().split("T")[0] === new Date().toISOString().split("T")[0] && (
                <div className="flex items-center space-x-2 text-red-600 font-bold ml-3">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  <span>LIVE</span>
                </div>
              )}
            </div>
          </div>

          {/* Video Feed */}
          {selectedDateTime.toISOString().split("T")[0] === new Date().toISOString().split("T")[0] ? (
            <iframe
              src={`http://192.168.84.246/`}
              width="100%"
              height="100%"
              className="rounded-xl border-2 border-gray-100"
              frameBorder="0"
              title="ESP32 Camera Feed"
            ></iframe>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              No video stream available for the selected date.
            </div>
          )}
        </div>

        {/* Right Side: Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:-ml-40">
        <MetricCard
          icon={<Thermometer />}
          title="Temperature"
          value={incubator ? incubator.temperature : null}
          status={
            incubator
              ? incubator.temperature < 20
                ? "Critical"
                : incubator.temperature <= 30
                ? "Good"
                : incubator.temperature <= 35
                ? "Warning"
                : "Critical"
              : null
          }
        />
        <MetricCard
          icon={<Droplets />}
          title="Humidity"
          value={incubator ? incubator.humidity : null}
          status={
            incubator
              ? incubator.humidity < 30 || incubator.humidity > 70
                ? "Critical"
                : incubator.humidity < 40 || incubator.humidity > 60
                ? "Warning"
                : "Good"
              : null
          }
        />
        <MetricCard
          icon={<Wind />}
          title="Air Quality Index"
          value={incubator ? incubator.airQualityIndex : null}
          status={
            incubator
              ? incubator.airQualityIndex > 100
                ? "Critical"
                : incubator.airQualityIndex > 50
                ? "Warning"
                : "Good"
              : null
          }
        />
        <MetricCard
          icon={<Sun />}
          title="UV Radiation"
          value={incubator ? incubator.uvRadiation : null}
          status={
            incubator
              ? incubator.uvRadiation > 5
                ? "Critical"
                : incubator.uvRadiation > 3
                ? "Warning"
                : "Good"
              : null
          }
        />
        <MetricCard
          icon={<Flame />}
          title="Flame Detected"
          value={incubator ? (incubator.flameDetected ? "Yes" : "No") : null}
          status={incubator && incubator.flameDetected ? "Critical" : "Good"}
          alert={incubator && incubator.flameDetected}
        />
        <MetricCard
          icon={<Lightbulb />}
          title="Light Intensity"
          value={incubator ? incubator.lightIntensity : null}
          status={
            incubator
              ? incubator.lightIntensity > 2000
                ? "Critical"
                : incubator.lightIntensity > 1000
                ? "Warning"
                : "Good"
              : null
          }
        />

        </div>
      </div>

      {/* Centered and Increased Graph Size */}
      <div className="mt-10 bg-gray-900 rounded-2xl shadow-xl p-6 border border-[#BB86FC]/30">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Value",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Date & Time",
                },
              },
            },
          }}
          height={400}
        />
      </div>
    </div>
  );
};

export default MonitoringDashboard;
function fetchRealTimeData() {
  throw new Error("Function not implemented.");
}

function fetchHistoricalData(selectedDateTime: Date) {
  throw new Error("Function not implemented.");
}

