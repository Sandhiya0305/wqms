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
  User, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  MapPin
} from 'lucide-react';

export default function LoginPage() {
  const { login, DEMO_ACCOUNTS, selectedCity, setSelectedCity } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDemoHint, setSelectedDemoHint] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.error);
      }
    }, 400); // realistic authentication verification delay
  };

  const handleFillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedDemoHint(acc.id);
    setErrorMsg('');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#0B132B] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Top Navbar */}
      <header className={`px-6 py-4 flex items-center justify-between border-b ${
        theme === 'dark' ? 'border-slate-800 bg-[#0F1B38]' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Droplet className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <span className={`text-lg font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Water<span className="text-blue-600">Guard</span>
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 ml-2 font-mono">
              Public Water Quality & Risk Intelligence Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* City selector on login page */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold"
            >
              <option value="Trichy" className="text-slate-900">Trichy, Tamil Nadu</option>
              <option value="Chennai" className="text-slate-900">Chennai, Tamil Nadu</option>
              <option value="Bengaluru" className="text-slate-900">Bengaluru, Karnataka</option>
              <option value="Madurai" className="text-slate-900">Madurai, Tamil Nadu</option>
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition ${
              theme === 'dark' 
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Central Login Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Welcome & Info Banner */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Municipal Network</span>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Continuous Drinking Water Quality & Operational Risk Intelligence
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Serving citizens, public health officers, field maintenance crews, and municipal engineers across 
              <strong className="text-blue-500"> {selectedCity} District</strong>.
            </p>

            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>WHO 4th Ed & BIS IS 10500 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-blue-500 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sub-second IoT Edge Telemetry Streaming</span>
              </div>
              <div className="flex items-center gap-2 text-amber-500 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Automated Anomaly Detection & Triage</span>
              </div>
            </div>
          </div>

          {/* Right Column: Central Strict Sign-In Card */}
          <div className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border shadow-xl transition-all ${
            theme === 'dark' ? 'bg-[#0F1B38] border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}>
            
            <div className="mb-6">
              <h2 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Sign In to WaterGuard
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered credentials to access your role-authorized workspace.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form with Strict Verification */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@waterguard.gov"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Accounts Directory with 1-click Quick Autofill */}
            <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                Quick Demo Credentials (Click to Autofill):
              </span>

              <div className="grid grid-cols-2 gap-2 text-left">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleFillDemo(acc)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedDemoHint === acc.id
                        ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500'
                        : theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-blue-500 truncate">{acc.roleLabel}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Password: <strong className="text-slate-700 dark:text-slate-300">{acc.password}</strong></div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className={`py-4 px-6 text-center text-[11px] text-slate-400 border-t ${
        theme === 'dark' ? 'border-slate-800 bg-[#0B132B]' : 'border-slate-200 bg-slate-50'
      }`}>
        WaterGuard Environmental Intelligence • Tiruchirappalli District Administration • Government of Tamil Nadu
      </footer>

    </div>
  );
}
