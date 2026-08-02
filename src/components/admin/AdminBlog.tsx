import React, { useState, useEffect, FormEvent, useRef } from "react";
import { collection, query, orderBy, getDocs, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Trash2, Edit2, Plus, Calendar, Image as ImageIcon, UploadCloud, Sparkles, BookOpen } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useToast } from "../../context/ToastContext";

export default function AdminBlog() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [formData, setFormData] = useState({
    title: "", title_en: "",
    category: "", category_en: "",
    excerpt: "", excerpt_en: "",
    image: "", date: ""
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("ទំហំរូបភាពធំពេក (សូមជ្រើសរើសរូបភាពតូចជាង 5MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData(prev => ({ ...prev, image: event.target!.result as string }));
        showToast("បាន Upload រូបភាពរួចរាល់!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const sampleBlogs = [
        {
          title: "អត្ថប្រយោជន៍នៃការរៀនសរសេរកូដសម្រាប់យុវជន",
          title_en: "Benefits of Learning Coding for Youth",
          category: "ចំណេះដឹងទូទៅ",
          category_en: "General Knowledge",
          excerpt: "ហេតុអ្វីបានជាអ្នកគួរចាប់ផ្តើមរៀនសរសេរកូដទោះជាអ្នកមិនមែនជាអ្នកជំនាញ IT ក៏ដោយ ព្រោះវាជួយពង្រឹងការគិតបែប Logic និងការដោះស្រាយបញ្ហា។",
          excerpt_en: "Why you should start learning to code regardless of your field, boosting logic and problem solving skills.",
          image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
          date: "១៥ វិច្ឆិកា ២០២៣",
          createdAt: serverTimestamp()
        },
        {
          title: "វិធីសាស្រ្តរៀបចំខ្លួនដើម្បីក្លាយជា Full-Stack Web Developer",
          title_en: "How to Prepare to Become a Full-Stack Web Developer",
          category: "បច្ចេកវិទ្យា",
          category_en: "Technology",
          excerpt: "ផ្លូវផ្លូវសិក្សា (Roadmap) ច្បាស់លាស់ចាប់ពី HTML/CSS, JavaScript, React រហូតដល់ Node.js និង Database សម្រាប់អ្នកចាប់ផ្តើមដំបូង។",
          excerpt_en: "A clear learning roadmap from HTML/CSS, JS, React to Node.js and Databases for beginners.",
          image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
          date: "២០ ធ្នូ ២០២៣",
          createdAt: serverTimestamp()
        },
        {
          title: "គន្លឹះការពារសុវត្ថិភាពទិន្នន័យផ្ទាល់ខ្លួននៅលើបណ្តាញអ៊ីនធឺណិត",
          title_en: "Tips to Protect Personal Data Security Online",
          category: "សន្តិសុខប្រព័ន្ធ",
          category_en: "Cybersecurity",
          excerpt: "ការយល់ដឹងអំពី Cybersecurity និងវិធីបង្ការការ Hack គណនី ឬការលួចទិន្នន័យផ្ទាល់ខ្លួនតាមបណ្តាញសង្គម។",
          excerpt_en: "Understanding cybersecurity basics and preventing account hacks and personal data theft online.",
          image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
          date: "០៥ មករា ២០២៤",
          createdAt: serverTimestamp()
        }
      ];

      for (const blog of sampleBlogs) {
        await addDoc(collection(db, "blogs"), blog);
      }

      showToast("បានបង្កើតទិន្នន័យអត្ថបទគំរូ ៣ បទជោគជ័យ!", "success");
      fetchItems();
    } catch (error) {
      console.error("Error seeding blog demo data:", error);
      showToast("មានបញ្ហាក្នុងការបង្កើតទិន្នន័យគំរូ", "error");
    } finally {
      setSeeding(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "blogs", editingId), formData);
        showToast("បានកែប្រែអត្ថបទជោគជ័យ!", "success");
      } else {
        await addDoc(collection(db, "blogs"), {
          ...formData,
          createdAt: serverTimestamp()
        });
        showToast("បានបន្ថែមអត្ថបទថ្មីជោគជ័យ!", "success");
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Error saving blog:", error);
      showToast("មានបញ្ហាក្នុងការរក្សាទុកអត្ថបទ", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", title_en: "", category: "", category_en: "", excerpt: "", excerpt_en: "", image: "", date: "" });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || "", title_en: item.title_en || "",
      category: item.category || "", category_en: item.category_en || "",
      excerpt: item.excerpt || "", excerpt_en: item.excerpt_en || "",
      image: item.image || item.imageUrl || "", date: item.date || ""
    });
    setIsAdding(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, "blogs", itemToDelete));
        showToast("បានលុបអត្ថបទជោគជ័យ!", "success");
        setItemToDelete(null);
        fetchItems();
      } catch (error) {
        console.error("Error deleting blog:", error);
        showToast("មានបញ្ហាក្នុងការលុបអត្ថបទ", "error");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            អត្ថបទ (Blog & Articles)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            គ្រប់គ្រងអត្ថបទ ចំណេះដឹង និងព័ត៌មានដែលបង្ហាញលើទំព័រ Blog
          </p>
        </div>

        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }} 
          className="flex items-center gap-2 bg-primary text-white px-4.5 py-2.5 rounded-xl font-bold hover:bg-blue-800 transition shadow-sm text-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> <span>បន្ថែមអត្ថបទថ្មី</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'កែប្រែអត្ថបទ' : 'បន្ថែមអត្ថបទថ្មី'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">ចំណងជើង (ខ្មែរ) *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm font-medium" placeholder="ឧ. អត្ថប្រយោជន៍នៃការរៀនសរសេរកូដ" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">ចំណងជើង (English)</label>
                <input type="text" value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g. Benefits of Learning Coding" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">ប្រភេទអត្ថបទ (ខ្មែរ) *</label>
                <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="ឧ. ចំណេះដឹងទូទៅ, បច្ចេកវិទ្យា..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">ប្រភេទអត្ថបទ (English)</label>
                <input type="text" value={formData.category_en} onChange={e => setFormData({...formData, category_en: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g. Technology, Cybersecurity..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">អត្ថបទសង្ខេប (ខ្មែរ) *</label>
                <textarea required rows={3} value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="សរសេរអត្ថបទសង្ខេប..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">អត្ថបទសង្ខេប (English)</label>
                <textarea rows={3} value={formData.excerpt_en} onChange={e => setFormData({...formData, excerpt_en: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Write summary in English..."></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">រូបភាពអត្ថបទ (Image URL) *</label>

                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload រូបភាព</span>
                  </button>
                </div>
                <input type="text" required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-xs font-mono" placeholder="https://images.unsplash.com/... ឬ Upload រូបភាព" />

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'})}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-600 rounded border border-slate-200"
                  >
                    💻 រូប Coding
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'})}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-600 rounded border border-slate-200"
                  >
                    🖥️ រូប Laptop
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">កាលបរិច្ឆេទបង្ហាញ (Date) *</label>
                <input type="text" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="ឧ. ១៥ វិច្ឆិកា ២០២៣" />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => {
                setFormData({
                  title: "អត្ថប្រយោជន៍នៃការរៀនសរសេរកូដ",
                  title_en: "Benefits of Learning to Code",
                  category: "ចំណេះដឹងទូទៅ",
                  category_en: "General Knowledge",
                  excerpt: "ហេតុអ្វីបានជាអ្នកគួរចាប់ផ្តើមរៀនសរសេរកូដទោះជាអ្នកមិនមែនជាអ្នកជំនាញ IT ក៏ដោយ។",
                  excerpt_en: "Why you should start learning to code even if you are not an IT professional.",
                  image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
                  date: "១៥ វិច្ឆិកា ២០២៣"
                });
              }} className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold transition-colors mr-auto">
                បំពេញទិន្នន័យគំរូ (Fill Example)
              </button>
              <button type="button" onClick={() => { setIsAdding(false); resetForm(); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors">បោះបង់</button>
              <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                {isSaving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                <span>រក្សាទុក</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium">កំពុងទាញយកទិន្នន័យអត្ថបទ...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 text-lg">មិនទាន់មានទិន្នន័យអត្ថបទទេ</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">
            អ្នកអាចបន្ថែមអត្ថបទថ្មី ឬបង្កើតទិន្នន័យអត្ថបទគំរូដើម្បីបង្ហាញលើវេបសាយ
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3">
            <button
              type="button"
              onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
              className="px-5 py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>បន្ថែមអត្ថបទថ្មី</span>
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
              <span>បង្កើតទិន្នន័យអត្ថបទគំរូ (Seed Demo)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition">
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                {item.category && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-primary shadow-xs">
                    {item.category}
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                  <Calendar className="w-3.5 h-3.5" /> {item.date}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-base leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-600 mb-4 line-clamp-2 flex-1 leading-relaxed">{item.excerpt}</p>
                <div className="flex gap-2 justify-end mt-auto pt-3 border-t border-slate-100">
                  <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition" title="កែប្រែ"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setItemToDelete(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition" title="លុប"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <DeleteConfirmModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={confirmDelete}
        title="បញ្ជាក់ការលុបអត្ថបទ"
        message="តើអ្នកពិតជាចង់លុបអត្ថបទនេះចេញពីប្រព័ន្ធមែនទេ?"
      />
    </div>
  );
}

