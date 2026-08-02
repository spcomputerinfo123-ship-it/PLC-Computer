import React, { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  Check, X, Trash2, Phone, Mail, Download, Search, 
  Filter, Calendar, Clock, UserCheck, UserX, Clock3, Users, BookOpen, Plus, Sparkles, UserPlus
} from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useToast } from "../../context/ToastContext";

export default function AdminRegistrations() {
  const { showToast } = useToast();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Add Manual Registration Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    course: 'Web Development (HTML, CSS, JS, React)',
    schedule: 'ច័ន្ទ - សុក្រ (08:00 AM - 10:00 AM)',
    note: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected'
  });

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching registrations:", error);
      showToast("មានបញ្ហាក្នុងការទាញយកទិន្នន័យ", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, "registrations", id), { status });
      if (status === 'approved') {
        showToast("បានទទួលយកការចុះឈ្មោះដោយជោគជ័យ", "success");
      } else {
        showToast("បានបដិសេធការចុះឈ្មោះ", "info");
      }
      fetchRegistrations();
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("មិនអាចផ្លាស់ប្តូរស្ថានភាពបានទេ", "error");
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, "registrations", itemToDelete));
        setItemToDelete(null);
        showToast("បានលុបទិន្នន័យចុះឈ្មោះរួចរាល់", "success");
        fetchRegistrations();
      } catch (error) {
        console.error("Error deleting registration:", error);
        showToast("មិនអាចលុបទិន្នន័យបានទេ", "error");
      }
    }
  };

  // Unique list of course titles for filter dropdown
  const uniqueCourses = useMemo(() => {
    const list = Array.from(new Set(registrations.map(r => r.course).filter(Boolean)));
    return list;
  }, [registrations]);

  // Statistics
  const stats = useMemo(() => {
    const total = registrations.length;
    const pending = registrations.filter(r => r.status === 'pending' || !r.status).length;
    const approved = registrations.filter(r => r.status === 'approved').length;
    const rejected = registrations.filter(r => r.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [registrations]);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      // Status filter
      if (statusFilter === 'pending' && reg.status !== 'pending' && reg.status) return false;
      if (statusFilter === 'approved' && reg.status !== 'approved') return false;
      if (statusFilter === 'rejected' && reg.status !== 'rejected') return false;

      // Course filter
      if (courseFilter !== 'all' && reg.course !== courseFilter) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const nameMatch = (reg.name || '').toLowerCase().includes(queryLower);
        const phoneMatch = (reg.phone || '').toLowerCase().includes(queryLower);
        const emailMatch = (reg.email || '').toLowerCase().includes(queryLower);
        const courseMatch = (reg.course || '').toLowerCase().includes(queryLower);
        const noteMatch = (reg.note || '').toLowerCase().includes(queryLower);
        if (!nameMatch && !phoneMatch && !emailMatch && !courseMatch && !noteMatch) {
          return false;
        }
      }

      return true;
    });
  }, [registrations, statusFilter, courseFilter, searchQuery]);

  // Paginated list
  const paginatedRegistrations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRegistrations, currentPage]);

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, courseFilter]);

  // Handle manual student registration creation by admin
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast("សូមបញ្ចូលឈ្មោះ និងលេខទូរស័ព្ទសិស្ស", "error");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "registrations"), {
        ...formData,
        createdAt: serverTimestamp()
      });
      showToast("បានបន្ថែមទិន្នន័យសិស្សចុះឈ្មោះជោគជ័យ!", "success");
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        course: 'Web Development (HTML, CSS, JS, React)',
        schedule: 'ច័ន្ទ - សុក្រ (08:00 AM - 10:00 AM)',
        note: '',
        status: 'pending'
      });
      fetchRegistrations();
    } catch (error) {
      console.error("Error adding student registration:", error);
      showToast("មានបញ្ហាក្នុងការបន្ថែមទិន្នន័យសិស្ស", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Seed sample demo registrations for testing
  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const sampleStudents = [
        {
          name: "ឡុង សុខា (Long Sokha)",
          phone: "012 345 678",
          email: "sokha.long@gmail.com",
          course: "Web Development (HTML, CSS, JS, React)",
          schedule: "ច័ន្ទ - សុក្រ (08:00 AM - 10:00 AM)",
          note: "សុំចុះឈ្មោះវគ្គសិក្សាពេលព្រឹក ទទួលអាហារូបករណ៍ CSR",
          status: "pending",
          createdAt: serverTimestamp()
        },
        {
          name: "ចាន់ ស្រីណេត (Chan Sreynet)",
          phone: "098 765 432",
          email: "sreynet.chan@gmail.com",
          course: "Python & Data Science Essentials",
          schedule: "សៅរ៍ - អាទិត្យ (02:00 PM - 05:00 PM)",
          note: "និស្សិតឆ្នាំទី៣ ចង់រៀនបន្ថែមបច្ចេកវិទ្យា Data Analyst",
          status: "approved",
          createdAt: serverTimestamp()
        },
        {
          name: "គង់ ពិសិដ្ឋ (Kong Piseth)",
          phone: "077 889 900",
          email: "piseth.kong@yahoo.com",
          course: "Mobile App Development (Flutter & React Native)",
          schedule: "ច័ន្ទ - សុក្រ (06:00 PM - 08:00 PM)",
          note: "បុគ្គលិកក្រុមហ៊ុន IT ចង់បន្ថែមជំនាញ Mobile App",
          status: "pending",
          createdAt: serverTimestamp()
        }
      ];

      for (const student of sampleStudents) {
        await addDoc(collection(db, "registrations"), student);
      }

      showToast("បានបង្កើតទិន្នន័យសិស្សគំរូ ៣ នាក់រួចរាល់!", "success");
      fetchRegistrations();
    } catch (error) {
      console.error("Error seeding demo data:", error);
      showToast("មានបញ្ហាក្នុងការបង្កើតទិន្នន័យគំរូ", "error");
    } finally {
      setSeeding(false);
    }
  };

  // Export to CSV / Excel with UTF-8 BOM
  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      showToast("គ្មានទិន្នន័យដើម្បី Export ទេ", "info");
      return;
    }

    const headers = [
      "ID", 
      "ឈ្មោះពេញ (Full Name)", 
      "លេខទូរស័ព្ទ (Phone)", 
      "អ៊ីមែល (Email)", 
      "វគ្គសិក្សា (Course)", 
      "កាលវិភាគ/វេន (Schedule)", 
      "ចំណាំ (Notes)", 
      "កាលបរិច្ឆេទចុះឈ្មោះ (Date)", 
      "ស្ថានភាព (Status)"
    ];

    const rows = filteredRegistrations.map(r => {
      const dateStr = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString('km-KH') : 'N/A';
      const statusText = r.status === 'approved' ? 'បានទទួលយក' : r.status === 'rejected' ? 'បានបដិសេធ' : 'រង់ចាំពិនិត្យ';

      return [
        `"${r.id}"`,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.phone || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        `"${(r.course || '').replace(/"/g, '""')}"`,
        `"${(r.schedule || r.batch || '').replace(/"/g, '""')}"`,
        `"${(r.note || '').replace(/"/g, '""')}"`,
        `"${dateStr}"`,
        `"${statusText}"`
      ];
    });

    // Add UTF-8 BOM byte \uFEFF so MS Excel opens Khmer characters correctly
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStamp = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Student_Registrations_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("បានទាញយករបាយការណ៍ CSV រួចរាល់!", "success");
  };

  return (
    <div className="space-y-6 p-6">
      <DeleteConfirmModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={confirmDelete} 
      />

      {/* Header & Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" />
            ការចុះឈ្មោះចូលរៀន (Student Registrations)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            គ្រប់គ្រង ត្រួតពិនិត្យ និង Export របាយការណ៍ឈ្មោះសិស្សដែលបានចុះឈ្មោះតាម Online Form
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition text-sm"
          >
            <UserPlus className="w-5 h-5" />
            <span>បន្ថែមសិស្សចុះឈ្មោះ</span>
          </button>

          <button 
            onClick={handleExportCSV}
            disabled={filteredRegistrations.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Download className="w-5 h-5" />
            <span>Export របាយការណ៍ (CSV)</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">សិស្សចុះឈ្មោះសរុប</p>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">រង់ចាំពិនិត្យ (Pending)</p>
            <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">បានទទួលយក (Approved)</p>
            <p className="text-2xl font-black text-emerald-600">{stats.approved}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">បានបដិសេធ (Rejected)</p>
            <p className="text-2xl font-black text-rose-600">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ស្វែងរកតាមឈ្មោះ, ទូរស័ព្ទ, អ៊ីមែល..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition bg-white"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition bg-white text-slate-700"
            >
              <option value="all">ស្ថានភាពទាំងអស់ (All Status)</option>
              <option value="pending">រង់ចាំពិនិត្យ (Pending)</option>
              <option value="approved">បានទទួលយក (Approved)</option>
              <option value="rejected">បានបដិសេធ (Rejected)</option>
            </select>
          </div>

          {/* Course Filter */}
          <div className="relative">
            <BookOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition bg-white text-slate-700"
            >
              <option value="all">វគ្គសិក្សាទាំងអស់ (All Courses)</option>
              {uniqueCourses.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchQuery || statusFilter !== 'all' || courseFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <p className="text-slate-500">
              បង្ហាញ <span className="font-bold text-slate-800">{filteredRegistrations.length}</span> នៃ {registrations.length} ការចុះឈ្មោះ
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCourseFilter('all');
              }}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> លុបការ Filter
            </button>
          </div>
        )}
      </div>

      {/* Registrations List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200 shadow-sm">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-medium">កំពុងទាញយកបញ្ជីការចុះឈ្មោះ...</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 text-lg">មិនទាន់មានការចុះឈ្មោះទេ</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">
            {searchQuery || statusFilter !== 'all' || courseFilter !== 'all' ? 'រកមិនឃើញទិន្នន័យតាមការស្វែងរករបស់អ្នកទេ' : 'មិនទាន់មានសិស្សចុះឈ្មោះតាម Online Form ឡើយ'}
          </p>

          {!searchQuery && statusFilter === 'all' && courseFilter === 'all' && (
            <div className="flex flex-wrap justify-center items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>បន្ថែមសិស្សចុះឈ្មោះដំបូង</span>
              </button>

              <button
                type="button"
                onClick={handleSeedDemoData}
                disabled={seeding}
                className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-sm transition border border-amber-200 flex items-center gap-2"
              >
                {seeding ? (
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-600" />
                )}
                <span>បង្កើតទិន្នន័យគំរូសាកល្បង (Seed Demo)</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {paginatedRegistrations.map(reg => (
              <div 
                key={reg.id} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{reg.name}</h3>
                    
                    {reg.status === 'approved' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> បានទទួលយក
                      </span>
                    )}
                    {reg.status === 'rejected' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> បានបដិសេធ
                      </span>
                    )}
                    {(!reg.status || reg.status === 'pending') && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                        <Clock3 className="w-3.5 h-3.5" /> រង់ចាំពិនិត្យ
                      </span>
                    )}
                  </div>

                  <p className="text-primary font-bold text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    <span>វគ្គសិក្សា៖ {reg.course}</span>
                  </p>

                  {(reg.schedule || reg.batch) && (
                    <p className="text-slate-600 text-sm flex items-center gap-2 bg-blue-50/60 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-100/80 w-fit">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold">វេន/កាលវិភាគ៖</span> {reg.schedule || reg.batch}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 pt-1">
                    <a href={`tel:${reg.phone}`} className="flex items-center gap-1.5 hover:text-primary font-medium">
                      <Phone className="w-4 h-4 text-slate-400"/> {reg.phone}
                    </a>
                    {reg.email && (
                      <a href={`mailto:${reg.email}`} className="flex items-center gap-1.5 hover:text-primary font-medium">
                        <Mail className="w-4 h-4 text-slate-400"/> {reg.email}
                      </a>
                    )}
                  </div>

                  {reg.note && (
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700">ចំណាំ៖</span> {reg.note}
                    </p>
                  )}

                  <div className="text-xs text-slate-400 flex items-center gap-1 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>ចុះឈ្មោះនៅ៖ {reg.createdAt?.toDate ? reg.createdAt.toDate().toLocaleString('km-KH') : 'N/A'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {reg.status !== 'approved' && (
                    <button 
                      onClick={() => updateStatus(reg.id, 'approved')} 
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold transition border border-emerald-200 text-sm"
                    >
                      <Check className="w-4 h-4" /> ទទួលយក
                    </button>
                  )}

                  {reg.status !== 'rejected' && (
                    <button 
                      onClick={() => updateStatus(reg.id, 'rejected')} 
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold transition border border-rose-200 text-sm"
                    >
                      <X className="w-4 h-4" /> បដិសេធ
                    </button>
                  )}

                  <button 
                    onClick={() => setItemToDelete(reg.id)} 
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-100"
                    title="លុបការចុះឈ្មោះនេះ"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-4">
              <p className="text-xs text-slate-500 font-medium">
                បង្ហាញទំព័រ <span className="font-bold text-slate-800">{currentPage}</span> នៃ {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ថយក្រោយ
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg transition ${
                        currentPage === i + 1 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  បន្ទាប់
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Add Manual Registration Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="bg-blue-50/80 px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">បន្ថែមសិស្សចុះឈ្មោះថ្មី</h3>
                  <p className="text-xs text-slate-500">បញ្ចូលទិន្នន័យសិស្សចូលក្នុងប្រព័ន្ធដោយផ្ទាល់</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ឈ្មោះពេញ (Full Name) <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ឧ. ឡុង សុខា"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    លេខទូរស័ព្ទ (Phone) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="012 345 678"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    អ៊ីមែល (Email)
                  </label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ជ្រើសរើសវគ្គសិក្សា (Course)
                </label>
                <input 
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="ឧ. Web Development"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  កាលវិភាគ / វេនសិក្សា (Schedule)
                </label>
                <select
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-slate-700"
                >
                  <option value="ច័ន្ទ - សុក្រ (08:00 AM - 10:00 AM)">ច័ន្ទ - សុក្រ (08:00 AM - 10:00 AM)</option>
                  <option value="ច័ន្ទ - សុក្រ (02:00 PM - 04:00 PM)">ច័ន្ទ - សុក្រ (02:00 PM - 04:00 PM)</option>
                  <option value="ច័ន្ទ - សុក្រ (06:00 PM - 08:00 PM)">ច័ន្ទ - សុក្រ (06:00 PM - 08:00 PM)</option>
                  <option value="សៅរ៍ - អាទិត្យ (08:00 AM - 11:00 AM)">សៅរ៍ - អាទិត្យ (08:00 AM - 11:00 AM)</option>
                  <option value="សៅរ៍ - អាទិត្យ (02:00 PM - 05:00 PM)">សៅរ៍ - អាទិត្យ (02:00 PM - 05:00 PM)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    ស្ថានភាព (Status)
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-slate-700 font-medium"
                  >
                    <option value="pending">រង់ចាំពិនិត្យ (Pending)</option>
                    <option value="approved">បានទទួលយក (Approved)</option>
                    <option value="rejected">បានបដិសេធ (Rejected)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    ចំណាំបន្ថែម (Notes)
                  </label>
                  <input 
                    type="text" 
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="ឧ. បង់ប្រាក់រួច ឬ ទទួលបានអាហារូបករណ៍"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-blue-800 text-white font-bold text-sm transition shadow-md flex items-center gap-2 disabled:opacity-70"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>រក្សាទុកទិន្នន័យសិស្ស</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
