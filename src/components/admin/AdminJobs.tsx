import { useState, useEffect, FormEvent, ChangeEvent, useMemo } from "react";
import { collection, query, orderBy, getDocs, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { Trash2, Briefcase, Plus, Edit2, X, Search, UploadCloud, MapPin, Building2, Clock, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminJobs() {
  const { showToast } = useToast();
  const { lang } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("active");
  const [companyLogo, setCompanyLogo] = useState("");
  const [salary, setSalary] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(items);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const fallbackBase64 = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setCompanyLogo(reader.result as string);
          showToast(lang === 'km' ? 'បាន Upload រូបភាពជោគជ័យ!' : 'Image uploaded successfully!', 'success');
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `jobs/logo_${Date.now()}.${fileExt}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.warn("Storage upload error, using fallback:", error);
          fallbackBase64();
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setCompanyLogo(downloadURL);
            showToast(lang === 'km' ? 'បាន Upload រូបភាពជោគជ័យ!' : 'Image uploaded successfully!', 'success');
          } catch {
            fallbackBase64();
          } finally {
            setIsUploading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (err) {
      fallbackBase64();
    }
  };


  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const sampleJobs = [
        {
          title: "Senior Full-Stack Developer",
          company: "Tech Innovators Cambodia",
          companyLogo: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100&h=100&fit=crop",
          type: "ពេញម៉ោង (Full-Time)",
          location: "រាជធានីភ្នំពេញ",
          status: "active",
          salary: "$1,500 - $2,500",
          deadline: "2026-12-31",
          description: "We are looking for an experienced Full-Stack Developer...",
          requirements: "- 3+ years experience with React and Node.js\n- Strong understanding of database design\n- Good English communication skills",
          contactInfo: "careers@techinnovators.com.kh"
        },
        {
          title: "UI/UX Designer",
          company: "Creative Studio",
          companyLogo: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=100&h=100&fit=crop",
          type: "ពេញម៉ោង (Full-Time)",
          location: "សៀមរាប",
          status: "active",
          salary: "$800 - $1,200",
          deadline: "2026-10-15",
          description: "Join our creative team to design beautiful and intuitive user interfaces.",
          requirements: "- 2+ years of UI/UX experience\n- Proficiency in Figma\n- Portfolio demonstrating web and mobile design",
          contactInfo: "hr@creativestudio.kh"
        },
        {
          title: "IT Support Specialist",
          company: "Global Services Co.",
          companyLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
          type: "ក្រៅម៉ោង (Part-Time)",
          location: "រាជធានីភ្នំពេញ",
          status: "active",
          salary: "$300 - $500",
          deadline: "2026-09-30",
          description: "Looking for an IT support specialist to handle hardware and network issues.",
          requirements: "- Basic understanding of networking\n- Experience with Windows/macOS troubleshooting\n- Good problem-solving skills",
          contactInfo: "jobs@globalservices.com.kh"
        }
      ];

      for (const job of sampleJobs) {
        await addDoc(collection(db, "jobs"), {
          ...job,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      showToast(lang === 'km' ? 'បានបង្កើតទិន្នន័យការងារគំរូ ៣ ជោគជ័យ!' : 'Created 3 demo jobs successfully!', 'success');
      fetchJobs();
    } catch (error) {
      console.error("Error seeding jobs:", error);
      showToast(lang === 'km' ? 'មានបញ្ហាក្នុងការបង្កើតទិន្នន័យគំរូ' : 'Error seeding demo data', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !company || !companyLogo || !type || !location) {
      showToast(lang === 'km' ? 'សូមបំពេញព័ត៌មានអោយបានគ្រប់គ្រាន់!' : 'Please fill all required fields!', 'error');
      return;
    }

    try {
      const jobData = {
        title,
        company,
        companyLogo,
        type,
        location,
        status,
        salary,
        deadline,
        description,
        requirements,
        contactInfo,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, "jobs", editingId), jobData);
        showToast(lang === 'km' ? 'កែប្រែជោគជ័យ!' : 'Updated successfully!', 'success');
      } else {
        await addDoc(collection(db, "jobs"), {
          ...jobData,
          createdAt: serverTimestamp()
        });
        showToast(lang === 'km' ? 'បង្កើតជោគជ័យ!' : 'Created successfully!', 'success');
      }

      resetForm();
      fetchJobs();
    } catch (error) {
      console.error("Error saving job:", error);
      showToast(lang === 'km' ? 'មានបញ្ហាក្នុងការរក្សាទុក!' : 'Error saving data!', 'error');
    }
  };

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setCompanyLogo("");
    setType("ពេញម៉ោង (Full-Time)");
    setLocation("រាជធានីភ្នំពេញ");
    setStatus("active");
    setSalary("");
    setDeadline("");
    setDescription("");
    setRequirements("");
    setContactInfo("");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (job: any) => {
    setTitle(job.title || "");
    setCompany(job.company || "");
    setCompanyLogo(job.companyLogo || "");
    setType(job.type || "");
    setLocation(job.location || "");
    setStatus(job.status || 'active');
    setSalary(job.salary || "");
    setDeadline(job.deadline || "");
    setDescription(job.description || "");
    setRequirements(job.requirements || "");
    setContactInfo(job.contactInfo || "");
    setEditingId(job.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "jobs", id));
      showToast(lang === 'km' ? 'លុបជោគជ័យ!' : 'Deleted successfully!', 'success');
      fetchJobs();
    } catch (error) {
      console.error("Error deleting:", error);
      showToast(lang === 'km' ? 'មានបញ្ហាក្នុងការលុប!' : 'Error deleting!', 'error');
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [jobs, searchQuery]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          {lang === 'km' ? 'ឱកាសការងារ (Jobs)' : 'Job Opportunities'}
        </h3>
        {!isAdding && (
          <div className="flex w-full sm:w-auto items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder={lang === 'km' ? "ស្វែងរកការងារ..." : "Search jobs..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="button"
              onClick={handleSeedDemoData}
              disabled={seeding}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-sm transition border border-amber-200 flex items-center gap-2 shrink-0"
            >
              {seeding ? (
                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Sparkles className="w-4 h-4 text-amber-600" />
              )}
              <span className="hidden sm:inline">{lang === 'km' ? 'ទិន្នន័យគំរូ' : 'Seed Demo'}</span>
            </button>
            <button
              onClick={() => { resetForm(); setIsAdding(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'km' ? 'បន្ថែមការងារ' : 'Add Job'}</span>
            </button>
          </div>
        )}
      </div>

      {isAdding ? (
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-gray-800">
                {editingId 
                  ? (lang === 'km' ? 'កែប្រែព័ត៌មានការងារ' : 'Edit Job')
                  : (lang === 'km' ? 'បន្ថែមការងារថ្មី' : 'Add New Job')}
              </h4>
              <button 
                type="button" 
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'km' ? 'ចំណងជើងការងារ (Job Title)' : 'Job Title'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. IT Support / Network Engineer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'km' ? 'ឈ្មោះក្រុមហ៊ុន (Company Name)' : 'Company Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Smart Axiata"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === 'km' ? 'ប្រភេទការងារ (Job Type)' : 'Job Type'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. ពេញម៉ោង (Full-Time)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === 'km' ? 'ទីតាំង (Location)' : 'Location'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. រាជធានីភ្នំពេញ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === 'km' ? 'ប្រាក់បៀវត្ស (Salary)' : 'Salary'}
                    </label>
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. $300 - $500 / Negotiable"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === 'km' ? 'ថ្ងៃផុតកំណត់ (Deadline)' : 'Deadline'}
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'km' ? 'ទំនាក់ទំនង (Contact / How to apply)' : 'Contact Info'}
                  </label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. hr@company.com or 012 345 678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'km' ? 'ស្ថានភាព (Status)' : 'Status'} *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">{lang === 'km' ? 'កំពុងជ្រើសរើស (Active)' : 'Active'}</option>
                    <option value="closed">{lang === 'km' ? 'បញ្ចប់ការជ្រើសរើស (Closed)' : 'Closed'}</option>
                  </select>
                </div>
              </div>

              {/* Right Column: Details & Logo */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'km' ? 'ការពិពណ៌នាការងារ (Job Description)' : 'Job Description'}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={lang === 'km' ? 'ពិពណ៌នាពីតួនាទី និងភារកិច្ច...' : 'Describe role and responsibilities...'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'km' ? 'លក្ខខណ្ឌតម្រូវការ (Requirements)' : 'Requirements'}
                  </label>
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={lang === 'km' ? 'បទពិសោធន៍ ជំនាញដែលត្រូវការ...' : 'Experience, required skills...'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'km' ? 'ឡូហ្គោក្រុមហ៊ុន (Company Logo)' : 'Company Logo'} *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                    {companyLogo ? (
                      <div className="relative inline-block">
                        <img src={companyLogo} alt="Preview" className="w-32 h-32 object-contain bg-white rounded-xl shadow-sm border border-gray-100" />
                        <button
                          type="button"
                          onClick={() => setCompanyLogo("")}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center py-4">
                        <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600 mb-1">
                          {lang === 'km' ? 'ចុចដើម្បី Upload រូបភាព' : 'Click to upload image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    )}
                    {isUploading && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Uploading... {Math.round(uploadProgress)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                {lang === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm shadow-blue-200"
              >
                {editingId 
                  ? (lang === 'km' ? 'រក្សាទុកការកែប្រែ' : 'Save Changes')
                  : (lang === 'km' ? 'បង្កើតការងារ' : 'Create Job')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>{lang === 'km' ? 'មិនមានទិន្នន័យទេ' : 'No jobs found'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  
                  {/* Logo */}
                  <div className="w-20 h-20 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-2 shrink-0 shadow-sm overflow-hidden">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-1 w-full text-center sm:text-left">
                    <h4 className="text-lg font-bold text-gray-900 leading-tight">
                      {job.title}
                    </h4>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        <Building2 className="w-4 h-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                      job.status === 'active' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {job.status === 'active' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          {lang === 'km' ? 'កំពុងជ្រើសរើស' : 'Active'}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          {lang === 'km' ? 'បញ្ចប់ការជ្រើសរើស' : 'Closed'}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(job)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={lang === 'km' ? 'កែប្រែ' : 'Edit'}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setItemToDelete(job.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={lang === 'km' ? 'លុប' : 'Delete'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {itemToDelete && (
        <DeleteConfirmModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={() => {
            handleDelete(itemToDelete);
            setItemToDelete(null);
          }}
          title={lang === 'km' ? 'លុបការងារនេះ?' : 'Delete this job?'}
          message={lang === 'km' ? 'តើអ្នកពិតជាចង់លុបការងារនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។' : 'Are you sure you want to delete this job? This action cannot be undone.'}
        />
      )}
    </div>
  );
}
