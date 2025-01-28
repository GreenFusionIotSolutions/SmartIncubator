//src/types/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { MonitoringDashboard } from './components/MonitoringDashboard';
import {Admin} from './pages/Admin';
import { DoctorsList } from './components/DoctorsList';



// Mock data for demonstration

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route 
          path="/doctor/monitor/:id" 
          element={<MonitoringDashboard />} 
        />
        <Route 
          path="/parent/monitor" 
          element={<MonitoringDashboard />} 
        />

        <Route path="/admin" element={<Admin />} />

        <Route path="/doctors-list" element={<DoctorsList />} />

        
      </Routes>
    </Router>
  );
}

export default App;