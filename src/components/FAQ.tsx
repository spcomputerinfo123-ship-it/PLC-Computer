import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";

import { faqData } from "../data";
import { motion } from "motion/react";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const { lang, t } = useLanguage();
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const q = query(collection(db, "faqs"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        const fetchedFaqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedFaqs.length > 0) {
          setFaqs(fetchedFaqs);
        } else {
          setFaqs(faqData);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        setFaqs(faqData);
      }
    };
    fetchFaqs();
  }, [t]);

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">{t('faq.title')}</h2>
        </motion.div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} key={faq.id || i} className={`border ${open === i ? 'border-primary/20 shadow-md shadow-primary/5' : 'border-slate-100'} rounded-3xl bg-slate-50 overflow-hidden transition-all duration-300`}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between items-center text-left font-bold text-slate-900 p-6 bg-white hover:bg-slate-50/50 transition-colors">
                <span className="text-lg">{lang === 'km' ? faq.question : (faq.question_en || faq.question)}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${open === i ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-2 border-t border-slate-100 text-slate-600 text-base leading-relaxed bg-white">
                  {lang === 'km' ? faq.answer : (faq.answer_en || faq.answer)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
