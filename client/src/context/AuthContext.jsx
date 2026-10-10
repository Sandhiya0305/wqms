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
    description: 'Full supervisory authority over telemetry, stations, risk mitigation, and automated alerts.'
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
    department: 'IoT Sensor Diagnostics & Edge Nodes',
    defaultView: 'hardware',
    description: 'Manages physical sensor nodes, calibration drifts, battery levels, and telemetry dispatch.'
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
    department: 'Ministry of Public Health & Epidemiology',
    defaultView: 'overview',
    description: 'Reviews potability compliance, operational risk indexes, and authorizes public advisories.'
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
    department: 'Indiranagar, Ward 7, Bengaluru',
    defaultView: 'citizen_home',
    description: 'Checks public tap water safety, reviews boil water notices, and submits local incident reports.'
  }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Default to Municipal Engineer as seen in reference image
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('waterguard_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEMO_ACCOUNTS[0]; // R. Sharma - Municipal Engineer
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('waterguard_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const login = (email, password) => {
    const matched = DEMO_ACCOUNTS.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (matched) {
      setCurrentUser(matched);
      setIsAuthModalOpen(false);
      return { success: true, user: matched };
    }
    return { success: false, error: 'Invalid credentials. Please use one of the demo credentials below.' };
  };

  const switchRole = (roleId) => {
    const user = DEMO_ACCOUNTS.find(u => u.id === roleId) || DEMO_ACCOUNTS[0];
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    // Switch to Citizen or prompt login
    setCurrentUser(DEMO_ACCOUNTS[3]); // Fallback to citizen
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      DEMO_ACCOUNTS,
      login,
      switchRole,
      logout,
      isAuthModalOpen,
      setIsAuthModalOpen,
      isAuthority: currentUser.role !== 'citizen',
      isCitizen: currentUser.role === 'citizen'
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
