import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { dbB } from '../config/firebaseConfig';
import { UserCircle2, Baby, Lock, Plus, XCircle, ArrowLeft, LogOut, Trash2, Edit, Eye, EyeOff } from 'lucide-react';

interface Incubator {
  parentPassword: string;
  id: string;
  parentName: string;
  parentID: string;
  babyGender: string;
  babyDOB: string;
}

export function Admin() {
  // ... (keep existing state variables)
  const [incubators, setIncubators] = useState<Incubator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIncubatorFormVisible, setIsIncubatorFormVisible] = useState(false);
  const [isDoctorFormVisible, setIsDoctorFormVisible] = useState(false);
  const [newIncubator, setNewIncubator] = useState({
    parentName: '',
    parentID: '',
    parentPassword: '',
    babyGender: '',
    babyDOB: '',
  });
  const [newDoctor, setNewDoctor] = useState({
    doctorName: '',
    doctorID: '',
    doctorPassword: '',
  });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [editingIncubator, setEditingIncubator] = useState<Incubator | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false); // To toggle password visibility
  const [showMobileMenu, setShowMobileMenu] = useState(false)

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
        console.error('Error fetching incubators: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncubators();
  }, []);

  // Check if the parentID already exists in the database
  const checkIDExistence = async (parentID: string) => {
    const q = query(collection(dbB, 'incubators'), where('parentID', '==', parentID));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  // Handle Add Incubator form submission
  const handleAddIncubator = async (e: React.FormEvent) => {
    e.preventDefault();
    const idExists = await checkIDExistence(newIncubator.parentID);
    if (idExists) {
      setAlertMessage('Parent ID already exists');
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    try {
      const incubatorData = {
        parentName: newIncubator.parentName,
        parentID: newIncubator.parentID,
        parentPassword: newIncubator.parentPassword,
        babyGender: newIncubator.babyGender,
        babyDOB: newIncubator.babyDOB,
      };

      const docRef = await addDoc(collection(dbB, 'incubators'), incubatorData);
      setIncubators([...incubators, { id: docRef.id, ...incubatorData }]);
      setIsIncubatorFormVisible(false);
      setNewIncubator({
        parentName: '',
        parentID: '',
        parentPassword: '',
        babyGender: '',
        babyDOB: '',
      });
      setAlertMessage('Incubator added successfully');
      setAlertType('success');
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Error adding incubator: ', error);
      setAlertMessage('Error adding incubator');
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  // Handle Register Doctor form submission
  const handleRegisterDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const doctorData = {
        doctorName: newDoctor.doctorName,
        doctorID: newDoctor.doctorID,
        doctorPassword: newDoctor.doctorPassword,
      };

      await addDoc(collection(dbB, 'doctors'), doctorData);
      setIsDoctorFormVisible(false);
      setNewDoctor({
        doctorName: '',
        doctorID: '',
        doctorPassword: '',
      });
      setAlertMessage('Doctor registered successfully');
      setAlertType('success');
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Error registering doctor: ', error);
      setAlertMessage('Error registering doctor');
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  // Handle editing an incubator
  const handleEdit = (incubator: Incubator) => {
    setEditingIncubator(incubator);
    setNewIncubator({
      parentName: incubator.parentName,
      parentID: incubator.parentID,
      parentPassword: incubator.parentPassword,
      babyGender: incubator.babyGender,
      babyDOB: incubator.babyDOB,
    });
    setIsIncubatorFormVisible(true); // Show form in edit mode
  };

  // Handle updating the incubator in Firestore
  const handleUpdateIncubator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncubator) return;

    try {
      const incubatorData = {
        parentName: newIncubator.parentName,
        parentID: newIncubator.parentID,
        parentPassword: newIncubator.parentPassword,
        babyGender: newIncubator.babyGender,
        babyDOB: newIncubator.babyDOB,
      };

      const incubatorRef = doc(dbB, 'incubators', editingIncubator.id);
      await updateDoc(incubatorRef, incubatorData);

      const updatedIncubators = incubators.map((incubator) =>
        incubator.id === editingIncubator.id ? { ...incubator, ...incubatorData } : incubator
      );
      setIncubators(updatedIncubators);
      setIsIncubatorFormVisible(false);
      setEditingIncubator(null);
      setNewIncubator({
        parentName: '',
        parentID: '',
        parentPassword: '',
        babyGender: '',
        babyDOB: '',
      });
      setAlertMessage('Incubator updated successfully');
      setAlertType('success');
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Error updating incubator: ', error);
      setAlertMessage('Error updating incubator');
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  // Handle deleting an incubator
  const handleDelete = async (id: string) => {
    try {
      const incubatorRef = doc(dbB, 'incubators', id);
      await deleteDoc(incubatorRef);

      const updatedIncubators = incubators.filter((incubator) => incubator.id !== id);
      setIncubators(updatedIncubators);
      setAlertMessage('Incubator deleted successfully');
      setAlertType('success');
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting incubator: ', error);
      setAlertMessage('Error deleting incubator');
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  const handleLogout = () => {
    window.history.back();
  };

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
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
                className="text-[#BB86FC] hover:text-[#a671ed]"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-3xl font-bold text-[#BB86FC]">Admin Dashboard</h1>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => { setIsIncubatorFormVisible(true); setShowMobileMenu(false); }}
                className="flex items-center px-4 bg-[#BB86FC] text-white rounded-lg hover:bg-[#a671ed] text-sm md:text-base transition-colors h-10"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Incubator
              </button>
              <button
                onClick={() => { setIsDoctorFormVisible(true); setShowMobileMenu(false); }}
                className="flex items-center px-4 bg-[#BB86FC] text-white rounded-lg hover:bg-[#a671ed] text-sm md:text-base transition-colors h-10"
              >
                <UserCircle2 className="mr-2 h-5 w-5" />
                Register Doctor
              </button>
              <Link to="/doctors-list">
                <button className="flex items-center px-4 bg-[#BB86FC] text-white rounded-lg hover:bg-[#a671ed] text-sm md:text-base transition-colors h-10">
                  <UserCircle2 className="mr-2 h-5 w-5" />
                  Doctors List
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm md:text-base transition-colors h-10"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </button>
            </div>

            {/* Mobile Dropdown */}
            <div className="md:hidden relative">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-[#BB86FC] hover:text-[#a671ed] p-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>

              {showMobileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50"
                >
                  <button
                    onClick={() => { setIsIncubatorFormVisible(true); setShowMobileMenu(false); }}
                    className="w-full px-4 py-2 text-white hover:bg-gray-700 flex items-center"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Incubator
                  </button>
                  <button
                    onClick={() => { setIsDoctorFormVisible(true); setShowMobileMenu(false); }}
                    className="w-full px-4 py-2 text-white hover:bg-gray-700 flex items-center"
                  >
                    <UserCircle2 className="mr-2 h-5 w-5" />
                    Register Doctor
                  </button>
                  <Link to="/doctors-list" className="w-full block">
                    <button
                      onClick={() => setShowMobileMenu(false)}
                      className="w-full px-4 py-2 text-white hover:bg-gray-700 flex items-center"
                    >
                      <UserCircle2 className="mr-2 h-5 w-5" />
                      Doctors List
                    </button>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                    className="w-full px-4 py-2 text-white hover:bg-gray-700 flex items-center"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
  </div>

          {/* Incubator Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {incubators.map((incubator) => (
    <motion.div
      key={incubator.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="relative bg-gray-900 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-purple-500/50 transition-all duration-200 p-6 space-y-4"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-transparent opacity-10 rounded-xl pointer-events-none"></div>

      <div className="flex items-center space-x-3">
        <UserCircle2 className="h-6 w-6 text-purple-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">{incubator.parentName}</h3>
          <p className="text-sm text-gray-400">ID: {incubator.parentID}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Baby className="h-6 w-6 text-pink-400" />
        <p className="text-gray-300">Gender: {incubator.babyGender}</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <button onClick={() => handleEdit(incubator)} className="text-purple-400 hover:text-purple-600">
          <Edit className="h-5 w-5" />
        </button>
        <button onClick={() => handleDelete(incubator.id)} className="text-red-500 hover:text-red-400">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  ))}
</div>

        </motion.div>
      </div>

      {/* Alert Message */}
      {alertMessage && (
        <motion.div
          className={`fixed top-10 left-1/3 transform -translate-x-1/3 px-4 py-2 rounded-lg w-96 text-center text-white ${
            alertType === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          {alertMessage}
        </motion.div>
      )}

      {/* Incubator Form */}
      {isIncubatorFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg w-96 p-6">
            <h2 className="text-xl font-semibold text-[#BB86FC] mb-4">
              {editingIncubator ? 'Edit Incubator' : 'Add Incubator'}
            </h2>
            <form
              onSubmit={editingIncubator ? handleUpdateIncubator : handleAddIncubator}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Parent Name"
                value={newIncubator.parentName}
                onChange={(e) => setNewIncubator({ ...newIncubator, parentName: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#BB86FC] outline-none"
                required
              />
              <input
                type="text"
                placeholder="Parent ID"
                value={newIncubator.parentID}
                onChange={(e) => setNewIncubator({ ...newIncubator, parentID: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#BB86FC] outline-none"
                required
              />
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="Password"
                  value={newIncubator.parentPassword}
                  onChange={(e) => setNewIncubator({ ...newIncubator, parentPassword: e.target.value })}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#BB86FC] outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-2 top-2 text-gray-400"
                >
                  {passwordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <input
                type="text"
                placeholder="Baby Gender"
                value={newIncubator.babyGender}
                onChange={(e) => setNewIncubator({ ...newIncubator, babyGender: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#BB86FC] outline-none"
                required
              />
              <input
                type="date"
                value={newIncubator.babyDOB}
                onChange={(e) => setNewIncubator({ ...newIncubator, babyDOB: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#BB86FC] outline-none"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsIncubatorFormVisible(false)}
                  type="button"
                  className="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-[#BB86FC] text-white rounded-lg hover:bg-[#a671ed] transition-colors"
                >
                  {editingIncubator ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Registration Form */}
      {isDoctorFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg w-96 p-6">
            <h2 className="text-xl font-semibold text-[#BB86FC] mb-4">Register Doctor</h2>
            <form onSubmit={handleRegisterDoctor} className="space-y-4">
              <input
                type="text"
                placeholder="Doctor Name"
                value={newDoctor.doctorName}
                onChange={(e) => setNewDoctor({ ...newDoctor, doctorName: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#BB86FC] outline-none"
                required
              />
              <input
                type="text"
                placeholder="Doctor ID"
                value={newDoctor.doctorID}
                onChange={(e) => setNewDoctor({ ...newDoctor, doctorID: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#BB86FC] outline-none"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newDoctor.doctorPassword}
                onChange={(e) => setNewDoctor({ ...newDoctor, doctorPassword: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#BB86FC] outline-none"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsDoctorFormVisible(false)}
                  type="button"
                  className="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-[#BB86FC] text-white rounded-lg hover:bg-[#a671ed] transition-colors"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}