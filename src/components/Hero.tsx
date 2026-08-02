import { useState, useEffect } from "react";
import { ArrowRight, Cpu, Code, Database, Network, Shield, Terminal, Globe, Server, Binary } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Hero() {
  const { t, lang } = useLanguage();
  const [heroData, setHeroData] = useState<any>(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const docRef = doc(db, "website_settings", "hero");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHeroData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching hero data:", error);
      }
    };
    fetchHeroData();
  }, []);

  const badge = heroData ? (lang === 'km' ? heroData.badge : heroData.badgeEn) : t('hero.badge');
  const title1 = heroData ? (lang === 'km' ? heroData.title1 : heroData.title1En) : t('hero.title.1');
  const title2 = heroData ? (lang === 'km' ? heroData.title2 : heroData.title2En) : t('hero.title.2');
  const desc = heroData ? (lang === 'km' ? heroData.desc : heroData.descEn) : t('hero.desc');
  const btnCourses = heroData ? (lang === 'km' ? heroData.btnCourses : heroData.btnCoursesEn) : t('hero.btn.courses');
  const btnContact = heroData ? (lang === 'km' ? heroData.btnContact : heroData.btnContactEn) : t('hero.btn.contact');
  const imageUrl = heroData?.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  return (
    <section id="home" className="pt-28 pb-16 md:pt-32 md:pb-28 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 overflow-hidden relative">
        {/* Ambient Blur Spots */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[100px] opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-[100px] opacity-50 translate-y-1/3 -translate-x-1/3"></div>

        {/* Digital Tech Grid & Circuit Lines Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] dark:opacity-[0.15]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="tech-grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-600 dark:text-blue-400" />
                <circle cx="0" cy="0" r="2" fill="currentColor" className="text-blue-600 dark:text-blue-400" />
                <path d="M 0 30 L 15 30 L 30 45 L 60 45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-indigo-500 dark:text-indigo-400" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tech-grid-pattern)" />
          </svg>
        </div>

        {/* Floating Digital Tech Icons in Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden lg:block">
          <motion.div 
            animate={{ y: [0, -12, 0] }} 
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-12 left-[6%] text-blue-600/15 dark:text-blue-400/20"
          >
            <Cpu className="w-10 h-10" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 14, 0] }} 
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
            className="absolute top-1/4 right-[8%] text-indigo-600/15 dark:text-indigo-400/20"
          >
            <Code className="w-12 h-12" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute bottom-16 left-[10%] text-sky-600/15 dark:text-sky-400/20"
          >
            <Database className="w-10 h-10" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
            className="absolute top-1/2 left-[2%] text-purple-600/15 dark:text-purple-400/20"
          >
            <Network className="w-11 h-11" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -12, 0] }} 
            transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut" }}
            className="absolute bottom-1/3 right-[4%] text-blue-500/15 dark:text-blue-400/20"
          >
            <Terminal className="w-10 h-10" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 8, 0] }} 
            transition={{ repeat: Infinity, duration: 7.5, ease: "easeInOut" }}
            className="absolute top-8 right-[32%] text-blue-400/15 dark:text-blue-300/15"
          >
            <Shield className="w-8 h-8" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
            className="absolute bottom-8 right-[28%] text-indigo-400/15 dark:text-indigo-300/15"
          >
            <Globe className="w-9 h-9" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 8.5, ease: "easeInOut" }}
            className="absolute top-2/3 right-[42%] text-cyan-500/15 dark:text-cyan-400/20"
          >
            <Server className="w-8 h-8" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -8, 0] }} 
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
            className="absolute top-1/3 left-[45%] text-blue-500/10 dark:text-blue-400/15"
          >
            <Binary className="w-9 h-9" />
          </motion.div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-16">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="md:w-1/2 text-center md:text-left space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 text-primary text-sm font-bold tracking-wide uppercase shadow-sm border border-blue-200/50">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                      {badge}
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.5] tracking-tight">
                        {title1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">{title2}</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto md:mx-0">
                        {desc}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                        <a href="#courses" onClick={(e) => { e.preventDefault(); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 text-center flex items-center justify-center gap-2">
                          {btnCourses}
                          <ArrowRight className="w-5 h-5" />
                        </a>
                        <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:border-slate-300 hover:shadow-sm text-center">
                          {btnContact}
                        </a>
                    </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="md:w-1/2 relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-3xl transform rotate-3 scale-105"></div>
                    <img src={imageUrl} alt="Hero" className="rounded-3xl shadow-2xl shadow-slate-300/50 object-cover h-[450px] w-full border-[8px] border-white relative z-10" />
                </motion.div>
            </div>
        </div>
    </section>
  );
}
