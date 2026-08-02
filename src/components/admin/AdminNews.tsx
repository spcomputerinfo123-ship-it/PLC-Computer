import { useState, useEffect, FormEvent, ChangeEvent, useMemo } from "react";
import { collection, query, orderBy, getDocs, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { Trash2, FileText, Plus, Edit2, X, Search, UploadCloud } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import RichTextEditor from "../RichTextEditor";
import { useToast } from "../../context/ToastContext";

export default function AdminNews() {
  const { showToast } = useToast();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [date, setDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "news_events"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNews(items);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const fileExt = file.name.split('.').pop();
    const fileName = `news/${Date.now()}.${fileExt}`;
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

  
  const [seeding, setSeeding] = useState(false);

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const sampleNews = [
        {
          title: "កម្មវិធីចែករំលែកបទពិសោធន៍ការងារ IT",
          title_en: "IT Career Experience Sharing Event",
          date: "២០ កក្កដា ២០២៦",
          category: "ព្រឹត្តិការណ៍",
          category_en: "Event",
          description: "សាលាយើងនឹងរៀបចំកម្មវិធីចែករំលែកបទពិសោធន៍ពីសិស្សច្បងដែលទទួលបានជោគជ័យ។",
          description_en: "We are organizing an experience sharing event with successful alumni.",
          imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop",
          status: "published",
          createdAt: serverTimestamp()
        }
      ];

      for (const news of sampleNews) {
        await addDoc(collection(db, "news_events"), news);
      }
      
      showToast("បានបង្កើតទិន្នន័យគំរូជោគជ័យ!", "success");
      fetchNews();
    } catch (error) {
      console.error("Error seeding news:", error);
      showToast("មានបញ្ហាក្នុងការបង្កើតទិន្នន័យគំរូ", "error");
    } finally {
      setSeeding(false);
    }
  };

  const handleAddOrEdit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "news_events", editingId), {
          title,
          title_en: titleEn,
          description,
          description_en: descriptionEn,
          date,
          imageUrl
        });
        showToast("បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានជោគជ័យ!", "success");
      } else {
        await addDoc(collection(db, "news_events"), {
          title,
          title_en: titleEn,
          description,
          description_en: descriptionEn,
          date,
          imageUrl,
          createdAt: serverTimestamp()
        });
        showToast("បានបន្ថែមព័ត៌មានថ្មីជោគជ័យ!", "success");
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      fetchNews();
    } catch (error) {
      console.error("Error saving news:", error);
      showToast("មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ", "error");
    }
  };

  const resetForm = () => {
    setTitle("");
    setTitleEn("");
    setDescription("");
    setDescriptionEn("");
    setDate("");
    setImageUrl("");
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setTitleEn(item.title_en);
    setDescription(item.description);
    setDescriptionEn(item.description_en);
    setDate(item.date);
    setImageUrl(item.imageUrl || "");
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, "news_events", itemToDelete));
        showToast("បានលុបព័ត៌មានរួចរាល់!", "success");
        fetchNews();
      } catch (error) {
        console.error("Error deleting news:", error);
        showToast("មិនអាចលុបទិន្នន័យបានទេ", "error");
      }
    }
  };

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const searchStr = searchQuery.toLowerCase();
      return (
        (item.title?.toLowerCase() || '').includes(searchStr) ||
        (item.title_en?.toLowerCase() || '').includes(searchStr) ||
        (item.description?.toLowerCase() || '').includes(searchStr) ||
        (item.description_en?.toLowerCase() || '').includes(searchStr)
      );
    });
  }, [news, searchQuery]);

  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNews, currentPage]);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <DeleteConfirmModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={confirmDelete} 
      />
      <div className="bg-blue-50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-bold text-slate-900 flex items-center">
          <FileText className="w-5 h-5 text-primary mr-2" /> 
          គ្រប់គ្រងព័ត៌មាន និងព្រឹត្តិការណ៍ (News & Events)
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ស្វែងរកព័ត៌មាន..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all bg-white"
            />
          </div>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              if (editingId) {
                setEditingId(null);
                resetForm();
              }
            }} 
            className="w-full sm:w-auto bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center transition-colors shadow-sm whitespace-nowrap"
          >
            {isAdding && !editingId ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />} 
            {isAdding && !editingId ? 'បិទ' : 'បន្ថែមថ្មី'}
          </button>
        </div>
      </div>
      
      {isAdding && (
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleAddOrEdit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ចំណងជើង (Khmer)</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (English)</label>
                <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required maxLength={200} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">កាលបរិច្ឆេទ (Date)</label>
                <input type="text" value={date} onChange={(e) => setDate(e.target.value)} required maxLength={50} placeholder="ឧ. ១២ សីហា ២០២៤" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">រូបភាព (Image) [មិនចាំបាច់]</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                      <UploadCloud className="w-4 h-4" />
                      {isUploading ? `កំពុង Upload... ${uploadProgress}%` : 'ជ្រើសរើសរូបភាព'}
                    </div>
                  </div>
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="w-10 h-10 rounded object-cover border border-slate-200" />
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">ខ្លឹមសារ (Khmer)</label>
              <div className="bg-white">
                <RichTextEditor value={description} onChange={setDescription} />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Content (English)</label>
              <div className="bg-white">
                <RichTextEditor value={descriptionEn} onChange={setDescriptionEn} />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-8">
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">បោះបង់</button>
              <button type="submit" disabled={isUploading} className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">រក្សាទុក</button>
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        {loading ? (
          <p className="text-slate-500">កំពុងទាញយក...</p>
        ) : filteredNews.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            {searchQuery ? 'រកមិនឃើញព័ត៌មានដែលត្រូវនឹងការស្វែងរកទេ។' : 'គ្មានព័ត៌មានទេ'}
          </p>
        ) : (
          <div className="space-y-4">
            {paginatedNews.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title} className="w-24 h-24 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                  <p className="text-sm text-slate-500 mb-2">{item.date}</p>
                  <div className="text-sm text-slate-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.description }} />
                </div>
                <div className="shrink-0 flex items-start gap-2">
                  <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              បង្ហាញ {((currentPage - 1) * itemsPerPage) + 1} ដល់ {Math.min(currentPage * itemsPerPage, filteredNews.length)} នៃ {filteredNews.length} ព័ត៌មាន
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ថយក្រោយ
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded flex items-center justify-center ${currentPage === i + 1 ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                បន្ទាប់
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

