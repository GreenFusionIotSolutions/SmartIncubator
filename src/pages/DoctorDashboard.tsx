import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Assuming React Router is used
import { dbB } from '../config/firebaseConfig';
import { Baby, Calendar, User, ArrowLeft, LogOut } from 'lucide-react';

interface Incubator {
  id: string;
  parentName: string;
  parentID: string;
  babyGender: string;
  babyDOB: string;
  status: string; // Added status field
}

export function DoctorDashboard() {
  const [incubators, setIncubators] = useState<Incubator[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // React Router navigate function

  useEffect(() => {
    const fetchIncubators = async () => {
      try {
        const querySnapshot = await getDocs(collection(dbB, 'incubators'));
        const fetchedIncubators = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Incubator[];
        setIncubators(fetchedIncubators);
      } catch (error) {
        console.error('Error fetching incubators:', error);
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
    if (id === incubators[0]?.id) { // Check if the clicked card is the first card
      navigate(`/doctor/monitor/${id}`); // Navigate to MonitoringDashboard with the ID
    } else {
      alert('No incubator found');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-dot1"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-dot2"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-dot3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            </div>
            <div className="space-x-4 flex">
              <span className="text-gray-600">{incubators.length} Incubators</span>
              <button
                onClick={handleLogout}
                className="flex items-center py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incubators.map((incubator) => (
              <motion.div
                key={incubator.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                onClick={() => handleCardClick(incubator.id)}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-6 w-6 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {incubator.parentName}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {incubator.parentID}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Baby className="h-6 w-6 text-pink-500" />
                    <div>
                      <p className="text-gray-600">Gender: {incubator.babyGender}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="text-gray-600">
                        DOB: {new Date(incubator.babyDOB).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">Status: {incubator.status}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
