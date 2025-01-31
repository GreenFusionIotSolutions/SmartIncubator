import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
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
        const querySnapshot = await getDocs(collection(db, 'doctors'));
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
      await deleteDoc(doc(db, 'doctors', id));
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
      const doctorRef = doc(db, 'doctors', editingDoctor.id);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-bold">Doctors List</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="relative bg-gray-900 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-purple-500/50 transition-all duration-200 p-6 space-y-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-transparent opacity-10 rounded-xl pointer-events-none"></div>
                <h3 className="text-lg font-semibold">{doctor.doctorName}</h3>
                <p className="text-sm text-gray-400">ID: {doctor.doctorID}</p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(doctor.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
