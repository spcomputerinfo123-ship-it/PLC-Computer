import { useToast } from "../../context/ToastContext";
import { useState, useEffect, FormEvent, ChangeEvent, useMemo } from "react";
import { collection, query, orderBy, getDocs, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { Trash2, Image as ImageIcon, Plus, Edit2, X, Search, UploadCloud } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function AdminGallery() {
  const { showToast } = useToast();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImages(items);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
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
    const fileName = `gallery/${Date.now()}.${fileExt}`;
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
        setUrl(downloadURL);
        setIsUploading(false);
      }
    );
  };

  
  const [seeding, setSeeding] = useState(false);

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const sampleItems = [
        {
          title: "សកម្មភាពសិក្សាក្នុងថ្នាក់",
          title_en: "Classroom Activities",
          description: "សិស្សានុសិស្សកំពុងអនុវត្តផ្ទាល់",
          description_en: "Students practicing directly",
          imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
          category: "ថ្នាក់រៀន (Classroom)",
          status: "published",
          createdAt: serverTimestamp()
        },
        {
          title: "ពិធីចែកវិញ្ញាបនបត្រ",
          title_en: "Certificate Awarding",
          description: "ការប្រគល់វិញ្ញាបនបត្រដល់សិស្សបញ្ចប់វគ្គ",
          description_en: "Awarding certificates to graduates",
          imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
          category: "ព្រឹត្តិការណ៍ (Events)",
          status: "published",
          createdAt: serverTimestamp()
        },
        {
          title: "ដំណើរទស្សនកិច្ចសិក្សា",
          title_en: "Study Tour",
          description: "ទស្សនកិច្ចនៅក្រុមហ៊ុនបច្ចេកវិទ្យា",
          description_en: "Tech company visit",
          imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
          category: "ព្រឹត្តិការណ៍ (Events)",
          status: "published",
          createdAt: serverTimestamp()
        }
      ];

      for (const item of sampleItems) {
        await addDoc(collection(db, "gallery"), item);
      }
      
      showToast("បានបង្កើតទិន្នន័យរូបភាពគំរូ ៣ ជោគជ័យ!", "success");
      fetchImages();
    } catch (error) {
      console.error("Error seeding gallery:", error);
      showToast("មានបញ្ហាក្នុងការបង្កើតទិន្នន័យគំរូ", "error");
    } finally {
      setSeeding(false);
    }
  };

  const handleAddOrEdit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "gallery", editingId), {
          url,
          title,
          title_en: titleEn
        });
      } else {
        await addDoc(collection(db, "gallery"), {
          url,
          title,
          title_en: titleEn,
          createdAt: serverTimestamp()
        });
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      fetchImages();
    } catch (error) {
      console.error("Error saving image:", error);
      alert("មានបញ្ហាក្នុងការរក្សាទុក");
    }
  };

  const resetForm = () => {
    setUrl("");
    setTitle("");
    setTitleEn("");
  };

  const handleEdit = (img: any) => {
    setEditingId(img.id);
    setUrl(img.url);
    setTitle(img.title || "");
    setTitleEn(img.title_en || "");
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, "gallery", itemToDelete));
        fetchImages();
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
  };

  const filteredImages = useMemo(() => {
    return images.filter(item => {
      const searchStr = searchQuery.toLowerCase();
      return (item.url?.toLowerCase() || '').includes(searchStr);
    });
  }, [images, searchQuery]);

  const paginatedImages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredImages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredImages, currentPage]);

  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);

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
          <ImageIcon className="w-5 h-5 text-primary mr-2" /> 
          គ្រប់គ្រងវិចិត្រសាល (Gallery Manager)
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ស្វែងរកតាម URL..." 
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload រូបភាព ឬបញ្ចូល URL (Image Upload/URL)</label>
              <div className="flex flex-col gap-3">
                <div className="relative w-full">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                    <UploadCloud className="w-5 h-5 text-blue-500" />
                    {isUploading ? `កំពុង Upload... ${uploadProgress}%` : 'ជ្រើសរើសរូបភាពពីកុំព្យូទ័រ (Upload Image)'}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span>ឬ (OR)</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required maxLength={1000} placeholder="https://images.unsplash.com/photo-..." className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ចំណងជើង (ខ្មែរ)</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="សកម្មភាពសិស្ស..." className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ចំណងជើង (English)</label>
                  <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} maxLength={100} placeholder="Student activities..." className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>

              {url && (
                <div className="mt-4">
                   <p className="text-sm text-slate-500 mb-2">មើលជាមុន (Preview):</p>
                   <img src={url} alt="Preview" className="h-40 rounded-xl object-cover border border-slate-200" />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">បោះបង់</button>
              <button type="submit" disabled={isUploading} className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">រក្សាទុក</button>
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        {loading ? (
          <p className="text-slate-500">កំពុងទាញយក...</p>
        ) : filteredImages.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            {searchQuery ? 'រកមិនឃើញរូបភាពដែលត្រូវនឹងការស្វែងរកទេ។' : 'គ្មានទិន្នន័យទេ'}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {paginatedImages.map((item) => (
                <div key={item.id} className="relative group rounded-xl overflow-hidden border border-slate-200">
                  <img src={item.url} alt={item.title || "Gallery"} className="w-full h-40 object-cover" />
                  {(item.title || item.title_en) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs truncate">
                      {item.title || item.title_en}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(item)} className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  បង្ហាញ {((currentPage - 1) * itemsPerPage) + 1} ដល់ {Math.min(currentPage * itemsPerPage, filteredImages.length)} នៃ {filteredImages.length} រូបភាព
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
          </>
        )}
      </div>
    </div>
  );
}
