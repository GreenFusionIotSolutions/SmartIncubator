import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { dbB } from '../config/firebaseConfig';
import { motion } from 'framer-motion';
import { Trash2, Edit, ArrowLeft } from 'lucide-react';

interface Doctor {
  id: string;
  doctorName: string;
  doctorID: string;
  doctorPassword: string;
}

export function DoctorsList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [newDoctorData, setNewDoctorData] = useState({
    doctorName: '',
    doctorID: '',
    doctorPassword: '',
  });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(dbB, 'doctors'));
        const fetchedDoctors = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Doctor[];
        setDoctors(fetchedDoctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(dbB, 'doctors', id));
      setDoctors(doctors.filter((doctor) => doctor.id !== id));
      setAlertMessage('Doctor deleted successfully');
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting doctor:', error);
      setAlertMessage('Error deleting doctor');
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setNewDoctorData({
      doctorName: doctor.doctorName,
      doctorID: doctor.doctorID,
      doctorPassword: doctor.doctorPassword,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    try {
      const doctorRef = doc(dbB, 'doctors', editingDoctor.id);
      await updateDoc(doctorRef, newDoctorData);
      setDoctors(
        doctors.map((doctor) =>
          doctor.id === editingDoctor.id ? { ...doctor, ...newDoctorData } : doctor
        )
      );
      setEditingDoctor(null);
      setAlertMessage('Doctor updated successfully');
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Error updating doctor:', error);
      setAlertMessage('Error updating doctor');
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex items-center space-x-4 ">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Doctors List</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">{doctor.doctorName}</h3>
                  <p className="text-sm text-gray-500">ID: {doctor.doctorID}</p>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleEdit(doctor)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doctor.id)}
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

      {/* Edit Doctor Form */}
      {editingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Doctor</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                placeholder="Doctor Name"
                value={newDoctorData.doctorName}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, doctorName: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Doctor ID"
                value={newDoctorData.doctorID}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, doctorID: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newDoctorData.doctorPassword}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, doctorPassword: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingDoctor(null)}
                  type="button"
                  className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {alertMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg">
          {alertMessage}
        </div>
      )}
    </div>
  );
}
