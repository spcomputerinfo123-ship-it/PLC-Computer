import ImageWithFallback from './ImageWithFallback';
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { galleryData } from "../data";
import { motion } from "motion/react";

export default function Gallery() {
  const { t, lang } = useLanguage();
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedImages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedImages.length > 0) {
          setImages(fetchedImages);
        } else {
          setImages(galleryData.map((url, index) => ({ id: index, url })));
        }
      } catch (error) {
        console.error("Error fetching gallery images:", error);
        setImages(galleryData.map((url, index) => ({ id: index, url })));
      }
    };
    fetchImages();
  }, []);

  return (
    <section id="gallery" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">{t('gallery.title')}</h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">{t('gallery.desc')}</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((imgObj, i) => (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} key={imgObj.id || i} className={`overflow-hidden rounded-3xl border-4 border-white shadow-md hover:shadow-xl hover:shadow-slate-300/50 hover:-translate-y-2 transition-all duration-300 relative group ${i % 2 === 0 ? 'aspect-square' : 'aspect-[3/4]'}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 z-10"></div>
              <ImageWithFallback src={imgObj.url} alt={imgObj.title || imgObj.title_en || `${t('gallery.alt')} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-0" type="gallery" />
              {(imgObj.title || imgObj.title_en) && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-bold text-lg leading-tight">
                    {lang === 'km' ? (imgObj.title || imgObj.title_en) : (imgObj.title_en || imgObj.title)}
                  </h3>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
