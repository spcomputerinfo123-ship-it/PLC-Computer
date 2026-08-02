import { useState, useEffect } from "react";
import { ChevronRight, Facebook, Youtube, Send, Cpu, Code, Database, Network, Shield, Terminal, Globe, Server, Wifi } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Footer() {
  const [logoError, setLogoError] = useState(false);
  const { lang, t } = useLanguage();
  const [settings, setSettings] = useState({
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://t.me/plccomputer',
    telegramLink: 'https://t.me/plccomputer',
    facebookLink: 'https://facebook.com/plccomputer',
    youtubeLink: 'https://youtube.com/@plccomputer',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'website_settings', 'current'));
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-8 border-t border-slate-800 relative overflow-hidden">
        {/* Digital Tech Circuit Grid Pattern for Footer */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="footer-tech-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#3b82f6" strokeWidth="1" />
                <circle cx="25" cy="25" r="1.5" fill="#60a5fa" />
                <path d="M 0 25 L 25 25 L 50 50" fill="none" stroke="#6366f1" strokeWidth="0.8" strokeDasharray="2 2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#footer-tech-grid)" />
          </svg>
        </div>

        {/* Floating Digital Tech Icons in Footer Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <Cpu className="absolute top-10 left-[4%] w-10 h-10 text-blue-500/10 animate-pulse" />
          <Code className="absolute top-12 right-[6%] w-11 h-11 text-indigo-400/10" />
          <Database className="absolute bottom-16 left-[8%] w-10 h-10 text-cyan-400/10" />
          <Network className="absolute top-1/2 left-[28%] w-12 h-12 text-blue-400/10" />
          <Shield className="absolute bottom-10 right-[35%] w-9 h-9 text-purple-400/10" />
          <Terminal className="absolute top-20 left-[48%] w-9 h-9 text-slate-400/10" />
          <Globe className="absolute bottom-12 right-[8%] w-10 h-10 text-blue-400/10" />
          <Server className="absolute top-1/3 right-[22%] w-10 h-10 text-sky-400/10" />
          <Wifi className="absolute bottom-24 left-[45%] w-8 h-8 text-indigo-400/10" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
                <div className="space-y-6 md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        {!logoError ? <img src="/logo.png" alt="PLC Logo" className="w-12 h-12 object-contain bg-white rounded-lg p-1" onError={() => setLogoError(true)} /> : <div className="flex w-10 h-10 bg-white text-slate-900 items-center justify-center rounded-xl text-lg font-black shadow-lg shadow-white/10">PLC</div>}
                        <span className="font-bold text-2xl text-white tracking-tight">{lang === 'km' ? 'ភី អិល ស៊ី កុំព្យូទ័រ' : 'PLC Computer'}</span>
                    </div>
                    <p className="text-base leading-relaxed text-slate-400 mb-6 max-w-sm">{t('footer.desc')}</p>
                    <div className="flex gap-4">
                        <a href={settings.facebookLink} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all">
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a href={settings.youtubeLink} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-all">
                            <Youtube className="w-5 h-5" />
                        </a>
                        <a href={settings.telegramLink} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-[#229ED9] hover:text-white transition-all pl-0.5">
                            <Send className="w-5 h-5" />
                        </a>
                    </div>
                </div>
                <div>
                    <h4 className="text-white font-bold text-xl mb-6">{t('footer.links')}</h4>
                    <ul className="space-y-4 text-base">
                        <li><a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary transition flex items-center group"><ChevronRight className="w-4 h-4 mr-2 text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />{t('nav.about')}</a></li>
                        <li><a href="#courses" onClick={(e) => { e.preventDefault(); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary transition flex items-center group"><ChevronRight className="w-4 h-4 mr-2 text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />{t('footer.all_courses')}</a></li>
                        <li><a href="#gallery" onClick={(e) => { e.preventDefault(); document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary transition flex items-center group"><ChevronRight className="w-4 h-4 mr-2 text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />{t('nav.gallery')}</a></li>
                        <li><a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary transition flex items-center group"><ChevronRight className="w-4 h-4 mr-2 text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />{t('nav.contact')}</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold text-xl mb-6">{lang === 'km' ? 'ស្កេនដើម្បីទាក់ទង' : 'Scan to Connect'}</h4>
                    <div className="bg-white p-2 rounded-xl inline-block">
                      <img src={settings.qrCodeUrl} alt="QR Code" className="w-28 h-28 object-contain rounded-lg" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                    <p className="mt-3 text-sm text-slate-400">{lang === 'km' ? 'ស្កេន QR កូដខាងលើដើម្បីទាក់ទងតាមតេឡេក្រាម ឬទូទាត់ប្រាក់' : 'Scan the QR code above to connect via Telegram or make payments.'}</p>
                </div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-slate-500">
                <div>
                    <span className="mr-4">&copy; {new Date().getFullYear()} {t('footer.copyright')}</span>
                    <a href="#footer" onClick={(e) => e.preventDefault()} className="hover:text-white transition mr-4">{t('footer.terms')}</a>
                    <a href="#footer" onClick={(e) => e.preventDefault()} className="hover:text-white transition">{t('footer.privacy')}</a>
                </div>
            </div>
        </div>
    </footer>
  );
}
