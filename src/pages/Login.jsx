import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Building2, Phone, ArrowRight, ShieldCheck, Sparkles, RefreshCcw } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, verifySignUp, signInWithOtp, verifyLoginOtp, resetPassword, verifyResetOtp, updatePassword } = useAuth();

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState('login');
  
  // Login Sub-modes: 'password' | 'otp' | 'forgot' | 'verify-otp' | 'reset-verify' | 'new-password'
  const [loginType, setLoginType] = useState('password');

  // Removed hardcoded admin credentials for security

  // SignUp Sub-modes: isVerifyingSignUp (for email verification OTP code)
  const [isVerifyingSignUp, setIsVerifyingSignUp] = useState(false);

  // Input states for Login
  const [emailOrMobile, setEmailOrMobile] = useState('');
  
  // Input states for Sign Up
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [farmName, setFarmName] = useState('');
  
  // Common states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const cleanEmail = (val) => {
    let cleaned = val.trim();
    // Simple helper if user enters just a mobile or username, they might need a real email format for Supabase
    if (cleaned && !cleaned.includes('@')) {
      cleaned = `${cleaned}@milvexa-user.com`; // fallback default email domain if only mobile/username is provided
    }
    return cleaned;
  };

  const parseAuthError = (err) => {
    if (!err || !err.message) return 'An error occurred during authentication.';
    const msg = err.message.toLowerCase();
    
    if (msg.includes('invalid login credentials') || msg.includes('invalid credentials') || msg.includes('incorrect_password') || msg.includes('password is invalid') || msg.includes('invalid password') || msg.includes('not match')) {
      return 'Incorrect Email/Mobile or Password. Please check your credentials and try again.';
    }
    if (msg.includes('email not confirmed') || msg.includes('confirmation required')) {
      return 'Email is not verified yet. Please check your email inbox for the verification OTP code.';
    }
    if (msg.includes('invalid flow state') || msg.includes('invalid_grant') || msg.includes('otp') || msg.includes('token') || msg.includes('invalid code') || msg.includes('expired') || msg.includes('code is invalid') || msg.includes('incorrect otp')) {
      return 'Incorrect or Expired OTP. Please enter the correct 6-digit code sent to your email.';
    }
    if (msg.includes('already registered') || msg.includes('user already exists')) {
      return 'This email or mobile number is already registered. Please login instead.';
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    return err.message;
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (isVerifyingSignUp) {
          // Verify SignUp OTP Code
          if (otpCode.trim().length !== 6) {
            throw new Error('Incorrect OTP. Please enter the full 6-digit code.');
          }
          const cleanSignUpEmail = cleanEmail(email);
          const { error } = await verifySignUp(cleanSignUpEmail, otpCode);
          if (error) throw error;

          setSuccessMsg('Email verified successfully! Logging in...');
          
          // Sign in using email & password
          const { error: signInErr } = await signIn(cleanSignUpEmail, password);
          if (signInErr) {
            setErrorMsg(signInErr.message);
            setLoading(false);
          } else {
            navigate('/');
          }
        } else {
          // Initial SignUp Submission
          if (!fullName.trim() || !email.trim() || !mobile.trim() || !farmName.trim() || !password.trim() || !confirmPassword.trim()) {
            throw new Error('Please fill in all fields.');
          }
          if (password !== confirmPassword) {
            throw new Error('Passwords do not match.');
          }
          
          const cleanSignUpEmail = cleanEmail(email);
          const { data, error } = await signUp(cleanSignUpEmail, password, {
            full_name: fullName,
            farm_name: farmName,
            mobile: mobile
          });

          if (error) throw error;
          
          if (data?.session) {
            setSuccessMsg('Registration successful! Logging you in...');
            setTimeout(() => {
              navigate('/');
            }, 1500);
          } else {
            setSuccessMsg('Verification link/code sent to your email. Please verify to complete signup.');
            setIsVerifyingSignUp(true);
          }
        }
      } else {
        // Login Flows
        if (loginType === 'password') {
          if (!emailOrMobile.trim() || !password.trim()) {
            throw new Error('Please enter email/mobile and password.');
          }
          const cleanedEmail = cleanEmail(emailOrMobile);
          const { error } = await signIn(cleanedEmail, password);
          if (error) throw error;
          navigate('/');

        } else if (loginType === 'otp') {
          // Send OTP Login
          if (!emailOrMobile.trim()) {
            throw new Error('Please enter your email or mobile.');
          }
          const cleanedEmail = cleanEmail(emailOrMobile);
          const { error } = await signInWithOtp(cleanedEmail);
          if (error) throw error;
          
          setSuccessMsg('OTP code sent to your email.');
          setLoginType('verify-otp');

        } else if (loginType === 'verify-otp') {
          // Verify Login OTP
          if (otpCode.trim().length !== 6) {
            throw new Error('Incorrect OTP. Please enter the correct 6-digit code sent to your email.');
          }
          const cleanedEmail = cleanEmail(emailOrMobile);
          const { error } = await verifyLoginOtp(cleanedEmail, otpCode);
          if (error) throw error;
          navigate('/');

        } else if (loginType === 'forgot') {
          // Forgot Password - Send recovery link
          if (!emailOrMobile.trim()) {
            throw new Error('Please enter your email.');
          }
          const cleanedEmail = cleanEmail(emailOrMobile);
          const { error } = await resetPassword(cleanedEmail);
          if (error) throw error;
          
          setSuccessMsg('Password recovery code sent to your email.');
          setLoginType('reset-verify');

        } else if (loginType === 'reset-verify') {
          // Verify Password Reset OTP
          if (otpCode.trim().length !== 6) {
            throw new Error('Incorrect OTP. Please enter the correct 6-digit recovery code.');
          }
          const cleanedEmail = cleanEmail(emailOrMobile);
          const { error } = await verifyResetOtp(cleanedEmail, otpCode);
          if (error) throw error;
          
          setSuccessMsg('Verification successful. Please enter your new password.');
          setLoginType('new-password');

        } else if (loginType === 'new-password') {
          // Save new password
          if (!password.trim()) {
            throw new Error('Please enter a new password.');
          }
          if (password !== confirmPassword) {
            throw new Error('Passwords do not match.');
          }
          const { error } = await updatePassword(password);
          if (error) throw error;
          
          setSuccessMsg('Password updated successfully! Redirecting...');
          setTimeout(() => {
            setLoginType('password');
            setPassword('');
            setConfirmPassword('');
          }, 1500);
        }
      }
    } catch (err) {
      setErrorMsg(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#F5F6FA',
      fontFamily: "'Outfit', 'Roboto', sans-serif",
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Top Branding Section with deep navy background and bottom curve */}
      <div style={{
        background: 'linear-gradient(180deg, #05163D 0%, #0B1F4D 100%)',
        padding: '60px 24px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: '48px',
        borderBottomRightRadius: '48px',
        position: 'relative'
      }}>
        {/* White rounded square Milvexa icon */}
        <div style={{
          width: '94px',
          height: '94px',
          background: '#FFFFFF',
          borderRadius: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
        }}>
          <img 
            src="/icon.png" 
            onError={(e) => {
              e.target.src = "https://hqnqtefanszrazqowdgx.supabase.co/storage/v1/object/public/milvexa%20-%20cattel%20farm%20managment/icon.png";
            }}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            alt="Milvexa Logo" 
          />
        </div>

        {/* Milvexa Text Title */}
        <h1 className="notranslate" translate="no" style={{
          fontSize: '28px',
          fontWeight: '900',
          color: '#FFFFFF',
          margin: '16px 0 0 0',
          letterSpacing: '-0.5px'
        }}>
          Milvexa
        </h1>

        {/* Sub-branding */}
        <p className="notranslate" translate="no" style={{
          fontSize: '13px',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.65)',
          margin: '6px 0 0 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Smart Cattle Farm Management
        </p>
      </div>

      {/* Overlapping White Form Card */}
      <div style={{
        margin: '-48px auto 24px',
        width: '90%',
        maxWidth: '420px',
        background: '#FFFFFF',
        borderRadius: '36px',
        boxShadow: '0 20px 45px rgba(11, 31, 77, 0.08)',
        padding: '30px 24px',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Toggle between Login and Sign Up (only if not in verification/otp/forgot sub-mode) */}
        {!isVerifyingSignUp && ['password', 'otp'].includes(loginType) && (
          <div style={{
            background: '#F0F3F8',
            borderRadius: '18px',
            padding: '5px',
            display: 'flex',
            marginBottom: '28px'
          }}>
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: '800',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? '#0B1F4D' : '#64748B',
                boxShadow: mode === 'login' ? '0 4px 10px rgba(11, 31, 77, 0.06)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Login
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: '800',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'signup' ? '#FFFFFF' : 'transparent',
                color: mode === 'signup' ? '#0B1F4D' : '#64748B',
                boxShadow: mode === 'signup' ? '0 4px 10px rgba(11, 31, 77, 0.06)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Dynamic Headers based on state */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '900',
            color: '#0B1F4D',
            margin: 0
          }}>
            {mode === 'signup' ? (isVerifyingSignUp ? 'Verify Email' : 'Create Account') : 
              loginType === 'password' ? 'Welcome Back' :
              loginType === 'otp' ? 'OTP Login' :
              loginType === 'forgot' ? 'Reset Password' :
              loginType === 'verify-otp' || loginType === 'reset-verify' ? 'Verify OTP' : 
              'New Password'}
          </h2>
          <p style={{
            fontSize: '13px',
            color: '#64748B',
            fontWeight: '600',
            marginTop: '6px',
            marginRight: 0,
            marginLeft: 0,
            marginBottom: 0
          }}>
            {mode === 'signup' ? (isVerifyingSignUp ? 'Enter the 6-digit verification code sent to your email' : 'Start managing your farm') : 
              loginType === 'password' ? 'Sign in to continue' :
              loginType === 'otp' ? 'Enter email to receive code' :
              loginType === 'forgot' ? 'Get recovery link for your account' :
              loginType === 'verify-otp' || loginType === 'reset-verify' ? 'Enter the 6-digit code we sent' :
              'Choose a strong password'}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div style={{
            background: '#FEF2F2',
            color: '#EF4444',
            padding: '12px 16px',
            borderRadius: '14px',
            fontSize: '12px',
            fontWeight: '700',
            marginBottom: '20px',
            border: '1px solid #FEE2E2',
            lineHeight: 1.4
          }}>
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{
            background: '#ECFDF5',
            color: '#10B981',
            padding: '12px 16px',
            borderRadius: '14px',
            fontSize: '12px',
            fontWeight: '700',
            marginBottom: '20px',
            border: '1px solid #D1FAE5',
            lineHeight: 1.4
          }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleAuthAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Farm Owner Name (Sign Up Form view only) */}
          {mode === 'signup' && !isVerifyingSignUp && (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Owner Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          )}

          {/* Email ID (Sign Up Form view only) */}
          {mode === 'signup' && !isVerifyingSignUp && (
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          )}

          {/* Mobile Number (Sign Up Form view only) */}
          {mode === 'signup' && !isVerifyingSignUp && (
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          )}

          {/* Farm Name (Sign Up Form view only) */}
          {mode === 'signup' && !isVerifyingSignUp && (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Farm Name"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          )}

          {/* Login Email or Mobile (Login mode only) */}
          {mode === 'login' && loginType !== 'new-password' && loginType !== 'verify-otp' && loginType !== 'reset-verify' && (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Email or Mobile"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          )}

          {/* Password field (Sign Up Form view, Normal Password Login, and New Password reset) */}
          {((mode === 'signup' && !isVerifyingSignUp) || (mode === 'login' && loginType === 'password') || (loginType === 'new-password')) && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={loginType === 'new-password' ? 'New Password' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}

          {/* Repeat Password field (Sign Up Form view, and New Password reset only) */}
          {((mode === 'signup' && !isVerifyingSignUp) || (loginType === 'new-password')) && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={loginType === 'new-password' ? 'Confirm Password' : 'Repeat Password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}

          {/* OTP Code Input (SignUp Verification view, OTP Login verify, Password Reset recovery verify) */}
          {(isVerifyingSignUp || loginType === 'verify-otp' || loginType === 'reset-verify') && (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Enter 6-Digit OTP"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                style={{
                  ...inputStyle,
                  letterSpacing: otpCode ? '8px' : 'normal',
                  textAlign: otpCode ? 'center' : 'left',
                  fontSize: otpCode ? '20px' : '14px',
                  fontWeight: '800'
                }}
                required
              />
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#0B1F4D',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              opacity: loading ? 0.8 : 1,
              boxShadow: '0 6px 20px rgba(11, 31, 77, 0.15)'
            }}
          >
            {loading ? (
              <RefreshCcw size={18} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
            ) : mode === 'signup' ? (
              isVerifyingSignUp ? 'Verify & Register' : 'Create Account'
            ) : loginType === 'password' ? (
              'Sign In'
            ) : loginType === 'otp' ? (
              'Send OTP'
            ) : loginType === 'verify-otp' || loginType === 'reset-verify' ? (
              'Verify & Continue'
            ) : loginType === 'forgot' ? (
              'Reset Password'
            ) : (
              'Save Password'
            )}
          </button>

          {/* Back button during SignUp OTP Verification view */}
          {mode === 'signup' && isVerifyingSignUp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsVerifyingSignUp(false);
                  setOtpCode('');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3B82F6',
                  fontWeight: '800',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '13px'
                }}
              >
                Back to Edit Info
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLoginType('password');
                  setIsVerifyingSignUp(false);
                  setOtpCode('');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0B1F4D',
                  fontWeight: '800',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '13px'
                }}
              >
                Back to Login
              </button>
            </div>
          )}
        </form>

        {/* Support Options below button (only for Login mode) */}
        {mode === 'login' && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '22px',
            fontSize: '13px'
          }}>
            {loginType === 'password' && (
              <>
                <button
                  onClick={() => {
                    setLoginType('forgot');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3B82F6',
                    fontWeight: '800',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
                <button
                  onClick={() => {
                    setLoginType('otp');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0B1F4D',
                    fontWeight: '800',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Use OTP Login
                </button>
              </>
            )}

            {loginType === 'otp' && (
              <button
                onClick={() => {
                  setLoginType('password');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3B82F6',
                  fontWeight: '800',
                  cursor: 'pointer',
                  margin: '0 auto',
                  padding: 0
                }}
              >
                Use Password Login
              </button>
            )}

            {['forgot', 'verify-otp', 'reset-verify', 'new-password'].includes(loginType) && (
              <button
                onClick={() => {
                  setLoginType('password');
                  setErrorMsg('');
                  setSuccessMsg('');
                  setOtpCode('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3B82F6',
                  fontWeight: '800',
                  cursor: 'pointer',
                  margin: '0 auto',
                  padding: 0
                }}
              >
                Back to Login
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enter Demo Mode & Trial Section (Removed for Security) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 24px 32px'
      }}>

        {/* Footer info */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          fontSize: '11px',
          color: '#94A3B8',
          fontWeight: '600',
          lineHeight: '1.6'
        }}>
          <p style={{ margin: 0 }}>© 2024 Milvexa. All rights reserved.</p>
          <p style={{ margin: '2px 0 0 0', letterSpacing: '0.5px' }}>Version v1.1.2</p>
        </div>
      </div>

      {/* Inline Spinner CSS Animation styling */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '16px 20px',
  background: '#F0F3F8',
  border: '2px solid transparent',
  borderRadius: '16px',
  fontSize: '14px',
  fontWeight: '700',
  color: '#0B1F4D',
  outline: 'none',
  transition: 'all 0.2s'
};

export default Login;
