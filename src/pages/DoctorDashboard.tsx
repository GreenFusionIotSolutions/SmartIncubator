import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { dbB } from "../config/firebaseConfig";
import { Baby, Calendar, User, ArrowLeft, LogOut, Search } from "lucide-react";

interface Incubator {
  id: string;
  parentName: string;
  parentID: string;
  babyGender: string;
  babyDOB: string;
  status: string;
}

export function DoctorDashboard() {
  const [incubators, setIncubators] = useState<Incubator[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🆕 Search input state
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncubators = async () => {
      try {
        const querySnapshot = await getDocs(collection(dbB, "incubators"));
        const fetchedIncubators = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Incubator[];
        setIncubators(fetchedIncubators);
      } catch (error) {
        console.error("Error fetching incubators:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncubators();
  }, []);

  const handleLogout = () => {
    window.history.back();
  };

  const handleCardClick = (id: string) => {
    if (id === incubators[0]?.id) {
      navigate(`/doctor/monitor/${id}`);
    } else {
      alert("No incubator found");
    }
  };

  // 🆕 Filter incubators based on search term (case-insensitive)
  const filteredIncubators = incubators.filter((incubator) =>
    incubator.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900">
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce delay-150"></div>
          <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          
          {/* 🆕 Header with Search Bar */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            {/* Left: Back Button + Title */}
            <div className="flex items-center space-x-4">
              <button onClick={() => window.history.back()} className="text-gray-300 hover:text-white">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            </div>

            {/* Center: Search Bar */}
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search by Parent Name..."
                className="w-full bg-gray-800 text-white py-2 pl-10 pr-4 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>

            {/* Right: Incubator Count + Logout Button */}
            <div className="flex justify-end items-center space-x-4 w-full md:w-auto">
              <span className="text-gray-400">{filteredIncubators.length} Incubators</span>
              <button
                onClick={handleLogout}
                className="flex items-center py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>


          {/* 🆕 Display filtered incubator cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIncubators.map((incubator) => (
              <motion.div
                key={incubator.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="relative bg-gray-900 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-purple-500/50 transition-all duration-200 p-6 space-y-4"
                onClick={() => handleCardClick(incubator.id)}
              >
                {/* Neon Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-transparent opacity-10 rounded-xl pointer-events-none"></div>

                <div className="flex items-center space-x-3">
                  <User className="h-6 w-6 text-purple-400" />
                  <div>
                    <h3 className="text-lg font-semibold">{incubator.parentName}</h3>
                    <p className="text-sm text-gray-400">ID: {incubator.parentID}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Baby className="h-6 w-6 text-pink-400" />
                  <p className="text-gray-300">Gender: {incubator.babyGender}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-green-400" />
                  <p className="text-gray-300">
                    DOB: {new Date(incubator.babyDOB).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  {/* 🆕 Updated Status Badge with Purple */}
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${incubator.status === "Active" ? "bg-purple-600 text-purple-100" : "bg-purple-900 text-purple-300"}`}>
                    Status: {incubator.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 🆕 No Results Message */}
          {filteredIncubators.length === 0 && (
            <p className="text-center text-gray-400 text-lg">No incubators found.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
