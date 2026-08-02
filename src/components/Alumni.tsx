import { useState, useEffect } from "react";
import { Quote } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Alumni() {
  const { t, lang } = useLanguage();
  const [alumni, setAlumni] = useState<any[]>([]);

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const q = query(collection(db, "alumni"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedAlumni = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedAlumni.length > 0) {
          setAlumni(fetchedAlumni);
        } else {
          // Default mock data if no alumni in firestore
          setAlumni([
            {
              id: "1",
              name: "កញ្ញា សុខ លីណា",
              nameEn: "Ms. Sok Lina",
              role: "Senior UX/UI Designer",
              roleEn: "Senior UX/UI Designer",
              company: "ABA Bank",
              companyEn: "ABA Bank",
              image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
            },
            {
              id: "2",
              name: "លោក ចាន់ សំណាង",
              nameEn: "Mr. Chan Samnang",
              role: "Full-Stack Developer",
              roleEn: "Full-Stack Developer",
              company: "Smart Axiata",
              companyEn: "Smart Axiata",
              image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
            },
            {
              id: "3",
              name: "អ្នកនាង ម៉ៅ ស្រីលាភ",
              nameEn: "Ms. Mao Sreyleap",
              role: "IT Project Manager",
              roleEn: "IT Project Manager",
              company: "Wing Bank",
              companyEn: "Wing Bank",
              image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
            },
            {
              id: "4",
              name: "លោក ទេព វិសាល",
              nameEn: "Mr. Tep Visal",
              role: "Cybersecurity Analyst",
              roleEn: "Cybersecurity Analyst",
              company: "Cellcard",
              companyEn: "Cellcard",
              image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching alumni:", error);
      }
    };
    fetchAlumni();
  }, []);

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="alumni">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none opacity-50"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-black text-slate-900 mb-6"
            >
              {t('alumni.title')}
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="h-1.5 w-24 bg-primary/20 rounded-full mb-6 relative"
            >
              <div className="absolute top-0 left-0 h-full w-1/2 bg-primary rounded-full"></div>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-xl text-slate-600"
            >
              {t('alumni.desc')}
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {alumni.map((alum, index) => (
            <motion.div
              key={alum.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-blue-600 rounded-3xl transform rotate-3 transition-transform duration-300 group-hover:rotate-6 opacity-10"></div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative z-10 transition-transform duration-300 group-hover:-translate-y-2">
                <Quote className="w-10 h-10 text-blue-100 absolute top-6 right-6" />
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full p-1.5 bg-gradient-to-tr from-blue-500 to-indigo-500 mb-6 relative group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src={alum.image} 
                      alt={alum.name}
                      className="w-full h-full object-cover rounded-full border-4 border-white"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-black">🌟</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{lang === 'km' ? alum.name : (alum.nameEn || alum.name)}</h3>
                  <p className="text-primary font-semibold text-sm mb-2">{lang === 'km' ? alum.role : (alum.roleEn || alum.role)}</p>
                  
                  <div className="w-12 h-0.5 bg-slate-200 my-4"></div>
                  
                  <p className="text-slate-500 text-sm font-medium">
                    {lang === 'km' ? 'បច្ចុប្បន្នបម្រើការនៅ៖' : 'Currently working at:'}
                    <br />
                    <span className="text-slate-800 font-bold block mt-1">{lang === 'km' ? alum.company : (alum.companyEn || alum.company)}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
