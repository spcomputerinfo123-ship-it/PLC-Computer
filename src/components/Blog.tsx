import { motion } from "motion/react";
import { Calendar, ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const posts = [
  {
    id: "default-1",
    title: "អត្ថប្រយោជន៍នៃការរៀនសរសេរកូដ",
    title_en: "Benefits of Learning Coding",
    date: "១៥ វិច្ឆិកា ២០២៣",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80",
    excerpt: "ហេតុអ្វីបានជាអ្នកគួរចាប់ផ្តើមរៀនសរសេរកូដទោះជាអ្នកមិនមែនជាអ្នកជំនាញ IT ក៏ដោយ។",
    excerpt_en: "Why you should start learning code even if you are not an IT professional.",
    category: "ចំណេះដឹងទូទៅ",
    category_en: "General Knowledge"
  },
  {
    id: "default-2",
    title: "ជំនាញ IT ទាំង ៥ ដែលមានតម្រូវការខ្ពស់ក្នុងទីផ្សារការងារ",
    title_en: "Top 5 High-Demand IT Skills in Job Market",
    date: "២០ ធ្នូ ២០២៣",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=500&q=80",
    excerpt: "តើជំនាញបច្ចេកវិទ្យាអ្វីខ្លះដែលក្រុមហ៊ុនធំៗ និងធនាគារកំពុងស្វែងរកនៅឆ្នាំនេះ?",
    excerpt_en: "What technology skills are major companies and banks looking for this year?",
    category: "អាជីពការងារ",
    category_en: "Career & Tech"
  },
  {
    id: "default-3",
    title: "របៀបការពារទិន្នន័យពីមេរោគ Ransomware & Phishing",
    title_en: "How to Protect Data from Ransomware & Phishing",
    date: "១០ មករា ២០២៤",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=500&q=80",
    excerpt: "ស្វែងយល់ពីវិធីសាស្ត្រការពារកុំព្យូទ័រ និងគណនីរបស់អ្នកពីការវាយប្រហាររបស់ Hacker។",
    excerpt_en: "Learn methods to secure your computer and accounts from cyber attacks.",
    category: "សន្តិសុខប្រព័ន្ធ",
    category_en: "Cyber Security"
  },
  {
    id: "default-4",
    title: "គន្លឹះរៀបចំ Portfolio ឲ្យទាក់ទាញចិត្តក្រុមហ៊ុន IT",
    title_en: "Tips to Build an Eye-Catching Tech Portfolio",
    date: "២៥ កុម្ភៈ ២០២៤",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&q=80",
    excerpt: "របៀបបង្ហាញស្នាដៃ Project របស់អ្នកដើម្បីទទួលបានឱកាសសម្ភាសន៍ការងារយ៉ាងឆាប់រហ័ស។",
    excerpt_en: "How to showcase your project work to land job interviews quickly.",
    category: "ការរៀបចំខ្លួន",
    category_en: "Portfolio Tips"
  }
];

export default function Blog() {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data.length >= 3) {
          setItems(data);
        } else if (data.length > 0) {
          const combined: any[] = [...data];
          posts.forEach(def => {
            if (combined.length < 3 && !combined.some(item => item.title === def.title)) {
              combined.push(def);
            }
          });
          setItems(combined);
        } else {
          setItems(posts.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setItems(posts.slice(0, 3));
      }
    };
    fetchBlogs();
  }, []);

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="blog">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-slate-900 mb-6"
          >
            {lang === 'km' ? 'អត្ថបទចែករំលែកចំណេះដឹង' : 'IT Knowledge Blog'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto"
          >
            {lang === 'km' ? 'អានអត្ថបទថ្មីៗទាក់ទងនឹងបច្ចេកវិទ្យា និងគន្លឹះសំខាន់ៗដែលអ្នកគួរដឹង។' : 'Read latest articles about technology and important tips you should know.'}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((post, index) => (
            <motion.div
              key={post.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                <img 
                  src={post.image || post.imageUrl || 'https://via.placeholder.com/500'} 
                  alt={lang === 'km' ? post.title : (post.title_en || post.title)} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {post.category && (
                  <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary">
                    {lang === 'km' ? post.category : (post.category_en || post.category)}
                  </div>
                )}
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 font-medium">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{post.date || (post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : '...')}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {lang === 'km' ? post.title : (post.title_en || post.title)}
                </h3>
                <p className="text-slate-600 mb-6 line-clamp-3">
                  {lang === 'km' ? (post.excerpt || post.description) : (post.excerpt_en || post.description_en || post.excerpt || post.description)}
                </p>
                <a href="#blog" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-2 font-bold text-primary hover:text-blue-800 transition-colors">
                  {lang === 'km' ? 'អានបន្ត' : 'Read More'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}