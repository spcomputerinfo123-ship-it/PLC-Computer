/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import About from "./components/About";
import Courses from "./components/Courses";
import Team from "./components/Team";
import Testimonials from "./components/Testimonials";
import Blog from "./components/Blog";
import Careers from "./components/Careers";
import Alumni from "./components/Alumni";
import Stats from "./components/Stats";
import PromoVideo from "./components/PromoVideo";
import Partners from "./components/Partners";
import Gallery from "./components/Gallery";
import NewsEvents from "./components/NewsEvents";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import PromoPopup from "./components/PromoPopup";
import FloatingChat from "./components/FloatingChat";
import LoginModal from "./components/LoginModal";
import { PromoContent } from "./types";
import { LanguageProvider } from "./context/LanguageContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./lib/firebase";

import Dashboard from "./components/Dashboard";

import RegistrationModal from "./components/RegistrationModal";

function PublicSite({ promoContent, role }: { promoContent: PromoContent, role: string }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginType, setLoginType] = useState<'student' | 'admin'>('student');
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regCourseTitle, setRegCourseTitle] = useState("");
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithEmail, resetPassword, registerWithEmail } = useAuth();
  const isPreview = window.location.search.includes('preview=true');

  const handleOpenRegistration = (title?: string) => {
    setRegCourseTitle(title || "អាហារូបករណ៍ CSR");
    setIsRegModalOpen(true);
  };

  useEffect(() => {
    // Only check for admin flags if we are at the root and haven't already processed it
    const search = window.location.search.toLowerCase();
    if (search.includes('admin')) {
      // Clean up the URL so it doesn't loop
      window.history.replaceState(null, '', window.location.pathname);
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  if (role === 'student' && !isPreview) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (role === 'admin' && !isPreview) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        onOpenLogin={() => { setLoginType('student'); setIsLoginOpen(true); }} 
      />
      <main>
        <Hero />
        <Stats />
        <About />
        <Features />
        <PromoVideo />
        <Courses />
        <NewsEvents />
        <Team />
        <Testimonials />
        <Blog />
        <Careers />
        <Alumni />
        <Gallery />
        <Partners />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      
      <PromoPopup content={promoContent} disabled={isLoginOpen || isRegModalOpen} onOpenRegistration={handleOpenRegistration} />
      <FloatingChat />
      <RegistrationModal 
        isOpen={isRegModalOpen} 
        onClose={() => setIsRegModalOpen(false)} 
        courseTitle={regCourseTitle} 
      />
      <LoginModal 
        isOpen={isLoginOpen} 
        type={loginType} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={() => setIsLoginOpen(false)}
        onLogin={() => loginWithGoogle(loginType)}
        onLoginWithEmail={(email, pass) => loginWithEmail(email, pass, loginType)} 
        onResetPassword={resetPassword}
        onRegisterWithEmail={registerWithEmail}
      />
    </div>
  );
}

function AdminRoute({ promoContent, setPromoContent }: { promoContent: PromoContent, setPromoContent: any }) {
  const navigate = useNavigate();
  const { user, role, loading, logout, loginWithGoogle, loginWithEmail, resetPassword, registerWithEmail } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (role === 'admin') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
        <Dashboard
          user={user} 
          role={role} 
          promoContent={promoContent} 
          onUpdatePromo={setPromoContent} 
          onLogout={logout} 
        />
      </Suspense>
    );
  }

  // Not logged in as admin, show login modal
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <LoginModal 
        isOpen={true} 
        type="admin"
        onClose={() => navigate('/', { replace: true })} 
        onSuccess={() => navigate('/admin', { replace: true })}
        onLogin={() => loginWithGoogle('admin')}
        onLoginWithEmail={(email, pass) => loginWithEmail(email, pass, 'admin')} 
        onResetPassword={resetPassword}
        onRegisterWithEmail={registerWithEmail}
      />
    </div>
  );
}

function StudentRoute({ promoContent, setPromoContent }: { promoContent: PromoContent, setPromoContent: any }) {
  const navigate = useNavigate();
  const { user, role, loading, logout, loginWithGoogle, loginWithEmail, resetPassword, registerWithEmail } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (role === 'student' || role === 'admin') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
        <Dashboard
          user={user} 
          role={role} 
          promoContent={promoContent} 
          onUpdatePromo={setPromoContent} 
          onLogout={logout} 
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <LoginModal 
        isOpen={true} 
        type="student"
        onClose={() => navigate('/', { replace: true })} 
        onSuccess={() => navigate('/dashboard', { replace: true })}
        onLogin={() => loginWithGoogle('student')}
        onLoginWithEmail={(email, pass) => loginWithEmail(email, pass, 'student')} 
        onResetPassword={resetPassword}
        onRegisterWithEmail={registerWithEmail}
      />
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const { role, loading } = useAuth();
  
  const [promoContent, setPromoContent] = useState<PromoContent>({
    title: 'អាហារូបករណ៍ CSR',
    title_en: 'CSR Scholarship',
    text: 'ទទួលបានអាហារូបករណ៍រហូតដល់ ៥០% សម្រាប់សិស្សឆ្នើម!',
    text_en: 'Get up to 50% scholarship for outstanding students!',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
  });

  useEffect(() => {
    // Global Keyboard Shortcut: Ctrl + Shift + A or Alt + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const promoDoc = await getDoc(doc(db, "promo_content", "current"));
        if (promoDoc.exists()) {
          setPromoContent(promoDoc.data() as PromoContent);
        }
      } catch (error) {
        // Silently fallback to default promo content
      }
    };
    fetchPromo();
  }, []);

  const isPreview = window.location.search.includes('preview=true');

  if (loading && !isPreview) {
    return <div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<PublicSite promoContent={promoContent} role={role} />} />
      <Route path="/admin" element={<AdminRoute promoContent={promoContent} setPromoContent={setPromoContent} />} />
      <Route path="/dashboard" element={<StudentRoute promoContent={promoContent} setPromoContent={setPromoContent} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
