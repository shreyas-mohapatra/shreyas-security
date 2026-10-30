import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SecurityAssistantModal } from './components/SecurityAssistantModal';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { FirewallPage } from './pages/FirewallPage';
import { AnonymizerPage } from './pages/AnonymizerPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { CompliancePage } from './pages/CompliancePage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-cyan-400 font-mono text-xs">
        <span className="animate-pulse">Loading SecureTrust Environment...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Main Layout with Navbar, Sidebar, and Content Outlet
const AppLayout: React.FC<{ onOpenAssistant: () => void; children: React.ReactNode }> = ({
  onOpenAssistant,
  children,
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar onOpenAssistant={onOpenAssistant} />
      <div className="flex flex-1">
        {user && <Sidebar />}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default function App() {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout onOpenAssistant={() => setAssistantOpen(true)}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Workspace Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/firewall"
              element={
                <ProtectedRoute>
                  <FirewallPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/anonymizer"
              element={
                <ProtectedRoute>
                  <AnonymizerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/incidents"
              element={
                <ProtectedRoute>
                  <IncidentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compliance"
              element={
                <ProtectedRoute>
                  <CompliancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>

        {/* Global Floating AI Security Assistant Modal */}
        <SecurityAssistantModal isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
      </BrowserRouter>
    </AuthProvider>
  );
}
