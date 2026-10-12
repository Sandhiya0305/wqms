import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Droplet, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sun, 
  Moon, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';

export default function LoginPage() {
  const { login, selectedCity, setSelectedCity } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.error);
      }
    }, 200);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Top Navbar - Boxy Blue & White */}
      <header className={`px-6 py-4 flex items-center justify-between border-b ${
        theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-300 bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 flex items-center justify-center">
            <Droplet className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-blue-600">
              WATERGUARD
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 ml-2 font-mono">
              Water Quality Monitoring System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* City selector */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border ${
            theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
          }`}>
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold"
            >
              <option value="Trichy" className="text-slate-900">Trichy District</option>
              <option value="Chennai" className="text-slate-900">Chennai</option>
              <option value="Bengaluru" className="text-slate-900">Bengaluru</option>
              <option value="Madurai" className="text-slate-900">Madurai</option>
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 border transition cursor-pointer ${
              theme === 'dark' 
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Login Card - Boxy */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          
          <div className={`border p-6 sm:p-8 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
          }`}>
            
            <div className="border-b pb-4 mb-5 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Account Sign In
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your credentials to access the system.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form - Manual Entry */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="you@agency.gov"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 border text-xs focus:outline-none focus:border-blue-600 ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-9 pr-9 py-2 border text-xs focus:outline-none focus:border-blue-600 ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer border border-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className={`py-3 px-6 text-center text-xs border-t ${
        theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-300 bg-white text-slate-600'
      }`}>
        WaterGuard Monitoring Platform • Tiruchirappalli District, Tamil Nadu
      </footer>

    </div>
  );
}
