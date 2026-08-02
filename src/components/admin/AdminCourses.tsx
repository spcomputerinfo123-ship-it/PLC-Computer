import { useState, useEffect, FormEvent, ChangeEvent, useMemo } from "react";
import { collection, query, orderBy, getDocs, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { 
  Trash2, BookOpen, Plus, Edit2, X, Search, UploadCloud, 
  Eye, EyeOff, Download, Filter, CheckCircle2, Layers, Tag
, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import RichTextEditor from "../RichTextEditor";
import { useToast } from "../../context/ToastContext";

const COURSE_CATEGORIES = [
  { id: "all", label: "ប្រភេទទាំងអស់ (All)" },
  { id: "it_software", label: "កុំព្យូទ័រ និង កម្មវិធី (IT & Software)" },
  { id: "web_dev", label: "អភិវឌ្ឍន៍វេបសាយ (Web Development)" },
  { id: "mobile_app", label: "កម្មវិធីទូរស័ព្ទ (Mobile App)" },
  { id: "graphic_design", label: "រចនាក្រាហ្វិក (Graphic Design)" },
  { id: "network_cyber", label: "បណ្តាញ និង សុវត្ថិភាព (Network & Cyber Security)" },
  { id: "office_skills", label: "រដ្ឋបាល និង រូបភាព (Office & Admin)" },
  { id: "other", label: "ផ្សេងៗ (Other)" }
];

export default function AdminCourses() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'published' | 'hidden'
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form state
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [duration, setDuration] = useState("");
  const [durationEn, setDurationEn] = useState("");
  const [schedule, setSchedule] = useState("");
  const [scheduleEn, setScheduleEn] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [priceEn, setPriceEn] = useState("");
  const [category, setCategory] = useState("it_software");
  const [status, setStatus] = useState<"published" | "hidden">("published");
  const [icon, setIcon] = useState("BookOpen");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(items);
    } catch (error) {
      console.error("Error fetching courses:", error);
      showToast("មានបញ្ហាក្នុងការទាញយកទិន្នន័យ", "error");
    } finally {
      setLoading(false);
    }
  };

  
  const [seeding, setSeeding] = useState(false);

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const sampleCourses = [
        {
          title: "វគ្គសិក្សា កុំព្យូទ័ររដ្ឋបាល (Computer Administrative)",
          title_en: "Computer Administrative Course",
          duration: "៣ ខែ",
          duration_en: "3 Months",
          price: "$80",
          level: "កម្រិតដំបូង (Beginner)",
          level_en: "Beginner",
          category: "រដ្ឋបាល",
          category_en: "Administrative",
          description: "វគ្គសិក្សាសម្រាប់អ្នកចង់ចាប់ផ្តើមប្រើប្រាស់កុំព្យូទ័រ ដើម្បីបម្រើការងារការិយាល័យ",
          description_en: "Course for beginners to learn computer for office work",
          imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&h=300&fit=crop",
          status: "published",
          createdAt: serverTimestamp()
        },
        {
          title: "វគ្គសិក្សា រចនាគេហទំព័រ (Web Design & Development)",
          title_en: "Web Design & Development",
          duration: "៦ ខែ",
          duration_en: "6 Months",
          price: "$250",
          level: "កម្រិតមធ្យម (Intermediate)",
          level_en: "Intermediate",
          category: "បច្ចេកវិទ្យា (IT)",
          category_en: "IT",
          description: "រៀនបង្កើតគេហទំព័រជាមួយ HTML, CSS, JS, និង React",
          description_en: "Learn to build websites with HTML, CSS, JS, and React",
          imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
          status: "published",
          createdAt: serverTimestamp()
        },
        {
          title: "វគ្គសិក្សា រចនាក្រាហ្វិក (Graphic Design Professional)",
          title_en: "Graphic Design Professional",
          duration: "៤ ខែ",
          duration_en: "4 Months",
          price: "$180",
          level: "គ្រប់កម្រិត (All Levels)",
          level_en: "All Levels",
          category: "រចនា (Design)",
          category_en: "Design",
          description: "រចនាឡូហ្គោ ផ្ទាំងផ្សាយ និងរូបភាពពាណិជ្ជកម្មដោយប្រើ Photoshop & Illustrator",
          description_en: "Design logos, banners, and commercial images using Photoshop & Illustrator",
          imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&h=300&fit=crop",
          status: "published",
          createdAt: serverTimestamp()
        }
      ];

      for (const course of sampleCourses) {
        await addDoc(collection(db, "courses"), course);
      }
      
      showToast("បានបង្កើតទិន្នន័យវគ្គសិក្សាគំរូ ៣ ជោគជ័យ!", "success");
      fetchCourses();
    } catch (error) {
      console.error("Error seeding courses:", error);
      showToast("មានបញ្ហាក្នុងការបង្កើតទិន្នន័យគំរូ", "error");
    } finally {
      setSeeding(false);
    }
  };

  const handleAddOrEdit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "courses", editingId), {
          title,
          title_en: titleEn,
          description,
          description_en: descriptionEn,
          duration,
          duration_en: durationEn,
          schedule,
          schedule_en: scheduleEn,
          imageUrl: imageUrl,
          price: price,
          price_en: priceEn,
          category,
          status,
          icon
        });
        showToast("បានធ្វើបច្ចុប្បន្នភាពវគ្គសិក្សាជោគជ័យ!", "success");
      } else {
        await addDoc(collection(db, "courses"), {
          title,
          title_en: titleEn,
          description,
          description_en: descriptionEn,
          duration,
          duration_en: durationEn,
          schedule,
          schedule_en: scheduleEn,
          imageUrl,
          price,
          price_en: priceEn,
          category,
          status,
          icon,
          createdAt: serverTimestamp()
        });
        showToast("បានបន្ថែមវគ្គសិក្សាថ្មីជោគជ័យ!", "success");
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error("Error saving course:", error);
      showToast("មានបញ្ហាក្នុងការរក្សាទុក", "error");
    }
  };

  const resetForm = () => {
    setTitle("");
    setTitleEn("");
    setDescription("");
    setDescriptionEn("");
    setDuration("");
    setDurationEn("");
    setSchedule("");
    setScheduleEn("");
    setImageUrl("");
    setPrice("");
    setPriceEn("");
    setCategory("it_software");
    setStatus("published");
    setIcon("BookOpen");
  };

  const handleEdit = (course: any) => {
    setEditingId(course.id);
    setTitle(course.title || '');
    setTitleEn(course.title_en || '');
    setDescription(course.description || '');
    setDescriptionEn(course.description_en || '');
    setDuration(course.duration || '');
    setDurationEn(course.duration_en || '');
    setSchedule(course.schedule || '');
    setScheduleEn(course.schedule_en || '');
    setImageUrl(course.imageUrl || '');
    setPrice(course.price || '');
    setPriceEn(course.price_en || '');
    setCategory(course.category || 'it_software');
    setStatus(course.status === 'hidden' ? 'hidden' : 'published');
    setIcon(course.icon || 'BookOpen');
    setIsAdding(true);
  };

  const handleToggleStatus = async (course: any) => {
    const newStatus = course.status === 'hidden' ? 'published' : 'hidden';
    try {
      await updateDoc(doc(db, "courses", course.id), { status: newStatus });
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: newStatus } : c));
      showToast(newStatus === 'published' ? "បានបង្ហាញវគ្គសិក្សា" : "បានលាក់វគ្គសិក្សា", "info");
    } catch (error) {
      console.error("Error toggling status:", error);
      showToast("មិនអាចផ្លាស់ប្តូរស្ថានភាពបានទេ", "error");
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, "courses", itemToDelete));
        showToast("បានលុបវគ្គសិក្សារួចរាល់!", "success");
        fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
        showToast("មិនអាចលុបទិន្នន័យបានទេ", "error");
      }
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const fileExt = file.name.split('.').pop();
    const fileName = `courses/${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Error uploading image:", error);
        alert("មានបញ្ហាក្នុងការ Upload រូបភាព");
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setImageUrl(downloadURL);
        setIsUploading(false);
      }
    );
  };

  const handleExportCSV = () => {
    if (filteredCourses.length === 0) {
      showToast("គ្មានទិន្នន័យដើម្បី Export ទេ", "info");
      return;
    }

    const headers = ["ID", "Title (Khmer)", "Title (English)", "Duration", "Schedule/Batches", "Price", "Category", "Status"];
    const rows = filteredCourses.map(c => [
      `"${c.id}"`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${(c.title_en || '').replace(/"/g, '""')}"`,
      `"${(c.duration || '').replace(/"/g, '""')}"`,
      `"${(c.schedule || '').replace(/"/g, '""')}"`,
      `"${(c.price || '').replace(/"/g, '""')}"`,
      `"${c.category || 'N/A'}"`,
      `"${c.status === 'hidden' ? 'Hidden' : 'Published'}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `courses_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("បានទាញយកទិន្នន័យវគ្គសិក្សាជា CSV រួចរាល់!", "success");
  };

  const IconDisplay = ({ iconName }: { iconName: string }) => {
    const IconCmp = (Icons as any)[iconName] || Icons.BookOpen;
    return <IconCmp className="w-5 h-5" />;
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter(c => c.status !== 'hidden').length;
    const hidden = courses.filter(c => c.status === 'hidden').length;
    const categoriesSet = new Set(courses.map(c => c.category || 'uncategorized'));
    return { total, published, hidden, categoriesCount: categoriesSet.size };
  }, [courses]);

  // Filter logic
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = (
        (course.title?.toLowerCase() || '').includes(searchStr) ||
        (course.title_en?.toLowerCase() || '').includes(searchStr) ||
        (course.description?.toLowerCase() || '').includes(searchStr) ||
        (course.description_en?.toLowerCase() || '').includes(searchStr)
      );

      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'published' && course.status !== 'hidden') ||
        (selectedStatus === 'hidden' && course.status === 'hidden');

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, searchQuery, selectedCategory, selectedStatus]);

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCourses, currentPage]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus]);

  const getCategoryLabel = (catId?: string) => {
    const found = COURSE_CATEGORIES.find(c => c.id === catId);
    return found ? found.label.split(' (')[0] : catId || 'ផ្សេងៗ';
  };

  return (
    <div className="space-y-6">
      <DeleteConfirmModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={confirmDelete} 
      />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">សរុបវគ្គសិក្សា</p>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">កំពុងបង្ហាញ (Active)</p>
            <p className="text-2xl font-black text-emerald-600">{stats.published}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <EyeOff className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">បានលាក់ (Hidden)</p>
            <p className="text-2xl font-black text-slate-600">{stats.hidden}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">ប្រភេទជំនាញ</p>
            <p className="text-2xl font-black text-purple-600">{stats.categoriesCount}</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header & Main Controls */}
        <div className="bg-slate-50 p-4 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center">
              <BookOpen className="w-5 h-5 text-primary mr-2" /> 
              គ្រប់គ្រងវគ្គសិក្សា (Course Manager)
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button 
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-sm"
                title="ទាញយកទិន្នន័យជា CSV/Excel"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              
              <button
                type="button"
                onClick={handleSeedDemoData}
                disabled={seeding}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-sm transition border border-amber-200 flex items-center gap-1 shadow-sm whitespace-nowrap"
              >
                {seeding ? (
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-600" />
                )}
                <span>Seed Demo</span>
              </button>
              <button 
                onClick={() => {
                  setIsAdding(!isAdding);
                  if (editingId) {
                    setEditingId(null);
                    resetForm();
                  }
                }} 
                className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center transition-colors shadow-sm whitespace-nowrap gap-1 ml-auto md:ml-0"
              >
                {isAdding && !editingId ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                {isAdding && !editingId ? 'បិទ' : 'បន្ថែមវគ្គសិក្សាថ្មី'}
              </button>
            </div>
          </div>

          {/* Search and Filters toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="ស្វែងរកវគ្គសិក្សា..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all bg-white"
              />
            </div>

            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all bg-white text-slate-700 appearance-none"
              >
                {COURSE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all bg-white text-slate-700"
              >
                <option value="all">ស្ថានភាពទាំងអស់ (All Status)</option>
                <option value="published">កំពុងបង្ហាញ (Published)</option>
                <option value="hidden">បានលាក់ (Hidden)</option>
              </select>
            </div>

            {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-xl transition flex items-center justify-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> លុប Filter
              </button>
            )}
          </div>
        </div>
        
        {/* Form Modal / In-line Drawer */}
        {isAdding && (
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <form onSubmit={handleAddOrEdit} className="space-y-4 max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-md font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {editingId ? 'កែប្រែវគ្គសិក្សា (Edit Course)' : 'បន្ថែមវគ្គសិក្សាថ្មី (Add New Course)'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ចំណងជើង (Khmer) *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title (English) *</label>
                  <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required maxLength={100} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ប្រភេទ / ជំនាញ (Category)</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none bg-white"
                  >
                    {COURSE_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">រយៈពេល (Khmer)</label>
                  <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} required maxLength={50} placeholder="ឧ. ៣០ ម៉ោង" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration (English)</label>
                  <input type="text" value={durationEn} onChange={(e) => setDurationEn(e.target.value)} required maxLength={50} placeholder="e.g. 30 Hours" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>

              {/* Class Schedule / Batches */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-800">កាលវិភាគ / វេនសិក្សា (Class Schedule & Batches)</label>
                  <span className="text-xs text-slate-500">ជ្រើសរើស ឬវាយបញ្ចូលកាលវិភាគ</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">កាលវិភាគ (Khmer)</label>
                    <input 
                      type="text" 
                      value={schedule} 
                      onChange={(e) => setSchedule(e.target.value)} 
                      placeholder="ឧ. ច័ន្ទ - សុក្រ (8:00 - 11:00 AM / 2:00 - 5:00 PM)" 
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm bg-white" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Schedule (English)</label>
                    <input 
                      type="text" 
                      value={scheduleEn} 
                      onChange={(e) => setScheduleEn(e.target.value)} 
                      placeholder="e.g. Mon - Fri (8:00 - 11:00 AM / 2:00 - 5:00 PM)" 
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm bg-white" 
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-slate-400 font-medium mr-1">គំរូកាលវិភាគ៖</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSchedule("ច័ន្ទ-សុក្រ (8:00-11:00 AM / 2:00-5:00 PM)");
                      setScheduleEn("Mon-Fri (8:00-11:00 AM / 2:00-5:00 PM)");
                    }}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 rounded-md transition font-medium"
                  >
                    + ច័ន្ទ-សុក្រ (ព្រឹក/រសៀល)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSchedule("សៅរ៍-អាទិត្យ (8:30-11:30 AM / 1:30-4:30 PM)");
                      setScheduleEn("Sat-Sun (8:30-11:30 AM / 1:30-4:30 PM)");
                    }}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 rounded-md transition font-medium"
                  >
                    + សៅរ៍-អាទិត្យ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSchedule("ថ្នាក់យប់ (5:30 - 7:30 PM)");
                      setScheduleEn("Evening Batch (5:30 - 7:30 PM)");
                    }}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 rounded-md transition font-medium"
                  >
                    + ថ្នាក់យប់
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">តម្លៃ (Khmer) [មិនចាំបាច់]</label>
                  <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="ឧ. $150 ឬ ឥតគិតថ្លៃ" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (English) [Optional]</label>
                  <input type="text" value={priceEn} onChange={(e) => setPriceEn(e.target.value)} placeholder="e.g. $150 or Free" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ស្ថានភាពបង្ហាញ (Status)</label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition text-xs font-bold ${status === 'published' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      <input 
                        type="radio" 
                        name="courseStatus" 
                        value="published" 
                        checked={status === 'published'} 
                        onChange={() => setStatus('published')}
                        className="sr-only"
                      />
                      <Eye className="w-3.5 h-3.5" /> កំពុងបង្ហាញ
                    </label>

                    <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition text-xs font-bold ${status === 'hidden' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      <input 
                        type="radio" 
                        name="courseStatus" 
                        value="hidden" 
                        checked={status === 'hidden'} 
                        onChange={() => setStatus('hidden')}
                        className="sr-only"
                      />
                      <EyeOff className="w-3.5 h-3.5" /> បានលាក់
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">រូបតំណាង (Icon Name from lucide-react)</label>
                  <div className="flex items-center gap-2">
                    <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} required maxLength={50} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex-shrink-0 text-primary">
                      <IconDisplay iconName={icon} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">ឧ. BookOpen, Monitor, Code, PenTool, Database...</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">រូបភាព (Image) [មិនចាំបាច់]</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                        <UploadCloud className="w-4 h-4 text-blue-500" />
                        {isUploading ? `កំពុង Upload... ${uploadProgress}%` : 'ជ្រើសរើសរូបភាព'}
                      </div>
                    </div>
                    {imageUrl && (
                      <img src={imageUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">ខ្លឹមសារពិស្តារ (Khmer)</label>
                <div className="bg-white">
                  <RichTextEditor value={description} onChange={setDescription} />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Content Details (English)</label>
                <div className="bg-white">
                  <RichTextEditor value={descriptionEn} onChange={setDescriptionEn} />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition-colors text-sm">បោះបង់</button>
                <button type="submit" disabled={isUploading} className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">រក្សាទុក</button>
              </div>
            </form>
          </div>
        )}

        {/* List view */}
        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-500 text-sm">កំពុងទាញយកទិន្នន័យវគ្គសិក្សា...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-semibold mb-1">
                {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'រកមិនឃើញវគ្គសិក្សាដែលត្រូវនឹង Filter ឬការស្វែងរកទេ។' 
                  : 'គ្មានវគ្គសិក្សាទេ'}
              </p>
              <p className="text-xs text-slate-400">សូមចុចប៊ូតុង &quot;បន្ថែមវគ្គសិក្សាថ្មី&quot; ដើម្បីចាប់ផ្តើមបង្កើត</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedCourses.map((item) => {
                const isHidden = item.status === 'hidden';

                return (
                  <div 
                    key={item.id} 
                    className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-2xl transition-all ${isHidden ? 'bg-slate-50/70 border-slate-200 opacity-75' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'}`}
                  >
                    <div className="w-16 h-16 bg-blue-50 text-primary flex items-center justify-center rounded-2xl shrink-0 border border-blue-100 overflow-hidden relative">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <IconDisplay iconName={item.icon} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                        {item.title_en && (
                          <span className="text-xs text-slate-400 font-medium">({item.title_en})</span>
                        )}

                        {/* Category Badge */}
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {getCategoryLabel(item.category)}
                        </span>

                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                          isHidden 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {isHidden ? 'បានលាក់' : 'កំពុងបង្ហាញ'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium pt-1">
                        <span>រយៈពេល: <strong className="text-slate-700">{item.duration || 'N/A'}</strong></span>
                        {item.price && (
                          <span>តម្លៃ: <strong className="text-emerald-600">{item.price}</strong></span>
                        )}
                        {item.schedule && (
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-semibold">
                            កាលវិភាគ: {item.schedule}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 line-clamp-2 pt-1" dangerouslySetInnerHTML={{ __html: item.description || '' }} />
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-center justify-end gap-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Status Toggle Button */}
                      <button 
                        onClick={() => handleToggleStatus(item)} 
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                          isHidden 
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={isHidden ? 'បើកបង្ហាញវគ្គសិក្សានេះ' : 'លាក់វគ្គសិក្សានេះ'}
                      >
                        {isHidden ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                        <span className="hidden md:inline">{isHidden ? 'បង្ហាញ' : 'លាក់'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 p-2 rounded-xl hover:bg-blue-50 transition-colors" title="កែប្រែ">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 transition-colors" title="លុប">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 font-medium">
                បង្ហាញ {((currentPage - 1) * itemsPerPage) + 1} ដល់ {Math.min(currentPage * itemsPerPage, filteredCourses.length)} នៃ {filteredCourses.length} វគ្គសិក្សា
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ថយក្រោយ
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition ${currentPage === i + 1 ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-100 text-slate-700'}`}
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
      </div>
    </div>
  );
}

