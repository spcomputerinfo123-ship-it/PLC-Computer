import { Menu, X, GraduationCap, Maximize, Minimize, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ onOpenLogin }: { onOpenLogin: () => void }) {
  const [logoError, setLogoError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center min-w-0 flex-shrink mr-2">
            <a href="#home" onClick={(e) => { e.preventDefault(); document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex items-center gap-2 min-w-0 overflow-hidden">
              {!logoError ? <img src="/logo.png" alt="PLC Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0" onError={() => setLogoError(true)} /> : <div className="flex w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white items-center justify-center rounded-lg text-lg font-bold flex-shrink-0">PLC</div>}
              <span className="font-bold text-lg sm:text-xl md:text-2xl text-primary truncate">{lang === 'km' ? 'ភី អិល ស៊ី កុំព្យូទ័រ' : 'PLC Computer'}</span>
            </a>
          </div>
          {/* Desktop Menu */}
          <nav className="hidden xl:flex space-x-6 lg:space-x-8">
            <a href="#home" onClick={(e) => { e.preventDefault(); document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-100 hover:text-primary text-[17px] font-bold transition">{t('nav.home')}</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-100 hover:text-primary text-[17px] font-bold transition">{t('nav.about')}</a>
            <a href="#courses" onClick={(e) => { e.preventDefault(); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-100 hover:text-primary text-[17px] font-bold transition">{t('nav.courses')}</a>
            <a href="#news" onClick={(e) => { e.preventDefault(); document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-100 hover:text-primary text-[17px] font-bold transition">{lang === 'km' ? 'ព័ត៌មាន' : 'News'}</a>
            <a href="#testimonials" onClick={(e) => { e.preventDefault(); document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-100 hover:text-primary text-[17px] font-bold transition">{lang === 'km' ? 'មតិយោបល់' : 'Reviews'}</a>
            <a href="#blog" onClick={(e) => { e.preventDefault(); document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-100 hover:text-primary text-[17px] font-bold transition">{lang === 'km' ? 'អត្ថបទ' : 'Blog'}</a>
            <a href="#gallery" onClick={(e) => { e.preventDefault(); document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-100 hover:text-primary text-[17px] font-bold transition">{t('nav.gallery')}</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-100 hover:text-primary text-[17px] font-bold transition">{t('nav.contact')}</a>
          </nav>
          <div className="hidden xl:flex items-center gap-3">
            {/* Light / Dark Mode Toggle Button */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 transition text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 bg-transparent focus:outline-none"
              title={lang === 'km' ? (isDarkMode ? 'ចុចដើម្បីបើកពន្លឺ' : 'ចុចដើម្បីបិទពន្លឺ') : (isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode')}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              )}
            </button>

            <button 
              onClick={() => setLang(lang === 'km' ? 'en' : 'km')}
              className="px-2 py-1 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-primary transition bg-transparent focus:outline-none"
              title="Toggle Language"
            >
              {lang === 'km' ? 'KH' : 'EN'}
            </button>
            <button 
              onClick={onOpenLogin} 
              className="p-2 transition text-primary hover:opacity-80 bg-transparent focus:outline-none"
              title={t('nav.login')}
            >
              <GraduationCap className="w-5 h-5" />
            </button>
            <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-primary hover:bg-blue-800 text-white px-5 py-2 rounded-full font-medium transition shadow-lg hidden lg:block text-sm">{t('nav.register')}</a>
            <button 
              onClick={toggleFullscreen}
              className="p-2 transition text-slate-600 dark:text-slate-300 hover:text-primary bg-transparent focus:outline-none"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Light / Dark Mode Toggle for Mobile */}
            <button 
              onClick={toggleDarkMode}
              className="p-1.5 transition text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 bg-transparent focus:outline-none"
              title={lang === 'km' ? (isDarkMode ? 'ចុចដើម្បីបើកពន្លឺ' : 'ចុចដើម្បីបិទពន្លឺ') : (isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode')}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              )}
            </button>

            <button 
              onClick={() => setLang(lang === 'km' ? 'en' : 'km')}
              className="px-1.5 py-1 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-primary transition bg-transparent focus:outline-none"
            >
              {lang === 'km' ? 'KH' : 'EN'}
            </button>
            <button 
              onClick={toggleFullscreen}
              className="hidden sm:block p-1.5 transition text-slate-600 dark:text-slate-300 hover:text-primary bg-transparent focus:outline-none"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button onClick={onOpenLogin} className="text-primary p-1.5 transition bg-transparent focus:outline-none" title={t('nav.login')}>
              <GraduationCap className="w-5 h-5" />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300 hover:text-primary p-1.5 transition bg-transparent focus:outline-none">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="xl:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 shadow-lg">
            <a href="#home" onClick={(e) => { e.preventDefault(); setIsOpen(false); document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }); }} className="block px-3 py-2 text-slate-800 dark:text-slate-100 font-bold text-[17px] hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-primary rounded-md">{t('nav.home')}</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); setIsOpen(false); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="block px-3 py-2 text-slate-800 dark:text-slate-100 font-bold text-[17px] hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-primary rounded-md">{t('nav.about')}</a>
            <a href="#courses" onClick={(e) => { e.preventDefault(); setIsOpen(false); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }} className="block px-3 py-2 text-slate-800 dark:text-slate-100 font-bold text-[17px] hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-primary rounded-md">{t('nav.courses')}</a>
            <a href="#news" onClick={(e) => { e.preventDefault(); setIsOpen(false); document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' }); }} className="block px-3 py-2 text-slate-800 dark:text-slate-100 font-bold text-[17px] hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-primary rounded-md">{lang === 'km' ? 'ព័ត៌មាន' : 'News'}</a>
            <a href="#testimonials" onClick={(e) => { e.preventDefault(); setIsOpen(false); document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }); }} className="block px-3 py-2 text-slate-800 dark:text-slate-100 font-bold text-[17px] hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-primary rounded-md">{lang === 'km' ? 'មតិយោបល់' : 'Reviews'}</a>
            <a href="#blog" onClick={(e) => { e.preventDefault(); setIsOpen(false); document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' }); }} className="block px-3 py-2 text-slate-800 dark:text-slate-100 font-bold text-[17px] hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-primary rounded-md">{lang === 'km' ? 'អត្ថបទ' : 'Blog'}</a>
            <a href="#gallery" onClick={(e) => { e.preventDefault(); setIsOpen(false); document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }); }} className="block px-3 py-2 text-slate-800 dark:text-slate-100 font-bold text-[17px] hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-primary rounded-md">{t('nav.gallery')}</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); setIsOpen(false); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="block px-3 py-2 text-slate-800 dark:text-slate-100 font-bold text-[17px] hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-primary rounded-md">{t('nav.contact')}</a>
          </div>
        </div>
      )}
    </header>
  );
}

