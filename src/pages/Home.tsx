import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Baby, UserCircle2, Lock } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getMessaging, getToken } from 'firebase/messaging';
import logo from '../pages/logo.png';

export function Home() {
  const navigate = useNavigate();
  const [doctorCredentials, setDoctorCredentials] = useState({ username: '', password: '' });
  const [parentCredentials, setParentCredentials] = useState({ username: '', password: '' });
  const [adminBoxVisible, setAdminBoxVisible] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [parentError, setParentError] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isDoctorLoading, setIsDoctorLoading] = useState(false);
  const [isParentLoading, setIsParentLoading] = useState(false);

  const requestNotificationPermission = async (userId: string) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const messaging = getMessaging();
        const token = await getToken(messaging, {
          vapidKey: 'BOddbFMUBgzyx-bNuBXilESUJ4x0I5hCOoVKdZFRaDzhn0DwzOdw2nE6Ra2xaQgXnsx_KX8T6ymEjZFq249E7r4', // Replace with your Firebase VAPID key
        });

        localStorage.setItem('fcmToken', token);
        localStorage.setItem('userId', userId);

        // Store token in Firestore
        await updateDoc(doc(db, 'users', userId), {
          fcmToken: token,
        });
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDoctorLoading(true);
    setDoctorError(null);

    try {
      const doctorsRef = collection(db, 'doctors');
      const q = query(
        doctorsRef,
        where('doctorID', '==', doctorCredentials.username),
        where('doctorPassword', '==', doctorCredentials.password)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userId = doctorCredentials.username; // Use doctorID as userId
        await requestNotificationPermission(userId);
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
    setParentError(null);

    try {
      const incubatorsRef = collection(db, 'incubators');
      const q = query(
        incubatorsRef,
        where('parentID', '==', parentCredentials.username),
        where('parentPassword', '==', parentCredentials.password)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userId = parentCredentials.username; // Use parentID as userId
        await requestNotificationPermission(userId);
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
      setAdminError('Invalid Admin Credentials!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-purple-900 text-gray-100">
      <div className="flex items-center justify-end p-4 relative">
        <button
          onClick={() => setAdminBoxVisible(!adminBoxVisible)}
          className="bg-[#a671ed] hover:bg-[#BB86FC] text-white px-4 py-2 rounded-lg shadow transition-all"
        >
          Admin Login
        </button>

        {adminBoxVisible && (
          <div className="absolute top-full right-0 mt-2 rounded-lg shadow-lg w-64 p-4 z-10 bg-black border border-[#BB86FC]">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="relative">
                <UserCircle2 className="absolute left-3 top-3 text-[#BB86FC]" size={20} />
                <input
                  type="text"
                  value={adminCredentials.username}
                  onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-[#BB86FC] bg-gray-900 border-gray-700 text-white"
                  placeholder="Admin Username"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-[#BB86FC]" size={20} />
                <input
                  type="password"
                  value={adminCredentials.password}
                  onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-[#BB86FC] bg-gray-900 border-gray-700 text-white"
                  placeholder="Password"
                  required
                />
              </div>
              {adminError && (
                <div className="text-red-400 text-sm bg-red-900 bg-opacity-20 p-3 rounded-lg border border-red-800">
                  {adminError}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-2 px-4 bg-[#BB86FC] text-white rounded-lg hover:bg-[#a671ed] transition-colors"
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
        className="text-4xl md:text-5xl font-bold text-center py-2 text-[#BB86FC]"
      >
        Baby Incubator Monitoring System
      </motion.h1>

      <div className="text-center max-w-3xl mx-auto my-8 px-5">
        <p className="text-lg md:text-xl leading-relaxed text-gray-300">
          The <strong className="text-[#BB86FC]">Baby Incubator Monitoring System</strong> ensures the safety and health of newborns in neonatal intensive care units.
          It allows parents and doctors to monitor and manage the incubator's vital parameters effectively.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full mx-auto px-4">
  {/* Doctor Login Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-900 p-6 rounded-2xl shadow-lg"
  >
    <div className="flex items-center space-x-4 mb-4">
      <UserCircle2 className="text-[#BB86FC]" size={32} />
      <h2 className="text-2xl font-bold text-[#BB86FC]">Doctor Login</h2>
    </div>
    <form onSubmit={handleDoctorLogin} className="space-y-4">
      <div className="relative">
        <UserCircle2 className="absolute left-3 top-3 text-[#BB86FC]" size={20} />
        <input
          type="text"
          value={doctorCredentials.username}
          onChange={(e) => setDoctorCredentials({ ...doctorCredentials, username: e.target.value })}
          className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-[#BB86FC] bg-gray-800 border-gray-700 text-white"
          placeholder="Doctor ID"
          required
        />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-3 text-[#BB86FC]" size={20} />
        <input
          type="password"
          value={doctorCredentials.password}
          onChange={(e) => setDoctorCredentials({ ...doctorCredentials, password: e.target.value })}
          className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-[#BB86FC] bg-gray-800 border-gray-700 text-white"
          placeholder="Password"
          required
        />
      </div>
      {doctorError && (
        <div className="text-red-400 text-sm bg-red-900 bg-opacity-20 p-3 rounded-lg border border-red-800">
          {doctorError}
        </div>
      )}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isDoctorLoading}
        className="w-full py-2 px-4 bg-[#a671ed] text-white rounded-lg hover:bg-[#BB86FC] transition-colors"
      >
        {isDoctorLoading ? 'Logging in...' : 'Login'}
      </motion.button>
    </form>
  </motion.div>

  {/* Parent Login Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-900 p-6 rounded-2xl shadow-lg"
  >
    <div className="flex items-center space-x-4 mb-4">
      <Baby className="text-[#BB86FC]" size={32} />
      <h2 className="text-2xl font-bold text-[#BB86FC]">Parent Login</h2>
    </div>
    <form onSubmit={handleParentLogin} className="space-y-4">
      <div className="relative">
        <Baby className="absolute left-3 top-3 text-[#BB86FC]" size={20} />
        <input
          type="text"
          value={parentCredentials.username}
          onChange={(e) => setParentCredentials({ ...parentCredentials, username: e.target.value })}
          className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-[#BB86FC] bg-gray-800 border-gray-700 text-white"
          placeholder="Parent ID"
          required
        />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-3 text-[#BB86FC]" size={20} />
        <input
          type="password"
          value={parentCredentials.password}
          onChange={(e) => setParentCredentials({ ...parentCredentials, password: e.target.value })}
          className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-[#BB86FC] bg-gray-800 border-gray-700 text-white"
          placeholder="Password"
          required
        />
      </div>
      {parentError && (
        <div className="text-red-400 text-sm bg-red-900 bg-opacity-20 p-3 rounded-lg border border-red-800">
          {parentError}
        </div>
      )}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isParentLoading}
        className="w-full py-2 px-4 bg-[#a671ed] text-white rounded-lg hover:bg-[#BB86FC] transition-colors"
      >
        {isParentLoading ? 'Logging in...' : 'Login'}
      </motion.button>
    </form>
  </motion.div>
</div>


      <footer className="py-5 mt-auto text-gray-300">
        <div className="flex items-center justify-center space-y-4">
          <img src={logo} alt="Company Logo" className="h-20 w-20" />
          <p className="text-lg font-semibold text-[#BB86FC]">@NeoNatiX</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
