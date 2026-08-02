import React, { useState, useEffect, FormEvent, useRef } from "react";
import { collection, query, orderBy, getDocs, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Trash2, Edit2, Plus, Star, Sparkles, UploadCloud, MessageSquareQuote } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useToast } from "../../context/ToastContext";

export default function AdminTestimonials() {
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
    name: "", name_en: "",
    role: "", role_en: "",
    text: "", text_en: "",
    image: "", rating: 5
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "testimonials"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching testimonials:", error);
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
      const sampleData = [
        {
          name: "សុខ សាន្ត (Sok San)",
          name_en: "Sok San",
          role: "សិស្សវគ្គ Web Development (batch 12)",
          role_en: "Web Development Student (Batch 12)",
          text: "វគ្គសិក្សានេះពិតជាល្អខ្លាំងណាស់! គ្រូបង្រៀនពន្យល់បានច្បាស់លាស់ និងមានការអនុវត្តផ្ទាល់ច្រើន។ ឥឡូវនេះខ្ញុំអាចបង្កើត Website ខ្លួនឯងបានយ៉ាងរលូន។",
          text_en: "This course is amazing! The instructors explain concepts clearly with lots of hands-on practice. I can now build my own web applications easily.",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
          rating: 5,
          createdAt: serverTimestamp()
        },
        {
          name: "ចាន់ ធារី (Chan Theary)",
          name_en: "Chan Theary",
          role: "និស្សិតទទួលបានអាហារូបករណ៍ CSR ៥០%",
          role_en: "CSR 50% Scholarship Student",
          text: "សូមអរគុណដល់មជ្ឈមណ្ឌលដែលបានផ្តល់អាហារូបករណ៍ និងឱកាសរៀនសូត្រជំនាញបច្ចេកវិទ្យាថ្មីៗដល់រូបខ្ញុំ។ បរិយាកាសសិក្សាទំនើប និងគ្រូបង្រៀនយកចិត្តទុកដាក់ខ្ពស់។",
          text_en: "Grateful for the scholarship opportunity to study tech skills! Modern environment and highly supportive teachers.",
          image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
          rating: 5,
          createdAt: serverTimestamp()
        },
        {
          name: "លី ណារិទ្ធ (Ly Narith)",
          name_en: "Ly Narith",
          role: "សិស្សវគ្គ Mobile App & Flutter",
          role_en: "Flutter Mobile App Student",
          text: "រៀនចប់ទទួលបានជំនាញពិតប្រាកដ និងមានការជួយជ្រោមជ្រែងក្នុងការរៀបចំ Portfolio ដើម្បីដាក់ពាក្យធ្វើការងារ។ Recommend ខ្លាំងណាស់សម្រាប់អ្នកចង់រៀន Coding!",
          text_en: "Gained real skills and great guidance on building my portfolio for job applications. Highly recommended for anyone wanting to learn coding!",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
          rating: 5,
          createdAt: serverTimestamp()
        }
      ];

      for (const item of sampleData) {
        await addDoc(collection(db, "testimonials"), item);
      }

      showToast("បានបង្កើតទិន្នន័យមតិសិស្សគំរូ ៣ នាក់ជោគជ័យ!", "success");
      fetchItems();
    } catch (error) {
      console.error("Error seeding testimonials:", error);
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
        await updateDoc(doc(db, "testimonials", editingId), formData);
        showToast("បានកែប្រែមតិសិស្សជោគជ័យ!", "success");
      } else {
        await addDoc(collection(db, "testimonials"), {
          ...formData,
          createdAt: serverTimestamp()
        });
        showToast("បានបន្ថែមមតិសិស្សថ្មីជោគជ័យ!", "success");
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      showToast("មានបញ្ហាក្នុងការរក្សាទុកមតិសិស្ស", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", name_en: "", role: "", role_en: "", text: "", text_en: "", image: "", rating: 5 });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || "", name_en: item.name_en || "",
      role: item.role || "", role_en: item.role_en || "",
      text: item.text || "", text_en: item.text_en || "",
      image: item.image || "", rating: item.rating || 5
    });
    setIsAdding(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, "testimonials", itemToDelete));
        showToast("បានលុបមតិសិស្សជោគជ័យ!", "success");
        setItemToDelete(null);
        fetchItems();
      } catch (error) {
        console.error("Error deleting testimonial:", error);
        showToast("មានបញ្ហាក្នុងការលុបមតិសិស្ស", "error");
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquareQuote className="w-6 h-6 text-primary" />
            មតិយោបល់សិស្ស (Testimonials)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            គ្រប់គ្រងមតិយោបល់ និងការវាយតម្លៃរបស់សិស្សដែលបង្ហាញលើគេហទំព័រ
          </p>
        </div>

        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }} 
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-800 transition shadow-sm text-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> <span>បន្ថែមមតិថ្មី</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'កែប្រែមតិសិស្ស' : 'បន្ថែមមតិសិស្សថ្មី'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">ឈ្មោះ (ខ្មែរ) *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm font-medium" placeholder="ឧ. សុខ សាន្ត" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">ឈ្មោះ (English)</label>
                <input type="text" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g. Sok San" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">តួនាទី / វគ្គសិក្សា (ខ្មែរ) *</label>
                <input type="text" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="ឧ. សិស្សវគ្គ Web Development" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">តួនាទី / វគ្គសិក្សា (English)</label>
                <input type="text" value={formData.role_en} onChange={e => setFormData({...formData, role_en: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g. Web Dev Student" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">មតិយោបល់ (ខ្មែរ) *</label>
                <textarea required rows={3} value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="សរសេរមតិយោបល់នៅទីនេះ..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">មតិយោបល់ (English)</label>
                <textarea rows={3} value={formData.text_en} onChange={e => setFormData({...formData, text_en: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Write feedback in English..."></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">រូបភាពសិស្ស (Image)</label>

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
                <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-xs font-mono" placeholder="https://images.unsplash.com/... ឬ Upload រូបភាពខាងលើ" />

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'})}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-600 rounded border border-slate-200"
                  >
                    👤 រូបស្រី ១
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'})}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-600 rounded border border-slate-200"
                  >
                    👨 រូបប្រុស ១
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">ចំណាត់ថ្នាក់ (Rating: 1-5 Stars)</label>
                <select value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - ល្អឥតខ្ចោះ)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars - ល្អណាស់)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars - ល្អបង្គួរ)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => {
                setFormData({
                  name: "សុខ សាន្ត",
                  name_en: "Sok San",
                  role: "សិស្សវគ្គ Web Development",
                  role_en: "Web Development Student",
                  text: "វគ្គសិក្សានេះពិតជាល្អខ្លាំងណាស់ គ្រូបង្រៀនពន្យល់បានច្បាស់លាស់ និងមានការអនុវត្តផ្ទាល់ច្រើន។",
                  text_en: "The course is excellent, the instructor explains clearly and there are lots of practical exercises.",
                  image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80",
                  rating: 5
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
          <p className="text-xs font-medium">កំពុងទាញយកទិន្នន័យមតិសិស្ស...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          <MessageSquareQuote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 text-lg">មិនទាន់មានទិន្នន័យមតិសិស្សទេ</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">
            អ្នកអាចបន្ថែមមតិសិស្សថ្មី ឬបង្កើតទិន្នន័យមតិសិស្សគំរូដើម្បីបង្ហាញលើវេបសាយ
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3">
            <button
              type="button"
              onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
              className="px-5 py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>បន្ថែមមតិសិស្សថ្មី</span>
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
              <span>បង្កើតទិន្នន័យមតិគំរូ (Seed Demo)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex items-center gap-4">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-primary font-bold flex items-center justify-center text-lg">
                    {item.name ? item.name.charAt(0) : 'S'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{item.role}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(item.rating || 5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                </div>
              </div>
              <div className="flex-1 md:mx-6 text-xs sm:text-sm text-slate-600 line-clamp-2 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                &quot;{item.text}&quot;
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition" title="កែប្រែ"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => setItemToDelete(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition" title="លុប"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <DeleteConfirmModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={confirmDelete}
        title="បញ្ជាក់ការលុបមតិសិស្ស"
        message="តើអ្នកពិតជាចង់លុបមតិសិស្សនេះចេញពីប្រព័ន្ធមែនទេ?"
      />
    </div>
  );
}

