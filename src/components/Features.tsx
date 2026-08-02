import { featuresData } from "../data";
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import * as Icons from "lucide-react";
import { motion } from "motion/react";

export default function Features() {
  const { lang, t } = useLanguage();
  const [features, setFeatures] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const q = query(collection(db, "features"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        const fetchedFeatures = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedFeatures.length > 0) {
          setFeatures(fetchedFeatures);
        } else {
          setFeatures(featuresData);
        }
      } catch (error) {
        console.error("Error fetching features:", error);
        setFeatures(featuresData);
      }
    };
    fetchFeatures();
  }, []);

  const IconDisplay = ({ iconName }: { iconName: string }) => {
    const IconCmp = (Icons as any)[iconName] || Icons.Star;
    return <IconCmp className="w-6 h-6" />;
  };

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">{t('features.title')}</h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            {t('features.desc')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => {
            return (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} key={feature.id} className="bg-white p-8 rounded-3xl border border-slate-100 flex flex-col gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-sky-100 hover:-translate-y-2 group">
                <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-xl font-black mb-4 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                  <IconDisplay iconName={feature.icon || "Star"} />
                </div>
                <h4 className="text-xl font-bold text-slate-900">{lang === 'km' ? feature.title : feature.title_en}</h4>
                <p className="text-base text-slate-600 leading-relaxed">{lang === 'km' ? feature.description : feature.description_en}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
