import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { CanvasEditor } from './components/CanvasEditor';
import { Workshop } from './components/Workshop';
import { Toasts } from './components/Toasts';

export const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project/:projectId" element={<CanvasEditor />} />
        <Route path="/workshop" element={<Workshop />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global floating toast manager */}
      <Toasts />
    </>
  );
};
export default App;
