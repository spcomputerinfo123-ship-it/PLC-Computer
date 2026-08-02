import { useToast } from "../../context/ToastContext";
import { useState, useEffect, FormEvent, useMemo } from "react";
import { collection, query, orderBy, getDocs, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Trash2, BookOpen, Plus, Edit2, X, Star, Search, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import RichTextEditor from "../RichTextEditor";
import { featuresData } from "../../data";

export default function AdminFeatures() {
  const { showToast } = useToast();
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [icon, setIcon] = useState("Star");

  useEffect(() => {
    fetchFeatures();
  }, []);

  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDefaultFeatures = async () => {
    setIsSeeding(true);
    try {
      for (const feat of featuresData) {
        await addDoc(collection(db, "features"), {
          title: feat.title,
          title_en: feat.title_en,
          description: feat.description,
          description_en: feat.description_en,
          icon: feat.icon,
          createdAt: serverTimestamp()
        });
      }
      await fetchFeatures();
    } catch (error) {
      console.error("Error seeding default features:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "features"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeatures(items);
    } catch (error) {
      console.error("Error fetching features:", error);
    } finally {
      setLoading(false);
    }
  };

  
  const [seeding, setSeeding] = useState(false);

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const sampleFeatures = [
        {
          title: "គ្រូបង្រៀនមានបទពិសោធន៍",
          title_en: "Experienced Instructors",
          description: "សិក្សាជាមួយសាស្ត្រាចារ្យមានបទពិសោធន៍ជាក់ស្តែងច្រើនឆ្នាំក្នុងវិស័យ IT",
          description_en: "Learn from instructors with years of practical experience in IT",
          icon: "Star",
          status: "published",
          createdAt: serverTimestamp()
        },
        {
          title: "ការអនុវត្តផ្ទាល់",
          title_en: "Hands-on Practice",
          description: "ផ្តោតសំខាន់លើការអនុវត្តជាក់ស្តែង ធានាចេះធ្វើការបន្ទាប់ពីបញ្ចប់ការសិក្សា",
          description_en: "Focus on practical exercises, ensuring you can work after graduation",
          icon: "Monitor",
          status: "published",
          createdAt: serverTimestamp()
        }
      ];

      for (const feature of sampleFeatures) {
        await addDoc(collection(db, "features"), feature);
      }
      
      showToast("បានបង្កើតទិន្នន័យគំរូជោគជ័យ!", "success");
      fetchFeatures();
    } catch (error) {
      console.error("Error seeding features:", error);
      showToast("មានបញ្ហាក្នុងការបង្កើតទិន្នន័យគំរូ", "error");
    } finally {
      setSeeding(false);
    }
  };

  const handleAddOrEdit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "features", editingId), {
          title,
          title_en: titleEn,
          description,
          description_en: descriptionEn,
          icon
        });
      } else {
        await addDoc(collection(db, "features"), {
          title,
          title_en: titleEn,
          description,
          description_en: descriptionEn,
          icon,
          createdAt: serverTimestamp()
        });
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      fetchFeatures();
    } catch (error) {
      console.error("Error saving feature:", error);
      alert("មានបញ្ហាក្នុងការរក្សាទុក");
    }
  };

  const resetForm = () => {
    setTitle("");
    setTitleEn("");
    setDescription("");
    setDescriptionEn("");
    setIcon("Star");
  };

  const handleEdit = (feature: any) => {
    setEditingId(feature.id);
    setTitle(feature.title);
    setTitleEn(feature.title_en);
    setDescription(feature.description);
    setDescriptionEn(feature.description_en);
    setIcon(feature.icon);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, "features", itemToDelete));
        fetchFeatures();
      } catch (error) {
        console.error("Error deleting feature:", error);
      }
    }
  };

  const IconDisplay = ({ iconName }: { iconName: string }) => {
    const IconCmp = (Icons as any)[iconName] || Icons.Star;
    return <IconCmp className="w-5 h-5" />;
  };

  const filteredFeatures = useMemo(() => {
    return features.filter(item => {
      const searchStr = searchQuery.toLowerCase();
      return (
        (item.title?.toLowerCase() || '').includes(searchStr) ||
        (item.title_en?.toLowerCase() || '').includes(searchStr) ||
        (item.description?.toLowerCase() || '').includes(searchStr) ||
        (item.description_en?.toLowerCase() || '').includes(searchStr)
      );
    });
  }, [features, searchQuery]);

  const paginatedFeatures = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFeatures.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFeatures, currentPage]);

  const totalPages = Math.ceil(filteredFeatures.length / itemsPerPage);

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
          <Star className="w-5 h-5 text-primary mr-2" /> 
          គ្រប់គ្រងចំណុចពិសេស (Features Manager)
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ស្វែងរកចំណុចពិសេស..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all bg-white"
            />
          </div>
          
          <button
            type="button"
            onClick={handleSeedDemoData}
            disabled={seeding}
            className="w-full sm:w-auto px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-sm transition border border-amber-200 flex items-center justify-center gap-1 shadow-sm whitespace-nowrap"
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
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (English)</label>
                <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required maxLength={100} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">រូបតំណាង (Icon Name from lucide-react)</label>
              <div className="flex items-center gap-2">
                 <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} required maxLength={50} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
                 <div className="p-2 bg-white rounded border border-slate-200 flex-shrink-0">
                    <IconDisplay iconName={icon} />
                 </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">ឧ. Star, Monitor, Award, Wrench, GraduationCap...</p>
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
              <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">រក្សាទុក</button>
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        {loading ? (
          <p className="text-slate-500">កំពុងទាញយក...</p>
        ) : filteredFeatures.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
            <Star className="w-10 h-10 text-slate-300" />
            <p className="text-slate-600 font-semibold">
              {searchQuery ? 'រកមិនឃើញចំណុចពិសេសដែលត្រូវនឹងការស្វែងរកទេ។' : 'គ្មានទិន្នន័យចំណុចពិសេសនៅក្នុង Firestore ទេ'}
            </p>
            {!searchQuery && (
              <button 
                onClick={handleSeedDefaultFeatures}
                disabled={isSeeding}
                className="px-4 py-2 bg-blue-50 text-primary hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-blue-200"
              >
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                {isSeeding ? 'កំពុងបង្កើតទិន្នន័យគំរូ...' : 'បង្កើតទិន្នន័យដើមគំរូ (Seed Default Features)'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedFeatures.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-16 h-16 bg-blue-50 text-primary flex items-center justify-center rounded-xl shrink-0 border border-blue-100">
                   <IconDisplay iconName={item.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                  <div className="text-sm text-slate-600 mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.description }} />
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
              បង្ហាញ {((currentPage - 1) * itemsPerPage) + 1} ដល់ {Math.min(currentPage * itemsPerPage, filteredFeatures.length)} នៃ {filteredFeatures.length} ចំណុចពិសេស
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
