import { X, Lock, GraduationCap, ArrowRight, ShieldAlert, Mail, Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";

interface LoginModalProps {
  isOpen: boolean;
  type: 'student' | 'admin';
  onClose: () => void;
  onSuccess?: () => void;
  onLogin: () => void;
  onLoginWithEmail?: (email: string, pass: string) => Promise<void>;
  onResetPassword?: (email: string) => Promise<void>;
  onRegisterWithEmail?: (name: string, email: string, pass: string) => Promise<void>;
}

export default function LoginModal({ isOpen, type, onClose, onSuccess, onLogin, onLoginWithEmail, onResetPassword, onRegisterWithEmail }: LoginModalProps) {
  const { lang, t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;
  
  // Reset state when opening/closing
  if (!isOpen && isRegistering) {
     setName('');
     setIsRegistering(false);
     setConfirmPassword('');
     setError('');
  }

    const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegistering) {
        if (!onRegisterWithEmail) return;
        if (password.length < 8) {
          setError(lang === 'km' ? 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ តួអក្សរ' : 'Password must be at least 8 characters');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError(lang === 'km' ? 'ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ' : 'Passwords do not match');
          setLoading(false);
          return;
        }
        if (!name) {
          setError(lang === 'km' ? 'សូមបញ្ចូលឈ្មោះរបស់អ្នក' : 'Please enter your name');
          setLoading(false);
          return;
        }
        await onRegisterWithEmail(name, email, password);
      } else {
        if (!onLoginWithEmail) return;
        await onLoginWithEmail(email, password);
      }
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      const isOpNotAllowed = err?.code === 'auth/operation-not-allowed' || (err?.message && err.message.includes('operation-not-allowed'));
      if (isOpNotAllowed) {
        setError(lang === 'km' 
          ? 'បញ្ចូលគណនីមិនត្រឹមត្រូវ សូមព្យាយាមម្ដង' 
          : 'Invalid account credentials, please try again.');
      } else if (isRegistering) {
        if (err?.code === 'auth/email-already-in-use' || (err?.message && err.message.includes('auth/email-already-in-use'))) {
          setError(lang === 'km' ? 'អ៊ីមែលនេះមានគណនីរួចហើយ' : 'Email already in use');
        } else if (err?.code === 'auth/weak-password' || (err?.message && err.message.includes('auth/weak-password'))) {
          setError(lang === 'km' ? 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ' : 'Password should be at least 6 characters');
        } else {
          setError(lang === 'km' ? 'ការចុះឈ្មោះមិនបានសម្រេច៖ ' + (err?.message || '') : 'Registration failed: ' + (err?.message || ''));
        }
      } else {
        if (err?.message === 'NOT_ADMIN') {
          setError(lang === 'km' ? 'អ្នកមិនមានសិទ្ធិចូលប្រើប្រាស់ប្រព័ន្ធគ្រប់គ្រងទេ' : 'You do not have permission to access the management system');
        } else if (err?.message === 'SUSPENDED') {
          setError(lang === 'km' ? 'គណនីរបស់អ្នកត្រូវបានផ្អាកដំណើរការ' : 'Your account has been suspended');
        } else {
          setError(lang === 'km' ? 'បញ្ចូលគណនីមិនត្រឹមត្រូវ សូមព្យាយាមម្ដង' : 'Invalid account credentials, please try again');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div 
      className="fixed inset-0 z-[300] bg-slate-900/60 flex items-center justify-center backdrop-blur-sm transition-opacity p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative transform scale-100 transition-transform overflow-hidden flex flex-col md:flex-row">
            {/* Top Right Close Button */}
            <button 
              type="button" 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                onClose(); 
              }} 
              className="absolute top-4 right-4 md:top-5 md:right-5 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all focus:outline-none z-[100] cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              aria-label="Close"
              title="បិទ (Close)"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Left Side: Information */}
            <div className={`hidden md:flex flex-col justify-between w-1/2 p-8 lg:p-12 text-white relative ${type === 'admin' ? 'bg-slate-900' : 'bg-[#1a56db]'}`}>
               <div className="absolute inset-0">
                 {/* subtle background pattern or image if needed, for now just a solid color with a gradient */}
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-700/50"></div>
                 <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80" alt="Background" className="w-full h-full object-cover mix-blend-overlay opacity-30" />
               </div>
               <div className="relative z-10 flex flex-col h-full">
                 <div>
                   <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-sm">
                     {type === 'admin' ? <ShieldAlert className="w-7 h-7 text-white" /> : <GraduationCap className="w-7 h-7 text-white" />}
                   </div>
                   <h2 className="text-[1.8rem] lg:text-[2.1rem] font-black mb-4 leading-tight tracking-tight">
                     {type === 'admin' 
                        ? (lang === 'km' ? 'ប្រព័ន្ធគ្រប់គ្រងសាលា' : 'School Management System')
                        : (lang === 'km' ? 'សូមស្វាគមន៍មកកាន់\u00A0PLC' : 'Welcome to PLC')}
                   </h2>
                   <p className="text-white/90 text-lg leading-relaxed whitespace-nowrap">
                     {type === 'admin' 
                        ? (lang === 'km' ? 'គ្រប់គ្រងទិន្នន័យ និងប្រតិបត្តិការសាលាដោយប្រសិទ្ធភាព' : 'Manage school data and operations efficiently')
                        : (lang === 'km' ? 'ចូលរៀនវគ្គសិក្សារបស់អ្នក និងអភិវឌ្ឍជំនាញថ្មីៗ' : 'Access your courses and develop new skills')}
                   </p>
                 </div>
                 
                 <div className="mt-auto pt-12">
                   <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-sm">
                     <div className="flex -space-x-4">
                       <img className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Student" />
                       <img className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Student" />
                       <img className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" alt="Student" />
                     </div>
                     <div className="text-sm font-bold text-white whitespace-nowrap">
                       {lang === 'km' ? 'ចូលរួមជាមួយសិស្សជាង ១០០០+ នាក់' : 'Join 1000+ students'}
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-1/2 p-8 lg:p-12 relative bg-white flex flex-col justify-center">
               <div className="mb-8">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2 tracking-tight">
                    {type === 'admin' ? t('login.admin') : (isRegistering ? (lang === 'km' ? 'បង្កើតគណនីថ្មី' : 'Create Account') : t('login.student'))}
                  </h3>
                  <p className="text-slate-500 font-medium text-[15px]">
                    {type === 'admin' ? (lang === 'km' ? 'សូមបញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់អ្នកគ្រប់គ្រង' : 'Please enter your admin credentials') : (isRegistering ? (lang === 'km' ? 'សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីចុះឈ្មោះ' : 'Please fill the details below to register') : (lang === 'km' ? 'សូមបញ្ចូលគណនីសិស្សរបស់អ្នក' : 'Please sign in with your student account'))}
                  </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                  {error && <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
                  
                                    {isRegistering && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-[15px] font-bold text-slate-700 mb-2 ">{lang === 'km' ? 'ឈ្មោះ' : 'Name'}</label>
                      <div className="relative mb-4">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required={isRegistering} className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 text-[15px]" placeholder={lang === 'km' ? 'ឈ្មោះរបស់អ្នក' : 'Your name'} />
                      </div>
                    </motion.div>
                  )}
                  <div>
                    <label className="block text-[15px] font-bold text-slate-700 mb-2 ">{lang === 'km' ? 'អ៊ីមែល' : 'Email'}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 text-[15px]" placeholder="name@example.com" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[15px] font-bold text-slate-700 mb-2 ">{lang === 'km' ? 'ពាក្យសម្ងាត់' : 'Password'}</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 text-[15px]" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {isRegistering && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-[15px] font-bold text-slate-700 mb-2 mt-2 ">{lang === 'km' ? 'បញ្ជាក់ពាក្យសម្ងាត់' : 'Confirm Password'}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 text-[15px]" placeholder="••••••••" />
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-2">
                    <button type="submit" disabled={loading || !email || !password || (isRegistering && (!name || !confirmPassword))} className={`w-full font-bold py-4 px-8 rounded-xl transition-all duration-300 flex justify-center items-center text-[16px]  ${(loading || !email || !password || (isRegistering && (!name || !confirmPassword))) ? 'opacity-60 cursor-not-allowed' : ''} ${type === 'admin' ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-[#7a8ceb] hover:bg-[#6c7fdd] text-white'}`}>
                      {loading ? (lang === 'km' ? (isRegistering ? 'កំពុងចុះឈ្មោះ...' : 'កំពុងចូល...') : (isRegistering ? 'Registering...' : 'Signing in...')) : (lang === 'km' ? (isRegistering ? 'ចុះឈ្មោះចូលរៀន' : 'ចូលប្រព័ន្ធ') : (isRegistering ? 'Register Account' : 'Sign In'))}
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                      {type === 'student' ? (
                        <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); setConfirmPassword(''); }} className="text-[14px] font-bold transition-colors">
                          {isRegistering ? (
                            <><span className="text-slate-500">{lang === 'km' ? 'មានគណនីរួចហើយ? ' : 'Already have an account? '}</span><span className="text-blue-700">{lang === 'km' ? 'ចូលប្រព័ន្ធ' : 'Sign In'}</span></>
                          ) : (
                            <><span className="text-slate-500">{lang === 'km' ? 'មិនទាន់មានគណនី? ' : 'Need an account? '}</span><span className="text-blue-700">{lang === 'km' ? 'ចុះឈ្មោះ' : 'Register'}</span></>
                          )}
                        </button>
                      ) : (
                        <div />
                      )}
                      
                      {!isRegistering && (
                        <button type="button" onClick={async () => { 
                           if (!email) {
                            setError(lang === 'km' ? 'សូមបញ្ចូលអ៊ីមែលសិន' : 'Please enter your email first');
                            return;
                          }
                          if (onResetPassword) {
                            try {
                              await onResetPassword(email);
                              setResetSent(true); 
                              setTimeout(() => setResetSent(false), 3000);
                            } catch (e) {
                              setError(lang === 'km' ? 'មានបញ្ហាក្នុងការផ្ញើសារ' : 'Error sending email');
                            }
                          }
                        }} className="text-[14px] font-bold text-blue-700 hover:text-blue-800 transition-colors ">
                          {resetSent ? (lang === 'km' ? 'បានផ្ញើសារ!' : 'Email sent!') : (lang === 'km' ? 'ភ្លេចពាក្យសម្ងាត់?' : 'Forgot password?')}
                        </button>
                      )}
                  </div>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400 font-bold ">{lang === 'km' ? 'ឬ' : 'OR'}</span></div>
              </div>

              <div>
                  <button type="button" disabled={loading} onClick={async () => {
    if (loading) return;
    setLoading(true);
    try {
      setError('');
      await onLogin();
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      if (err?.code === 'auth/cancelled-popup-request' || err?.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (err?.code === 'auth/unauthorized-domain') {
        setError(lang === 'km' 
          ? 'មិនអាចចូលប្រើប្រាស់តាមរយៈ Google ពី Domain នេះបានទេ។ សូមប្រើប្រាស់ អ៊ីមែល និង ពាក្យសម្ងាត់ ឬ ទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធ' 
          : 'Google Sign-In is not enabled for this domain. Please sign in with Email & Password or contact the administrator.');
      } else if (err?.message === 'NOT_ADMIN') {
        setError(lang === 'km' ? 'អ្នកមិនមានសិទ្ធិចូលប្រើប្រាស់ប្រព័ន្ធគ្រប់គ្រងទេ' : 'You do not have permission to access the management system');
      } else {
        setError(lang === 'km' ? 'មិនអាចចូលប្រើប្រាស់តាមរយៈ Google បានទេ សូមព្យាយាមម្តងទៀត' : 'Failed to connect with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }} className={`w-full font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-sm hover:shadow flex justify-center items-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 group text-[15px] ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {lang === 'km' ? 'ចូលតាមរយៈ Google' : 'Continue with Google'}
                  </button>
              </div>
            </div>
        </div>
    </div>
  );
}
