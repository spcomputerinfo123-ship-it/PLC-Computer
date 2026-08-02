import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useLanguage } from "../context/LanguageContext";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
}

export default function RegistrationModal({ isOpen, onClose, courseTitle }: RegistrationModalProps) {
  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    course: courseTitle || "",
    schedule: "",
    note: ""
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "registrations"), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting registration:", error);
      alert(lang === 'km' ? 'មានបញ្ហាក្នុងការបញ្ជូនទិន្នន័យ។ សូមព្យាយាមម្ដងទៀត។' : 'Error submitting data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setFormData({
      name: "",
      phone: "",
      email: "",
      course: courseTitle || "",
      schedule: "",
      note: ""
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[200]"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden"
        >
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-8">
            {success ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {lang === 'km' ? 'ចុះឈ្មោះជោគជ័យ!' : 'Registration Successful!'}
                </h3>
                <p className="text-slate-600 mb-8">
                  {lang === 'km' ? 'សូមអរគុណសម្រាប់ការចុះឈ្មោះ។ ក្រុមការងារយើងនឹងទាក់ទងទៅអ្នកក្នុងពេលឆាប់ៗនេះ។' : 'Thank you for registering. Our team will contact you shortly.'}
                </p>
                <button 
                  onClick={handleClose}
                  className="w-full px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition"
                >
                  {lang === 'km' ? 'បិទ' : 'Close'}
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  {lang === 'km' ? 'ទម្រង់ចុះឈ្មោះចូលរៀន' : 'Course Registration Form'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      {lang === 'km' ? 'ឈ្មោះពេញ' : 'Full Name'} *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      {lang === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'} *
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      {lang === 'km' ? 'អ៊ីមែល (ជម្រើស)' : 'Email (Optional)'}
                    </label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      {lang === 'km' ? 'វគ្គសិក្សាដែលចង់រៀន' : 'Course of Interest'} *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formData.course}
                      onChange={(e) => setFormData({...formData, course: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      {lang === 'km' ? 'វេនសិក្សា / កាលវិភាគដែលប្រាថ្នា (ជម្រើស)' : 'Preferred Schedule / Batch (Optional)'}
                    </label>
                    <select
                      value={formData.schedule}
                      onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none bg-white text-slate-700"
                    >
                      <option value="">{lang === 'km' ? '-- ជ្រើសរើសវេនសិក្សា --' : '-- Select Preferred Batch --'}</option>
                      <option value="ច័ន្ទ-សុក្រ ព្រឹក (8:00 - 11:00 AM)">
                        {lang === 'km' ? 'ច័ន្ទ-សុក្រ ព្រឹក (8:00 - 11:00 AM)' : 'Mon-Fri Morning (8:00 - 11:00 AM)'}
                      </option>
                      <option value="ច័ន្ទ-សុក្រ រសៀល (2:00 - 5:00 PM)">
                        {lang === 'km' ? 'ច័ន្ទ-សុក្រ រសៀល (2:00 - 5:00 PM)' : 'Mon-Fri Afternoon (2:00 - 5:00 PM)'}
                      </option>
                      <option value="សៅរ៍-អាទិត្យ ព្រឹក/រសៀល">
                        {lang === 'km' ? 'សៅរ៍-អាទិត្យ (Weekend Batch)' : 'Sat-Sun (Weekend Batch)'}
                      </option>
                      <option value="ថ្នាក់យប់ (5:30 - 7:30 PM)">
                        {lang === 'km' ? 'ថ្នាក់យប់ (5:30 - 7:30 PM)' : 'Evening Batch (5:30 - 7:30 PM)'}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      {lang === 'km' ? 'ចំណាំផ្សេងៗ (ជម្រើស)' : 'Notes (Optional)'}
                    </label>
                    <textarea 
                      rows={3}
                      value={formData.note}
                      onChange={(e) => setFormData({...formData, note: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none resize-none"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full px-6 py-4 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{lang === 'km' ? 'កំពុងបញ្ជូន...' : 'Submitting...'}</span>
                      </>
                    ) : (
                      <span>{lang === 'km' ? 'បញ្ជូនការចុះឈ្មោះ' : 'Submit Registration'}</span>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
