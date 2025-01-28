//src/components/MonitoringDashboard.tsx
import React, { useEffect, useState } from "react";
import { dbA, doc, onSnapshot } from "../config/firebaseConfig";
import { motion } from "framer-motion";
// import { Notification } from "./Notification";
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
        ${alert ? "bg-red-50 border-red-200" : "bg-white border-blue-100"}`}
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-purple-200 shadow-lg">
          {React.cloneElement(icon as React.ReactElement, {
            className: "text-blue-700",
            size: 25,
          })}
        </div>
        <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider">
          {title}
        </h4>
      </div>

      <div className="flex items-center justify-between">
        <p
          className={`text-2xl font-extrabold truncate ${
            alert ? "text-red-600" : "text-gray-800"
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

  // const [metricsData, setMetricsData] = useState({
  //   labels: [],
  //   temperature: [],
  //   humidity: [],
  //   airQualityIndex: [],
  //   uvRadiation: [],
  //   lightIntensity: [],
  // });


  // const [notifications, setNotifications] = useState<string[]>([]);

  // // Fetch data based on selected date and time
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const isRealTime =
  //       selectedDateTime.toISOString().split("T")[0] ===
  //       new Date().toISOString().split("T")[0];

  //     if (isRealTime) {
  //       const data = await fetchRealTimeData();
  //       setIncubator(data);
  //     } else {
  //       const data = await fetchHistoricalData(selectedDateTime);
  //       setIncubator(data);
  //     }
  //   };

  //   fetchData();
  // }, [selectedDateTime]);

  // // Function to add a notification
  // const addNotification = (message: string) => {
  //   setNotifications((prev) => [...prev, message]);
  //   setTimeout(() => {
  //     setNotifications((prev) => prev.slice(1));
  //   }, 5000); // Notification disappears after 5 seconds
  // };

  // // Monitor for critical conditions
  // useEffect(() => {
  //   if (incubator) {
  //     const checkCriticalConditions = () => {
  //       const criticalMetrics = [];

  //       if (incubator.temperature < 20 || incubator.temperature > 35) {
  //         criticalMetrics.push("Temperature");
  //       }
  //       if (incubator.humidity < 30 || incubator.humidity > 70) {
  //         criticalMetrics.push("Humidity");
  //       }
  //       if (incubator.airQualityIndex > 100) {
  //         criticalMetrics.push("Air Quality Index");
  //       }
  //       if (incubator.uvRadiation > 5) {
  //         criticalMetrics.push("UV Radiation");
  //       }
  //       if (incubator.flameDetected) {
  //         criticalMetrics.push("Flame Detected");
  //       }
  //       if (incubator.lightIntensity > 2000) {
  //         criticalMetrics.push("Light Intensity");
  //       }

  //       if (criticalMetrics.length > 0) {
  //         criticalMetrics.forEach((metric) => {
  //           addNotification(`${metric} is in a critical condition!`);
  //         });
  //       }
  //     };

  //     const isRealTime =
  //       selectedDateTime.toISOString().split("T")[0] ===
  //       new Date().toISOString().split("T")[0];

  //     if (isRealTime) {
  //       checkCriticalConditions();
  //     }
  //   }
  // }, [incubator, selectedDateTime]);

  // // Render notifications
  // const renderNotifications = () => (
  //   <div className="notifications-container">
  //     {notifications.map((message, index) => (
  //       <Notification
  //         key={index}
  //         message={message}
  //         onClose={() =>
  //           setNotifications((prev) => prev.filter((_, i) => i !== index))
  //         }
  //       />
  //     ))}
  //   </div>
  // );


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
        } else {
          console.warn(`No document found for ID: ${dateTime}`);
        }
        setLoading(false);
        unsubscribe();
      });
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
    <div className="container mx-auto p-6 rounded-2xl bg-gradient-to-br from-blue-200 to-pink-200 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800 tracking-tight">
        Incubator Monitoring Dashboard
      </h1>

      {/* Back Button with Left Arrow */}
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <button
          onClick={goBack}
          className="p-2 rounded-full bg-white shadow-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500"
        >
          <ChevronLeft className="text-gray-800" size={24} />
        </button>
      </div>

      {/* Date Picker Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsDatePickerVisible(!isDatePickerVisible)}
          className="border-2 border-blue-200 p-3 rounded-lg shadow-md bg-white text-gray-700 font-semibold hover:bg-blue-200 focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
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
            className="border-2 border-blue-200 p-3 rounded-lg shadow-md bg-white text-gray-700 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
          />
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Larger Video Feed */}
        <div className="relative flex flex-col items-start h-[400px] lg:h-[500px] lg:w-[75%] col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl overflow-hidden">
          {/* Camera Monitoring Heading */}
          <div className="w-full mb-2 p-2 bg-blue-100 rounded-lg shadow-md flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Camera Monitoring</h2>
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
              src={`http://192.168.61.246/`}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:-ml-40">
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
      <div className="mt-10 bg-white rounded-2xl shadow-xl p-6">
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

