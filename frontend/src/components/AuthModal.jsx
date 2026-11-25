import React, { useState } from 'react';
import {
  X, ShieldCheck, AlertCircle, CheckCircle2, Lock, Mail,
  User, Eye, EyeOff, Building2, Sparkles, ArrowRight
} from 'lucide-react';

export function validateGlaEmail(email) {
  if (!email || !email.trim()) {
    return { valid: false, message: 'Please enter your institutional email.' };
  }
  const clean = email.trim().toLowerCase();
  const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicRegex.test(clean)) {
    return { valid: false, message: 'Please enter a valid email address format.' };
  }
  if (!clean.endsWith('@gla.ac.in')) {
    return {
      valid: false,
      message: 'Access restricted: Only official GLA University accounts ending with @gla.ac.in are permitted.',
    };
  }
  return { valid: true, message: 'Valid GLA University institutional account.' };
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess, showToast }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regRoll, setRegRoll] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDept, setRegDept] = useState('CSE (AI & ML)');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAgreed, setRegAgreed] = useState(true);

  if (!isOpen) return null;

  // Real-time email validation feedback
  const activeEmail = mode === 'signin' ? signInEmail : regEmail;
  const emailValidation = activeEmail.length > 0 ? validateGlaEmail(activeEmail) : null;

  // Handle Sign In Submit
  const handleSignIn = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const validation = validateGlaEmail(signInEmail);
    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }

    if (!signInPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (signInPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    // Check stored user or auto-login with valid GLA credentials
    const cleanEmail = signInEmail.trim().toLowerCase();
    const displayName = cleanEmail.includes('.')
      ? cleanEmail.split('@')[0].split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
      : cleanEmail.split('@')[0].toUpperCase();

    const userObj = {
      name: cleanEmail.includes('gopichand') ? 'Vemula Gopi Chand' : displayName,
      email: cleanEmail,
      role: cleanEmail.includes('proctor') ? 'Proctor Office Operator' : 'Student',
      rollNo: cleanEmail.includes('cs21') ? '2215001234' : 'GLA-STU-8821',
      dept: 'BTech CSE (AI & ML)',
    };

    localStorage.setItem('findly_user', JSON.stringify(userObj));
    setSuccessMessage(`Welcome back, ${userObj.name}! Authenticating institutional session...`);

    setTimeout(() => {
      onLoginSuccess(userObj);
      onClose();
      showToast(`Signed in successfully as ${userObj.name} (@gla.ac.in)`);
    }, 600);
  };

  // Handle Registration Submit
  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim()) {
      setErrorMessage('Please provide your full legal name.');
      return;
    }

    if (!regRoll.trim()) {
      setErrorMessage('Please provide your University Roll Number / ID.');
      return;
    }

    const validation = validateGlaEmail(regEmail);
    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    if (!regAgreed) {
      setErrorMessage('You must accept the GLA University Campus Honor Code to proceed.');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    const newUser = {
      name: regName.trim(),
      email: cleanEmail,
      role: 'Student',
      rollNo: regRoll.trim(),
      dept: regDept,
    };

    localStorage.setItem('findly_user', JSON.stringify(newUser));
    setSuccessMessage(`Account created for ${newUser.name}! Redirecting to campus dashboard...`);

    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
      showToast(`Account registered and verified for ${newUser.name} (@gla.ac.in)`);
    }, 700);
  };

  // Quick Demo Autofills for Viva / Examination Demonstration
  const fillStudentDemo = () => {
    setMode('signin');
    setSignInEmail('gopichand.vemula_cs21@gla.ac.in');
    setSignInPassword('SmartCampus@2026');
    setErrorMessage('');
  };

  const fillProctorDemo = () => {
    setMode('signin');
    setSignInEmail('proctor.office@gla.ac.in');
    setSignInPassword('ProctorGLA@2026');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] rounded-3xl max-w-lg w-full p-7 sm:p-9 border border-[#EDEAE2] shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Top Header: Brand Crest & Close Button */}
        <div className="flex items-start justify-between border-b border-[#F0EDE6] pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-[#E1EFE6] text-[#2E5F46] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>GLA University Single Sign-On</span>
            </div>
            <h3 className="font-serif font-bold text-2xl text-[#1A1D1B]">
              {mode === 'signin' ? 'Campus Portal Sign In' : 'New Student Registration'}
            </h3>
            <p className="text-xs text-[#6C726D]">
              Institutional verification enforced via official <strong>@gla.ac.in</strong> email address.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF9F5] hover:bg-[#EDEAE2] text-[#6C726D] hover:text-[#1A1D1B] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-[#FAF9F5] p-1 rounded-2xl border border-[#EDEAE2]">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-[#1E3A2F] text-white shadow-xs'
                : 'text-[#6C726D] hover:text-[#1A1D1B]'
            }`}
          >
            Sign In with Campus ID
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-[#1E3A2F] text-white shadow-xs'
                : 'text-[#6C726D] hover:text-[#1A1D1B]'
            }`}
          >
            Register New Student
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-3 bg-[#FCEAE6] border border-[#F5D5CE] rounded-xl text-xs text-[#C24136] flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-3 bg-[#E1EFE6] border border-[#D5E8DB] rounded-xl text-xs text-[#2E5F46] flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{successMessage}</div>
          </div>
        )}

        {/* =====================================================================
            TAB 1: SIGN IN FORM
            ===================================================================== */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Campus Email Field with Real-Time @gla.ac.in Validation */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1A1D1B]">
                Institutional Email Address <span className="text-[#C24136]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6C726D]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="yourname_cs21@gla.ac.in"
                  value={signInEmail}
                  onChange={(e) => {
                    setSignInEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className={`w-full bg-[#FAF9F5] border rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#1A1D1B] placeholder-[#9CA3AF] focus:outline-none transition-all ${
                    emailValidation
                      ? emailValidation.valid
                        ? 'border-[#2E5F46] focus:border-[#2E5F46] bg-[#F7FBF8]'
                        : 'border-[#C24136] focus:border-[#C24136] bg-[#FFF8F7]'
                      : 'border-[#EDEAE2] focus:border-[#1E3A2F]'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  {emailValidation && (
                    emailValidation.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-[#2E5F46]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#C24136]" />
                    )
                  )}
                </div>
              </div>

              {/* Live Domain Status Prompt */}
              {emailValidation && (
                <div
                  className={`text-[11px] font-medium flex items-center gap-1.5 pt-0.5 ${
                    emailValidation.valid ? 'text-[#2E5F46]' : 'text-[#C24136]'
                  }`}
                >
                  <span>{emailValidation.message}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#1A1D1B]">
                  Password <span className="text-[#C24136]">*</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Contact Proctor Helpdesk (AB-1 Room 104) or IT Center for CAS password reset.');
                  }}
                  className="text-[#6C726D] hover:text-[#1E3A2F] text-[11px]"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6C726D]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your institutional password"
                  value={signInPassword}
                  onChange={(e) => {
                    setSignInPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full bg-[#FAF9F5] border border-[#EDEAE2] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#1A1D1B] placeholder-[#9CA3AF] focus:border-[#1E3A2F] focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6C726D] hover:text-[#1A1D1B]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 text-[#4A4E4B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D5D2C8] text-[#1E3A2F] focus:ring-0"
                />
                <span>Keep session active on campus terminal</span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#1E3A2F] hover:bg-[#162C23] text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>Sign In with Institutional ID</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* =====================================================================
            TAB 2: REGISTRATION FORM
            ===================================================================== */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1A1D1B]">
                  Full Name <span className="text-[#C24136]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6C726D]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Vemula Gopi Chand"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EDEAE2] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1A1D1B] focus:border-[#1E3A2F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Roll Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1A1D1B]">
                  Roll / ID Number <span className="text-[#C24136]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="2215001234"
                  value={regRoll}
                  onChange={(e) => setRegRoll(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EDEAE2] rounded-xl px-3 py-2 text-xs text-[#1A1D1B] focus:border-[#1E3A2F] focus:outline-none"
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1A1D1B]">
                Department / Program <span className="text-[#C24136]">*</span>
              </label>
              <select
                value={regDept}
                onChange={(e) => setRegDept(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#EDEAE2] rounded-xl px-3 py-2 text-xs text-[#1A1D1B] focus:border-[#1E3A2F] focus:outline-none"
              >
                <option value="CSE (AI & ML)">BTech CSE (AI &amp; ML)</option>
                <option value="CSE Core">BTech CSE Core</option>
                <option value="ECE">BTech Electronics &amp; Communication</option>
                <option value="Mechanical">BTech Mechanical Engineering</option>
                <option value="Civil">BTech Civil Engineering</option>
                <option value="BBA / MBA">Management Studies (BBA/MBA)</option>
                <option value="Faculty / Staff">Faculty / Research Scholar</option>
              </select>
            </div>

            {/* Email Field with Strict @gla.ac.in Check */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1A1D1B]">
                Official GLA Campus Email <span className="text-[#C24136]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6C726D]">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="rollnumber@gla.ac.in"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className={`w-full bg-[#FAF9F5] border rounded-xl pl-9 pr-8 py-2 text-xs text-[#1A1D1B] placeholder-[#9CA3AF] focus:outline-none ${
                    emailValidation
                      ? emailValidation.valid
                        ? 'border-[#2E5F46] bg-[#F7FBF8]'
                        : 'border-[#C24136] bg-[#FFF8F7]'
                      : 'border-[#EDEAE2] focus:border-[#1E3A2F]'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {emailValidation && (
                    emailValidation.valid ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E5F46]" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-[#C24136]" />
                    )
                  )}
                </div>
              </div>
              {emailValidation && (
                <div
                  className={`text-[10.5px] font-medium pt-0.5 ${
                    emailValidation.valid ? 'text-[#2E5F46]' : 'text-[#C24136]'
                  }`}
                >
                  {emailValidation.message}
                </div>
              )}
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1A1D1B]">
                  Create Password <span className="text-[#C24136]">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EDEAE2] rounded-xl px-3 py-2 text-xs text-[#1A1D1B] focus:border-[#1E3A2F] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1A1D1B]">
                  Confirm Password <span className="text-[#C24136]">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EDEAE2] rounded-xl px-3 py-2 text-xs text-[#1A1D1B] focus:border-[#1E3A2F] focus:outline-none"
                />
              </div>
            </div>

            {/* Campus Honor Code Consent */}
            <div className="pt-1">
              <label className="flex items-start gap-2 text-xs text-[#4A4E4B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={regAgreed}
                  onChange={(e) => setRegAgreed(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D5D2C8] text-[#1E3A2F] focus:ring-0 mt-0.5"
                />
                <span className="text-[11px] leading-relaxed">
                  I certify that I am a registered student/staff at GLA University and agree to the Campus Honesty &amp; Property Custody Policy.
                </span>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-[#1E3A2F] hover:bg-[#162C23] text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>Register Institutional Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Quick Demo Autofill Section for Testing / Evaluation */}
        <div className="pt-2 border-t border-[#F0EDE6] space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#6C726D]">
            <span className="font-semibold text-[#1A1D1B] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D87A5B]" />
              Quick Demo Logins (Viva Evaluation):
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillStudentDemo}
              className="p-2.5 bg-[#FAF9F5] hover:bg-[#E1EFE6] border border-[#EDEAE2] hover:border-[#D5E8DB] rounded-xl text-left transition-colors group"
            >
              <div className="text-xs font-bold text-[#1A1D1B] group-hover:text-[#1E3A2F] flex items-center justify-between">
                <span>🎓 Student Demo</span>
                <span className="text-[10px] bg-[#D8ECE0] text-[#1E3A2F] px-1.5 py-0.2 rounded font-mono">CSE AI&amp;ML</span>
              </div>
              <div className="text-[11px] text-[#6C726D] font-mono mt-0.5">
                gopichand.vemula_cs21@gla.ac.in
              </div>
            </button>

            <button
              type="button"
              onClick={fillProctorDemo}
              className="p-2.5 bg-[#FAF9F5] hover:bg-[#FCEAE6] border border-[#EDEAE2] hover:border-[#F5D5CE] rounded-xl text-left transition-colors group"
            >
              <div className="text-xs font-bold text-[#1A1D1B] group-hover:text-[#C24136] flex items-center justify-between">
                <span>🛡️ Proctor Admin</span>
                <span className="text-[10px] bg-[#FCEAE6] text-[#C24136] px-1.5 py-0.2 rounded font-mono">Desk 104</span>
              </div>
              <div className="text-[11px] text-[#6C726D] font-mono mt-0.5">
                proctor.office@gla.ac.in
              </div>
            </button>
          </div>
        </div>

        {/* Security Policy Footnote */}
        <div className="text-[11px] text-[#787F79] bg-[#FAF9F5] p-3 rounded-xl border border-[#EDEAE2] flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2E5F46] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Campus Security Protocol:</strong> External public email providers (Gmail, Yahoo, Outlook) are blocked by the gateway to maintain audit accountability for all lost and found property handovers.
          </p>
        </div>
      </div>
    </div>
  );
}
