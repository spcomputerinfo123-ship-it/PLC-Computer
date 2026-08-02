import { MapPin, Phone, Mail } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { coursesData } from "../data";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";

export default function Contact() {
  const { lang, t } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [courses, setCourses] = useState<any[]>([]);

  const [contactSettings, setContactSettings] = useState({
    address: 'ក្រុងប៉ោយប៉ែត, ខេត្តបន្ទាយមានជ័យ',
    addressEn: 'Poipet City, Banteay Meanchey Province',
    phone: '087 850 014 / 097 501 3648',
    email: 'plccomputerinfo123@gmail.com',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.732442220464!2d102.5644781!3d13.6568449!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311b2cfd27c73fa3%3A0x7d6cba6e8b46cdfb!2sPoipet%2C%20Cambodia!5e0!3m2!1sen!2skh!4v1716382100000!5m2!1sen!2skh'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'website_settings', 'current'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setContactSettings(prev => ({
            address: data.address || prev.address,
            addressEn: data.addressEn || prev.addressEn,
            phone: data.phone || prev.phone,
            email: data.email || prev.email,
            mapEmbedUrl: data.mapEmbedUrl || prev.mapEmbedUrl
          }));
        }
      } catch (error) {
        console.warn("Error fetching contact settings:", error);
      }
    };
    fetchSettings();
  }, []);

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
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await addDoc(collection(db, "contact_messages"), {
        name,
        phone,
        course,
        message,
        createdAt: serverTimestamp()
      });
      setSubmitStatus('success');
      setName("");
      setPhone("");
      setCourse("");
      setMessage("");
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-blue-50/50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">{t('contact.title')}</h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">{t('contact.desc')}</p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-white p-8 border border-slate-100 rounded-3xl flex gap-6 items-start shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">{t('contact.address')}</h4>
                <p className="text-slate-600 text-base leading-relaxed">
                  {lang === 'km' ? contactSettings.address : (contactSettings.addressEn || contactSettings.address)}
                </p>
              </div>
            </div>
            <div className="bg-white p-8 border border-slate-100 rounded-3xl flex gap-6 items-start shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <Phone className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">{t('contact.phone')}</h4>
                <p className="text-slate-600 text-base">{contactSettings.phone}</p>
              </div>
            </div>
            <div className="bg-white p-8 border border-slate-100 rounded-3xl flex gap-6 items-start shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">{t('contact.email')}</h4>
                <p className="text-slate-600 text-base">{contactSettings.email}</p>
              </div>
            </div>
            {contactSettings.mapEmbedUrl && (
              <div className="border-[6px] border-white rounded-3xl overflow-hidden h-64 bg-slate-200 shadow-md">
                <iframe 
                  src={contactSettings.mapEmbedUrl} 
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title="Google Map Location">
                </iframe>
              </div>
            )}
          </div>
          
          <div className="bg-white p-10 md:p-12 border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50">
            <h3 className="text-3xl font-extrabold text-slate-900 mb-8">{t('contact.form.title')}</h3>
            
            {submitStatus === 'success' && (
              <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-center font-bold">
                {lang === 'km' ? 'សាររបស់អ្នកត្រូវបានផ្ញើដោយជោគជ័យ! យើងខ្ញុំនឹងទាក់ទងទៅអ្នកវិញក្នុងពេលឆាប់ៗ។' : 'Your message has been sent successfully! We will contact you soon.'}
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-center font-bold">
                {lang === 'km' ? 'មានបញ្ហាក្នុងការផ្ញើសារ។ សូមព្យាយាមម្ដងទៀត។' : 'There was an error sending your message. Please try again.'}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('contact.form.name')}</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" placeholder={t('contact.form.name.ph')} disabled={isSubmitting} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('contact.form.tel')}</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required maxLength={20} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" placeholder={t('contact.form.tel.ph')} disabled={isSubmitting} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('contact.form.course')}</label>
                <select value={course} onChange={e => setCourse(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer" disabled={isSubmitting}>
                  <option value="" disabled>{lang === 'km' ? 'ជ្រើសរើសវគ្គសិក្សា' : 'Select a course'}</option>
                  {courses.map(c => (
                    <option key={c.id} value={lang === 'km' ? c.title : c.title_en}>{lang === 'km' ? c.title : c.title_en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('contact.form.msg')}</label>
                <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} required maxLength={1000} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" placeholder={t('contact.form.msg.ph')} disabled={isSubmitting}></textarea>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? (lang === 'km' ? 'កំពុងផ្ញើ...' : 'Sending...') : t('contact.form.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
