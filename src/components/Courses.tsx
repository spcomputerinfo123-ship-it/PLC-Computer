import { coursesData } from "../data";
import * as Icons from "lucide-react";
import { Clock, ChevronRight, X, Search, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import ImageWithFallback from './ImageWithFallback';
import { useLanguage } from "../context/LanguageContext";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import RegistrationModal from "./RegistrationModal";

export default function Courses() {
  const { lang, t } = useLanguage();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regCourseTitle, setRegCourseTitle] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courses"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        const fetchedCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedCourses.length > 0) {
          setCourses(fetchedCourses);
        } else {
          setCourses(coursesData);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses(coursesData);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <section id="courses" className="py-24 bg-white relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">{t('courses.title')}</h2>
          <div className="h-1.5 w-24 bg-primary/20 mx-auto rounded-full mb-8 relative">
            <div className="absolute top-0 left-1/4 h-full w-1/2 bg-primary rounded-full"></div>
          </div>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8">
            {t('courses.desc')}
          </p>
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg shadow-sm"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-[2rem] overflow-hidden flex flex-col animate-pulse">
                <div className="w-full h-64 bg-slate-200"></div>
                <div className="p-8 md:p-10 flex-grow flex flex-col">
                  <div className="h-8 bg-slate-200 rounded-md w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-2/3 mb-6"></div>
                  <div className="flex gap-3 mb-8">
                    <div className="w-24 h-8 bg-slate-200 rounded-full"></div>
                    <div className="w-24 h-8 bg-slate-200 rounded-full"></div>
                  </div>
                  <div className="mt-auto h-12 bg-slate-200 rounded-xl w-full"></div>
                </div>
              </div>
            ))
          ) : (
          courses.filter(c => {
            if (c.status === 'hidden') return false;
            const searchLower = searchQuery.toLowerCase();
            return (c.title && c.title.toLowerCase().includes(searchLower)) || 
                   (c.title_en && c.title_en.toLowerCase().includes(searchLower)) || 
                   (c.description && c.description.toLowerCase().includes(searchLower)) ||
                   (c.description_en && c.description_en.toLowerCase().includes(searchLower));
          }).map((course, index) => {
            const Icon = (Icons as any)[course.icon] || Icons.BookOpen;
            return (
              <motion.div 
                key={course.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-50 border border-slate-100 rounded-[2rem] transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 group overflow-hidden flex flex-col"
              >
                {course.imageUrl && (
                  <div className="w-full h-64 overflow-hidden relative">
                    <ImageWithFallback src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" iconName={course.icon} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 w-12 h-12 bg-white text-primary rounded-xl flex items-center justify-center shadow-lg border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      {Icon && <Icon className="w-6 h-6" />}
                    </div>
                  </div>
                )}
                <div className="p-8 md:p-10 flex-grow flex flex-col">
                  {!course.imageUrl && (
                    <div className="w-16 h-16 bg-white text-primary rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-6">
                      {Icon && <Icon className="w-8 h-8" />}
                    </div>
                  )}
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{lang === 'km' ? course.title : course.title_en}</h3>
                    <p className="text-base text-slate-600 mb-6 leading-relaxed line-clamp-3">
                      {lang === 'km' ? course.description : course.description_en}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white inline-flex px-4 py-2 rounded-full border border-slate-200">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{t('courses.duration')}: {lang === 'km' ? course.duration : course.duration_en}</span>
                      </div>
                      {course.price && (
                        <div className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 inline-flex px-4 py-2 rounded-full border border-green-100">
                          <span>{lang === 'km' ? 'តម្លៃ' : 'Price'}: {lang === 'km' ? course.price : course.price_en}</span>
                        </div>
                      )}
                      {(course.schedule || course.schedule_en) && (
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 inline-flex px-3.5 py-1.5 rounded-full border border-blue-100">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>{lang === 'km' ? course.schedule || course.schedule_en : course.schedule_en || course.schedule}</span>
                        </div>
                      )}
                    </div>
                    <button onClick={() => setSelectedCourse(course)} className="mt-auto text-primary font-bold uppercase text-sm hover:text-blue-800 transition flex items-center gap-2 group/btn">
                      {t('courses.details')} 
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedCourse && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[150]"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition z-10"
              >
                <X className="w-5 h-5" />
              </button>
              {selectedCourse.imageUrl && (
                <div className="w-full h-64 relative">
                  <ImageWithFallback src={selectedCourse.imageUrl} alt={selectedCourse.title} className="w-full h-full object-cover" iconName={selectedCourse.icon} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                </div>
              )}
              <div className="p-8">
                {!selectedCourse.imageUrl && (
                  <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-6">
                    <Icons.BookOpen className="w-8 h-8" />
                  </div>
                )}
                <h3 className="text-3xl font-bold text-slate-900 mb-4">{lang === 'km' ? selectedCourse.title : selectedCourse.title_en}</h3>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>{lang === 'km' ? selectedCourse.duration : selectedCourse.duration_en}</span>
                  </div>
                  {selectedCourse.price && (
                    <div className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                      <span>{lang === 'km' ? 'តម្លៃ:' : 'Price:'} {lang === 'km' ? selectedCourse.price : selectedCourse.price_en}</span>
                    </div>
                  )}
                  {(selectedCourse.schedule || selectedCourse.schedule_en) && (
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span>{lang === 'km' ? selectedCourse.schedule || selectedCourse.schedule_en : selectedCourse.schedule_en || selectedCourse.schedule}</span>
                    </div>
                  )}
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {lang === 'km' ? selectedCourse.description : selectedCourse.description_en}
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button onClick={() => { setRegCourseTitle(lang === "km" ? selectedCourse.title : selectedCourse.title_en); setIsRegModalOpen(true); setSelectedCourse(null); }} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                    {lang === 'km' ? 'ចុះឈ្មោះឥឡូវនេះ' : 'Register Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <RegistrationModal isOpen={isRegModalOpen} onClose={() => setIsRegModalOpen(false)} courseTitle={regCourseTitle} />
    </section>
  );
}