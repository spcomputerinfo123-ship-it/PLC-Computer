import { useState, useEffect } from "react";
import { Building2, Briefcase, MapPin, CheckCircle2, ChevronRight, X, Clock, DollarSign, Mail } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Careers() {
  const { t, lang } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden" id="careers">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-slate-900 mb-6"
          >
            {t('careers.title')}
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
            className="text-xl text-slate-600 max-w-2xl mx-auto"
          >
            {t('careers.desc')}
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
             <div className="flex justify-center py-12">
               <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>{lang === 'km' ? 'មិនទាន់មានឱកាសការងារនៅឡើយទេ' : 'No job opportunities available at the moment'}</p>
            </div>
          ) : (
            jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedJob(job)}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col md:flex-row items-center gap-6 group cursor-pointer"
              >
                {/* Logo Box */}
                <div className="w-24 h-24 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative group-hover:scale-105 transition duration-300 shadow-sm p-2">
                  {job.companyLogo ? (
                    <img 
                      src={job.companyLogo} 
                      alt={job.company}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-slate-300" />
                  )}
                </div>

                <div className="flex-grow text-center md:text-left">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{job.title}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-600 text-sm">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Building2 className="w-4 h-4 text-primary" /> {job.company}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-slate-400" /> {job.type}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center md:items-end gap-3 mt-4 md:mt-0">
                  <span className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    job.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {job.status === 'active' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === 'km' ? 'កំពុងជ្រើសរើស' : 'Active'}</span>
                      </>
                    ) : (
                      <span>{lang === 'km' ? 'បានបិទការជ្រើសរើស' : 'Closed'}</span>
                    )}
                  </span>
                  <div className="flex items-center text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                    {lang === 'km' ? 'មើលបន្ថែម' : 'View Details'} <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-20 pb-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col relative z-10"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden p-2 shadow-sm">
                    {selectedJob.companyLogo ? (
                      <img src={selectedJob.companyLogo} alt={selectedJob.company} className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 leading-tight">{selectedJob.title}</h3>
                    <p className="text-primary font-semibold mt-1">{selectedJob.company}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-6 space-y-8 flex-1 custom-scrollbar">
                
                {/* Meta Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <Briefcase className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                    <p className="text-xs text-slate-500 mb-1">{lang === 'km' ? 'ប្រភេទការងារ' : 'Job Type'}</p>
                    <p className="text-sm font-bold text-slate-900">{selectedJob.type}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <MapPin className="w-6 h-6 mx-auto text-red-500 mb-2" />
                    <p className="text-xs text-slate-500 mb-1">{lang === 'km' ? 'ទីតាំង' : 'Location'}</p>
                    <p className="text-sm font-bold text-slate-900">{selectedJob.location}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <DollarSign className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                    <p className="text-xs text-slate-500 mb-1">{lang === 'km' ? 'ប្រាក់បៀវត្ស' : 'Salary'}</p>
                    <p className="text-sm font-bold text-slate-900">{selectedJob.salary || (lang === 'km' ? 'មិនបានបញ្ជាក់' : 'N/A')}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <Clock className="w-6 h-6 mx-auto text-orange-500 mb-2" />
                    <p className="text-xs text-slate-500 mb-1">{lang === 'km' ? 'ថ្ងៃផុតកំណត់' : 'Deadline'}</p>
                    <p className="text-sm font-bold text-slate-900">{selectedJob.deadline || (lang === 'km' ? 'មិនបានបញ្ជាក់' : 'N/A')}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {selectedJob.description && (
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                        {lang === 'km' ? 'ការពិពណ៌នាការងារ (Job Description)' : 'Job Description'}
                      </h4>
                      <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{selectedJob.description}</p>
                    </div>
                  )}

                  {selectedJob.requirements && (
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
                        {lang === 'km' ? 'លក្ខខណ្ឌតម្រូវការ (Requirements)' : 'Requirements'}
                      </h4>
                      <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{selectedJob.requirements}</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 bg-white">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-slate-900 mb-1 text-center sm:text-left">
                      {lang === 'km' ? 'ចាប់អារម្មណ៍ការងារនេះ?' : 'Interested in this job?'}
                    </h5>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> 
                      {selectedJob.contactInfo || (lang === 'km' ? 'សូមទាក់ទងមកយើង' : 'Please contact us')}
                    </p>
                  </div>
                  {selectedJob.status === 'active' ? (
                    <a 
                      href={`mailto:${selectedJob.contactInfo?.includes('@') ? selectedJob.contactInfo.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)?.[0] : ''}`}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/30 transition-all text-center w-full sm:w-auto"
                    >
                      {lang === 'km' ? 'ដាក់ពាក្យឥឡូវនេះ' : 'Apply Now'}
                    </a>
                  ) : (
                    <span className="px-6 py-2.5 bg-slate-200 text-slate-500 font-bold rounded-xl cursor-not-allowed">
                      {lang === 'km' ? 'បានបិទការជ្រើសរើស' : 'Closed'}
                    </span>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
