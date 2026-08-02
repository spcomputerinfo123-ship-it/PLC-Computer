import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    telegramLink: 'https://t.me/PLCComputer',
    facebookLink: 'https://facebook.com/plccomputer',
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 mb-4 w-64 flex flex-col gap-3"
          >
            <div className="text-sm font-bold text-slate-800 mb-1 border-b border-slate-100 pb-2">
              ទាក់ទងមកយើងខ្ញុំ
            </div>
            
            <a 
              href={settings.facebookLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-3 bg-slate-50 hover:bg-[#1877F2]/10 p-3 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.14 2 11.25c0 2.915 1.488 5.485 3.793 7.155v3.42l3.447-1.892c.866.242 1.79.37 2.76.37 5.523 0 10-4.14 10-9.25S17.523 2 12 2zm1.185 12.392l-2.99-3.21-5.83 3.21 6.398-6.84 3.08 3.21 5.74-3.21-6.398 6.84z"/></svg>
              </div>
              <div className="text-sm font-bold text-slate-700 group-hover:text-[#1877F2] transition-colors">Facebook</div>
            </a>

            <a 
              href={settings.telegramLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-3 bg-slate-50 hover:bg-[#229ED9]/10 p-3 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-[#229ED9] rounded-full flex items-center justify-center pl-0.5 shrink-0">
                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.623 4.823-4.35c.212-.19-.044-.296-.332-.104l-5.973 3.76-2.538-.792c-.553-.173-.564-.553.115-.82l9.904-3.816c.458-.16.866.115.866.55z" /></svg>
              </div>
              <div className="text-sm font-bold text-slate-700 group-hover:text-[#229ED9] transition-colors">Telegram</div>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all hover:scale-105 ${!isOpen ? 'animate-bounce hover:animate-none' : ''}`}
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </button>
    </div>
  );
}
