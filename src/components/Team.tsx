import { useState, useEffect } from "react";
import { Linkedin, Twitter, Facebook } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Team() {
  const { t, lang } = useLanguage();
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const q = query(collection(db, "team"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        const fetchedTeam = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedTeam.length > 0) {
          setTeam(fetchedTeam);
        } else {
          // Default mock data if no team in firestore
          setTeam([
            {
              id: "1",
              name: "ឯកឧត្តម បណ្ឌិត សុខ សុវណ្ណ",
              nameEn: "H.E. Dr. Sok Sovann",
              role: "នាយកមជ្ឈមណ្ឌល",
              roleEn: "Center Director",
              image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            },
            {
              id: "2",
              name: "អ្នកគ្រូ ចាន់ សុភា",
              nameEn: "Ms. Chan Sophea",
              role: "ប្រធានផ្នែកបណ្តុះបណ្តាល",
              roleEn: "Head of Training",
              image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            },
            {
              id: "3",
              name: "លោក ម៉េង លី",
              nameEn: "Mr. Meng Ly",
              role: "សាស្ត្រាចារ្យផ្នែកសរសេរកូដ",
              roleEn: "Programming Instructor",
              image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            },
            {
              id: "4",
              name: "កញ្ញា រិទ្ធី មុន្នី",
              nameEn: "Ms. Rithy Munny",
              role: "សាស្ត្រាចារ្យរចនាក្រាហ្វិក",
              roleEn: "Graphic Design Instructor",
              image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching team:", error);
      }
    };
    fetchTeam();
  }, []);

  return (
    <section id="team" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 -mr-64 -mt-64 w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-[100px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-6"
          >
            {t('team.title')}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="h-1.5 w-24 bg-primary/20 mx-auto rounded-full mb-8 relative"
          >
            <div className="absolute top-0 left-1/4 h-full w-1/2 bg-primary rounded-full"></div>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xl text-slate-600 leading-relaxed"
          >
            {t('team.desc')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-3xl mb-6 bg-white shadow-xl shadow-slate-200/40 aspect-[4/5]">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay with Social Icons */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                  <div className="flex gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <a href="#team" onClick={(e) => e.preventDefault()} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href="#team" onClick={(e) => e.preventDefault()} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-blue-400 transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a href="#team" onClick={(e) => e.preventDefault()} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-blue-700 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="text-center px-2">
                <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                  {lang === 'km' ? member.name : (member.nameEn || member.name)}
                </h3>
                <p className="text-slate-500 font-medium">
                  {lang === 'km' ? member.role : (member.roleEn || member.role)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
