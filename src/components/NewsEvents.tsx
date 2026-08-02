import { Calendar, ChevronRight, X } from "lucide-react";
import ImageWithFallback from './ImageWithFallback';
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { newsData } from "../data";
import { motion, AnimatePresence } from "motion/react";

export default function NewsEvents() {
  const { lang, t } = useLanguage();
  const [news, setNews] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const q = showAll 
          ? query(collection(db, "news_events"), orderBy("createdAt", "desc"))
          : query(collection(db, "news_events"), orderBy("createdAt", "desc"), limit(3));
        const querySnapshot = await getDocs(q);
        const fetchedNews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedNews.length > 0) {
          setNews(fetchedNews);
        } else {
          setNews(showAll ? newsData : newsData.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNews(showAll ? newsData : newsData.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [showAll]);

  if (loading && news.length === 0) {
    return (
      <section id="news" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500">{lang === 'km' ? 'កំពុងទាញយកទិន្នន័យ...' : 'Loading...'}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="news" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6"
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">
              {lang === 'km' ? 'ព័ត៌មាន និងព្រឹត្តិការណ៍' : 'News & Events'}
            </h2>
            <p className="text-lg text-slate-600">
              {lang === 'km' 
                ? 'តាមដានព័ត៌មានថ្មីៗ និងព្រឹត្តិការណ៍ផ្សេងៗពីសាលាភីអិលស៊ី' 
                : 'Stay updated with the latest news and events from PLC Computer'}
            </p>
          </div>
          {!showAll && (
            <button 
              onClick={() => setShowAll(true)}
              className="inline-flex items-center text-primary font-bold hover:text-blue-800 transition-colors group"
            >
              {lang === 'km' ? 'មើលទាំងអស់' : 'View All'}
              <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {item.imageUrl ? (
                  <ImageWithFallback src={item.imageUrl} alt={lang === "km" ? item.title : item.title_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" type="news" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                    <Calendar className="w-12 h-12 opacity-50" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-slate-800 shadow-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {item.date}
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-snug">
                  {lang === 'km' ? item.title : item.title_en}
                </h3>
                <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                  {lang === 'km' ? item.description : item.description_en}
                </p>
                <button onClick={() => setSelectedNews(item)} className="text-primary font-bold flex items-center hover:text-blue-800 transition-colors">
                  {lang === 'km' ? 'អានបន្ថែម' : 'Read More'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <AnimatePresence>
        {selectedNews && (
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
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-full h-64 md:h-80 relative">
                <ImageWithFallback src={selectedNews.imageUrl} alt={selectedNews.title} className="w-full h-full object-cover" type="news" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                   <div className="flex items-center text-sm font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg mb-3 inline-flex">
                      <Calendar className="w-4 h-4 mr-2" />
                      {selectedNews.date}
                   </div>
                   <h3 className="text-2xl md:text-3xl font-bold">{lang === 'km' ? selectedNews.title : selectedNews.title_en}</h3>
                </div>
              </div>
              
              <div className="p-8">
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {lang === 'km' ? selectedNews.description : selectedNews.description_en}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
