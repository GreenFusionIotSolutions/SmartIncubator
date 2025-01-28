import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { dbB } from '../config/firebaseConfig';
import { User, Baby, Calendar, Plus, XCircle, ArrowLeft, LogOut, Trash2, Edit, Eye, EyeOff } from 'lucide-react';

interface Incubator {
  parentPassword: string;
  id: string;
  parentName: string;
  parentID: string;
  babyGender: string;
  babyDOB: string;
}

export function Admin() {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center">
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
<div className="space-y-4">
  <div className="flex justify-between items-center">
    <div className="flex items-center space-x-4">
      <button
        onClick={() => window.history.back()} // Go back when clicking the arrow
        className="text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
    </div>
  </div>
  <div className="flex flex-wrap md:space-x-4 md:space-y-0 space-y-4">
    <button
      onClick={() => setIsIncubatorFormVisible(true)}
      className="flex items-center  px-4 md:w-auto mr-5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm md:text-base"
    >
      <Plus className="mr-2 h-5 w-5" />
      Add Incubator
    </button>
    <button
      onClick={() => setIsDoctorFormVisible(true)}
      className="flex items-center py-2 px-4  md:w-auto bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base"
    >
      <User className="mr-2 h-5 w-5" />
      Register Doctor
    </button>
    
    <Link to="/doctors-list">
      <button className="flex items-center py-2 px-4 w-full md:w-auto bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm md:text-base">
        <User className="mr-2 h-5 w-5" />
        Doctors List
      </button>
    </Link>
    <button
      onClick={handleLogout} // Trigger logout functionality
      className="flex items-center py-2 px-4 ml-9 mr-5 md:w-auto bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm md:text-base"
    >
      <LogOut className="mr-2 h-5 w-5" />
      Logout
    </button>
  </div>
</div>


          {/* Incubator Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incubators.map((incubator) => (
              <motion.div
                key={incubator.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
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
                    <Calendar className="h-6 w-6 text-yellow-500" />
                    <div>
                      <p className="text-gray-600">Date of Birth: {incubator.babyDOB}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleEdit(incubator)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(incubator.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
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
            alertType === 'success' ? 'bg-green-500' : 'bg-red-500'
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Parent ID"
                value={newIncubator.parentID}
                onChange={(e) => setNewIncubator({ ...newIncubator, parentID: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="Password"
                  value={newIncubator.parentPassword}
                  onChange={(e) => setNewIncubator({ ...newIncubator, parentPassword: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-2 top-2"
                >
                  {passwordVisible ? <EyeOff className="h-5 w-5 text-gray-600" /> : <Eye className="h-5 w-5 text-gray-600" />}
                </button>
              </div>
              <input
                type="text"
                placeholder="Baby Gender"
                value={newIncubator.babyGender}
                onChange={(e) => setNewIncubator({ ...newIncubator, babyGender: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="date"
                value={newIncubator.babyDOB}
                onChange={(e) => setNewIncubator({ ...newIncubator, babyDOB: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsIncubatorFormVisible(false)}
                  type="button"
                  className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Register Doctor</h2>
            <form onSubmit={handleRegisterDoctor} className="space-y-4">
              <input
                type="text"
                placeholder="Doctor Name"
                value={newDoctor.doctorName}
                onChange={(e) => setNewDoctor({ ...newDoctor, doctorName: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Doctor ID"
                value={newDoctor.doctorID}
                onChange={(e) => setNewDoctor({ ...newDoctor, doctorID: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newDoctor.doctorPassword}
                onChange={(e) => setNewDoctor({ ...newDoctor, doctorPassword: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsDoctorFormVisible(false)}
                  type="button"
                  className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
