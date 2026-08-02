import { motion } from "motion/react";
import { Star, Quote, BookOpen, Book, FileText, Bookmark, GraduationCap } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const defaultTestimonials = [
  {
    id: "demo-1",
    name: "សុខ សាន្ត",
    name_en: "Sok San",
    role: "សិស្សបញ្ចប់វគ្គ Web Development",
    role_en: "Web Development Graduate",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    text: "វគ្គសិក្សានេះពិតជាល្អខ្លាំងណាស់! គ្រូបង្រៀនពន្យល់បានច្បាស់លាស់ និងមានការអនុវត្តផ្ទាល់ច្រើន។ ឥឡូវនេះខ្ញុំអាចបង្កើត Website ខ្លួនឯងបានយ៉ាងរលូន។",
    text_en: "This course is really great! The teachers explain clearly with lots of practical practice. Now I can build my own websites smoothly.",
    rating: 5
  },
  {
    id: "demo-2",
    name: "ម៉ី សុធារី",
    name_en: "Mey Sotheary",
    role: "សិស្សបញ្ចប់វគ្គ Graphic Design & UI/UX",
    role_en: "Graphic Design & UI/UX Graduate",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    text: "គ្រូមានបទពិសោធន៍ច្រើន និងពន្យល់បានច្បាស់ល្អ។ ខ្ញុំសូមណែនាំអ្នកដែលចង់រៀនជំនាញ IT និង Design មកសិក្សានៅទីនេះ។",
    text_en: "The instructors are very experienced and explain very clearly. I highly recommend anyone wanting to learn IT and Design to study here.",
    rating: 5
  },
  {
    id: "demo-3",
    name: "រតនៈ ឧត្តម",
    name_en: "Ratanak Oudom",
    role: "សិស្សបញ្ចប់វគ្គ Network Engineer & Server",
    role_en: "Network Engineer Graduate",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    text: "មជ្ឈមណ្ឌលមានឧបករណ៍ទំនើបៗសម្រាប់អនុវត្តផ្ទាល់។ ខ្ញុំពេញចិត្តខ្លាំងណាស់ចំពោះគុណភាពនៃការបង្រៀន និងការយកចិត្តទុកដាក់។",
    text_en: "The institute has modern equipment for hands-on practice. I am very satisfied with the quality of teaching and support.",
    rating: 5
  },
  {
    id: "demo-4",
    name: "ចាន់ ធារី",
    name_en: "Chan Theary",
    role: "និស្សិតទទួលបានអាហារូបករណ៍ Mobile App",
    role_en: "Mobile App Scholarship Student",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    text: "សូមអរគុណដល់មជ្ឈមណ្ឌលដែលបានផ្តល់អាហារូបករណ៍ និងឱកាសរៀនសូត្រជំនាញបច្ចេកវិទ្យាថ្មីៗដល់រូបខ្ញុំ។ បរិយាកាសសិក្សាទំនើបខ្លាំង!",
    text_en: "Thanks to the center for providing scholarships and tech learning opportunities. Very modern learning environment!",
    rating: 5
  },
  {
    id: "demo-5",
    name: "លី ណារិទ្ធ",
    name_en: "Ly Narith",
    role: "សិស្សបញ្ចប់វគ្គ Digital Marketing & Media",
    role_en: "Digital Marketing Graduate",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    text: "រៀនចប់ទទួលបានជំនាញពិតប្រាកដ និងមានការជួយជ្រោមជ្រែងក្នុងការរៀបចំ Portfolio ដើម្បីដាក់ពាក្យធ្វើការងារ។ Recommend ខ្លាំងណាស់!",
    text_en: "Graduated with real skills and great portfolio guidance for job hunting. Highly recommended!",
    rating: 5
  }
];

export default function Testimonials() {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(collection(db, "testimonials"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data.length >= 3) {
          setItems(data);
        } else if (data.length > 0) {
          // Combine existing Firestore data with default samples so there are at least 3 cards
          const combined: any[] = [...data];
          defaultTestimonials.forEach(def => {
            if (combined.length < 3 && !combined.some(item => item.name === def.name)) {
              combined.push(def);
            }
          });
          setItems(combined);
        } else {
          setItems(defaultTestimonials.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setItems(defaultTestimonials.slice(0, 3));
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 relative overflow-hidden" id="testimonials">
      {/* Book Pages & Fold Crease Pattern Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] dark:opacity-[0.12]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="testimonial-book-pattern" width="90" height="90" patternUnits="userSpaceOnUse">
              {/* Paper ruled lines */}
              <line x1="0" y1="22" x2="90" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-blue-500" />
              <line x1="0" y1="45" x2="90" y2="45" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-blue-500" />
              <line x1="0" y1="68" x2="90" y2="68" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-blue-500" />
              {/* Curved Open Book Pages Silhouette Outline */}
              <path d="M 5 70 Q 22 62 45 70 Q 68 62 85 70" stroke="currentColor" strokeWidth="1.2" className="text-indigo-400" fill="none" />
              <path d="M 5 40 Q 22 32 45 40 Q 68 32 85 40" stroke="currentColor" strokeWidth="1.2" className="text-indigo-400" fill="none" />
              {/* Vertical Margin Line */}
              <line x1="18" y1="0" x2="18" y2="90" stroke="currentColor" strokeWidth="1" className="text-red-400/40" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#testimonial-book-pattern)" />
        </svg>
      </div>

      {/* Book Center Fold Curve Shadow Layer */}
      <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent dark:from-blue-900/10"></div>

      {/* Floating Book & Page Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <BookOpen className="absolute top-10 right-[8%] w-11 h-11 text-blue-600/15 dark:text-blue-400/20" />
        <Book className="absolute bottom-12 left-[6%] w-10 h-10 text-indigo-600/15 dark:text-indigo-400/20" />
        <FileText className="absolute top-1/3 left-[4%] w-9 h-9 text-sky-600/15 dark:text-sky-400/20" />
        <Bookmark className="absolute bottom-1/4 right-[5%] w-10 h-10 text-purple-600/15 dark:text-purple-400/20" />
        <GraduationCap className="absolute top-16 left-[28%] w-10 h-10 text-emerald-600/15 dark:text-emerald-400/20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-slate-900 mb-6"
          >
            {t('testimonials.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto"
          >
            {t('testimonials.desc')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((testimonial, index) => (
            <motion.div
              key={testimonial.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:-translate-y-2 transition-transform duration-300 relative group"
            >
              <div className="absolute top-8 right-8 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Quote className="w-12 h-12" />
              </div>
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-8 relative z-10 text-lg leading-relaxed italic">
                &quot;{lang === 'km' ? testimonial.text : (testimonial.text_en || testimonial.text)}&quot;
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image || 'https://via.placeholder.com/150'} 
                  alt={lang === 'km' ? testimonial.name : (testimonial.name_en || testimonial.name)} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-slate-100"
                />
                <div>
                  <h4 className="font-bold text-slate-900">{lang === 'km' ? testimonial.name : (testimonial.name_en || testimonial.name)}</h4>
                  <p className="text-sm text-slate-500">{lang === 'km' ? testimonial.role : (testimonial.role_en || testimonial.role)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}