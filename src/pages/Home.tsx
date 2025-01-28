import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Baby, UserCircle2, Lock } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { dbB } from '../config/firebaseConfig';
import logo from '../pages/logo.png';

export function Home() {
  const navigate = useNavigate();
  const [doctorCredentials, setDoctorCredentials] = useState({ username: '', password: '' });
  const [parentCredentials, setParentCredentials] = useState({ username: '', password: '' });
  const [adminBoxVisible, setAdminBoxVisible] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });

  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [parentError, setParentError] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);  // Separate error state for Admin

  const [isDoctorLoading, setIsDoctorLoading] = useState(false);
  const [isParentLoading, setIsParentLoading] = useState(false);

  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDoctorLoading(true);
    setDoctorError(null); // Clear previous error
    
    try {
      const doctorsRef = collection(dbB, 'doctors');
      const q = query(
        doctorsRef,
        where('doctorID', '==', doctorCredentials.username),
        where('doctorPassword', '==', doctorCredentials.password)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        navigate('/doctor/dashboard');
      } else {
        setDoctorError('Invalid doctor credentials');
      }
    } catch (error) {
      console.error('Error during Doctor Login:', error);
      setDoctorError('An error occurred. Please try again later.');
    } finally {
      setIsDoctorLoading(false);
    }
  };

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsParentLoading(true);
    setParentError(null); // Clear previous error

    try {
      const incubatorsRef = collection(dbB, 'incubators');
      const q = query(
        incubatorsRef,
        where('parentID', '==', parentCredentials.username),
        where('parentPassword', '==', parentCredentials.password)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        navigate('/parent/monitor');
      } else {
        setParentError('Invalid parent credentials');
      }
    } catch (error) {
      console.error('Error during Parent Login:', error);
      setParentError('An error occurred. Please try again later.');
    } finally {
      setIsParentLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password } = adminCredentials;

    if (username === 'aaa' && password === 'aaa') {
      navigate('/admin');
    } else {
      setAdminError('Invalid Admin Credentials!');  // Set error for Admin
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-200 text-gray-900 flex flex-col">
      <div className="flex items-center justify-end p-4 relative">
        <button
          onClick={() => setAdminBoxVisible(!adminBoxVisible)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-all"
        >
          Admin Login
        </button>
        
        {adminBoxVisible && (
          <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg w-64 p-4 z-10">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="relative">
                <UserCircle2 className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={adminCredentials.username}
                  onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Admin Username"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value={adminCredentials.password}
                  onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                  required
                />
              </div>
              {adminError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {adminError}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </motion.button>
            </form>
          </div>
        )}
      </div>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-bold text-center py-2"
      >
        Baby Incubator Monitoring System
      </motion.h1>

      <div className="text-center max-w-3xl mx-auto my-8 px-5">
        <p className="text-lg md:text-xl text-gray-800 leading-relaxed">
          The <strong>Baby Incubator Monitoring System</strong> ensures the safety and health of newborns in neonatal intensive care units.
          It allows parents and doctors to monitor and manage the incubator's vital parameters effectively.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full mx-auto px-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-6 rounded-lg shadow-xl bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 transition-transform"
        >
          <form onSubmit={handleDoctorLogin} className="space-y-4">
            <div className="text-center flex flex-col items-center">
              <UserCircle2 size={48} className="text-blue-600 mb-4" />
              <h2 className="text-2xl font-semibold">Doctor Login</h2>
            </div>
            <div className="relative">
              <UserCircle2 className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={doctorCredentials.username}
                onChange={(e) => setDoctorCredentials({ ...doctorCredentials, username: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Doctor ID"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                value={doctorCredentials.password}
                onChange={(e) => setDoctorCredentials({ ...doctorCredentials, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                required
              />
            </div>
            {doctorError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {doctorError}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isDoctorLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isDoctorLoading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-6 rounded-lg shadow-xl bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 transition-transform"
        >
          <form onSubmit={handleParentLogin} className="space-y-4">
            <div className="text-center flex flex-col items-center">
              <Baby size={48} className="text-blue-600 mb-4" />
              <h2 className="text-2xl font-semibold">Parent Login</h2>
            </div>
            <div className="relative">
              <UserCircle2 className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={parentCredentials.username}
                onChange={(e) => setParentCredentials({ ...parentCredentials, username: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Parent ID"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                value={parentCredentials.password}
                onChange={(e) => setParentCredentials({ ...parentCredentials, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                required
              />
            </div>
            {parentError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {parentError}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isParentLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isParentLoading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>
        </motion.div>
      </div>

      <footer className="py-5 mt-auto">
        <div className="flex items-center justify-center space-y-4">
          <img src={logo} alt="Company Logo" className="h-20 w-20" />
          <p className="text-lg font-semibold text-gray-800">@Green Fusion IoT Solutions</p>
        </div>
      </footer>
    </div>
  );
}
