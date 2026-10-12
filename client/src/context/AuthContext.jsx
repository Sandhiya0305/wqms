import React, { createContext, useContext, useState, useEffect } from 'react';

export const DEMO_ACCOUNTS = [
  {
    id: 'engineer',
    email: 'engineer@waterguard.gov',
    password: 'admin123',
    name: 'R. Sharma',
    title: 'Municipal Engineer',
    role: 'engineer',
    roleLabel: 'Municipal Engineer',
    avatar: 'R',
    avatarBg: 'bg-blue-600',
    department: 'Central Water Authority & Engineering',
    defaultView: 'overview',
    description: 'Full supervisory authority: command center overview, live GIS mapping, threshold calibration, emergency valve overrides, and scenario simulation.',
    allowedViews: ['overview', 'map', 'stations', 'alerts', 'telemetry', 'thresholds', 'hardware', 'simulation', 'reports']
  },
  {
    id: 'field_ops',
    email: 'fieldops@waterguard.gov',
    password: 'field123',
    name: 'A. Kumar',
    title: 'Field Operations Lead',
    role: 'field_ops',
    roleLabel: 'Field Operations Lead',
    avatar: 'A',
    avatarBg: 'bg-emerald-600',
    department: 'IoT Edge Fleet & Telemetry Maintenance',
    defaultView: 'hardware',
    description: 'Field maintenance authority: IoT edge sensor fleet, battery & signal diagnostics, probe recalibration logs, firmware downloads, and wiring specs.',
    allowedViews: ['hardware', 'map', 'stations', 'alerts', 'telemetry']
  },
  {
    id: 'health_officer',
    email: 'health@waterguard.gov',
    password: 'health123',
    name: 'Dr. S. Patel',
    title: 'Chief Health Officer',
    role: 'health_officer',
    roleLabel: 'Chief Public Health Officer',
    avatar: 'S',
    avatarBg: 'bg-amber-600',
    department: 'Directorate of Public Health & Epidemiology',
    defaultView: 'health_advisories',
    description: 'Health authority: authorizes and publishes official Boil Water Advisories, reviews WHO/BIS quality audits, investigates citizen incident complaints.',
    allowedViews: ['health_advisories', 'overview', 'map', 'stations', 'alerts', 'reports']
  },
  {
    id: 'citizen',
    email: 'citizen@waterguard.org',
    password: 'citizen123',
    name: 'Priya Sharma',
    title: 'Community Resident',
    role: 'citizen',
    roleLabel: 'Citizen / Community Resident',
    avatar: 'P',
    avatarBg: 'bg-indigo-600',
    district: 'Rockfort & Thillai Nagar, Trichy',
    department: 'Tiruchirappalli District, Tamil Nadu',
    defaultView: 'citizen_home',
    description: 'Public community resident: checks live drinking water safety in your ward, views neighborhood GIS map, reads official advisories, and files water complaints.',
    allowedViews: ['citizen_home', 'citizen_map', 'citizen_report', 'citizen_advisories', 'citizen_tracker']
  }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('waterguard_active_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      } catch (e) {}
    }
    return null; // Not logged in initially -> Enforces central login page!
  });

  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('waterguard_city') || 'Trichy';
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('waterguard_active_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('waterguard_active_session');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('waterguard_city', selectedCity);
  }, [selectedCity]);

  // Strict Login function requiring valid credentials
  const login = (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const matched = DEMO_ACCOUNTS.find(
      u => u.email.toLowerCase() === trimmedEmail && u.password === password
    );

    if (matched) {
      setCurrentUser(matched);
      return { success: true, user: matched };
    }

    return { 
      success: false, 
      error: 'Invalid credentials. Please enter a valid registered email and password.' 
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('waterguard_active_session');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: currentUser !== null,
      DEMO_ACCOUNTS,
      selectedCity,
      setSelectedCity,
      login,
      logout,
      isEngineer: currentUser?.role === 'engineer',
      isFieldOps: currentUser?.role === 'field_ops',
      isHealthOfficer: currentUser?.role === 'health_officer',
      isCitizen: currentUser?.role === 'citizen',
      isAuthority: currentUser && currentUser.role !== 'citizen'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
