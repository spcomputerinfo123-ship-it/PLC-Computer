import { useState, useEffect } from "react";
import { Target, Lightbulb, Heart, Cpu, Code, Network, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function About() {
  const { t, lang } = useLanguage();
  const [aboutData, setAboutData] = useState<any>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const docRef = doc(db, "website_settings", "about");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAboutData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching about data:", error);
      }
    };
    fetchAbout();
  }, []);

  const title = aboutData ? (lang === 'km' ? aboutData.title : aboutData.titleEn) : t('about.title');
  const desc = aboutData ? (lang === 'km' ? aboutData.desc : aboutData.descEn) : t('about.desc');
  
  const missionTitle = aboutData ? (lang === 'km' ? aboutData.missionTitle : aboutData.missionTitleEn) : t('about.mission');
  const missionDesc = aboutData ? (lang === 'km' ? aboutData.missionDesc : aboutData.missionDescEn) : t('about.mission.desc');
  
  const visionTitle = aboutData ? (lang === 'km' ? aboutData.visionTitle : aboutData.visionTitleEn) : t('about.vision');
  const visionDesc = aboutData ? (lang === 'km' ? aboutData.visionDesc : aboutData.visionDescEn) : t('about.vision.desc');
  
  const coreTitle = aboutData ? (lang === 'km' ? aboutData.coreTitle : aboutData.coreTitleEn) : t('about.core');
  const coreDesc = aboutData ? (lang === 'km' ? aboutData.coreDesc : aboutData.coreDescEn) : t('about.core.desc');

  return (
    <section id="about" className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
      {/* Background Circuit Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.1]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="about-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2563eb" strokeWidth="1" />
              <circle cx="20" cy="20" r="1.5" fill="#3b82f6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#about-grid)" />
        </svg>
      </div>

      {/* Floating Subtle Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden lg:block">
        <Cpu className="absolute top-16 left-[5%] w-10 h-10 text-blue-500/10 dark:text-blue-400/15" />
        <Code className="absolute bottom-20 left-[7%] w-10 h-10 text-indigo-500/10 dark:text-indigo-400/15" />
        <Network className="absolute top-1/3 right-[5%] w-12 h-12 text-purple-500/10 dark:text-purple-400/15" />
        <Globe className="absolute bottom-16 right-[8%] w-10 h-10 text-sky-500/10 dark:text-sky-400/15" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">{title}</h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">{desc}</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }} className="bg-slate-50 rounded-3xl p-10 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2 border border-slate-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner shadow-white">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{missionTitle}</h3>
            <p className="text-base text-slate-600 leading-relaxed">{missionDesc}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-slate-50 rounded-3xl p-10 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2 border border-slate-100">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner shadow-white">
              <Lightbulb className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{visionTitle}</h3>
            <p className="text-base text-slate-600 leading-relaxed">{visionDesc}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-slate-50 rounded-3xl p-10 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2 border border-slate-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner shadow-white">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{coreTitle}</h3>
            <p className="text-base text-slate-600 leading-relaxed">{coreDesc}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
