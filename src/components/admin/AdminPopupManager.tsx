import React, { useState, useRef } from 'react';
import { Megaphone, Plus, Trash2, UploadCloud, Eye, CheckCircle2, XCircle, Sparkles, X, Image as ImageIcon } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PromoContent, PromoItem } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import DeleteConfirmModal from './DeleteConfirmModal';

interface AdminPopupManagerProps {
  promoContent: PromoContent;
  onUpdatePromo: (newPromo: PromoContent) => void;
}

export default function AdminPopupManager({ promoContent, onUpdatePromo }: AdminPopupManagerProps) {
  const { showToast } = useToast();
  const { lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [itemToDeleteIndex, setItemToDeleteIndex] = useState<number | null>(null);

  // Modal State for Adding New Popup
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newPopupForm, setNewPopupForm] = useState<Omit<PromoItem, 'id'>>({
    title: '',
    title_en: '',
    text: '',
    text_en: '',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    active: true
  });

  // Initialize popups list from promoContent prop
  const [popups, setPopups] = useState<PromoItem[]>(() => {
    if (promoContent?.popups && promoContent.popups.length > 0) {
      return promoContent.popups;
    }
    return [
      {
        id: 'popup-1',
        title: promoContent?.title || 'អាហារូបករណ៍ CSR ៥០%',
        title_en: promoContent?.title_en || 'CSR Scholarship 50%',
        text: promoContent?.text || 'ទទួលបានអាហារូបករណ៍រហូតដល់ ៥០% សម្រាប់សិស្សឆ្នើម!',
        text_en: promoContent?.text_en || 'Get up to 50% scholarship for outstanding students!',
        image: promoContent?.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        active: true
      },
      {
        id: 'popup-2',
        title: 'ចុះឈ្មោះថ្នាក់សិក្សា IT ជំនាន់ថ្មី',
        title_en: 'New IT & Coding Batch Enrollment',
        text: 'បើកទទួលចុះឈ្មោះសិស្សថ្មីសម្រាប់វគ្គ Web Development & Mobile App!',
        text_en: 'Now open for enrollment in Web Development & Mobile App courses!',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        active: true
      },
      {
        id: 'popup-3',
        title: 'សិក្ខាសាលាចែករំលែកបទពិសោធន៍បច្ចេកវិទ្យា',
        title_en: 'Free Tech Career Seminar',
        text: 'ចូលរួមដោយសេរីជាមួយអ្នកជំនាញ IT ដើម្បីស្វែងយល់ពីឱកាសការងារបច្ចេកវិទ្យា!',
        text_en: 'Join free session with IT experts to explore tech career opportunities!',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        active: true
      }
    ];
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentPopup = popups[selectedIndex] || popups[0];

  const updatePopupField = (field: keyof PromoItem, value: any) => {
    setPopups(prev => prev.map((p, idx) => idx === selectedIndex ? { ...p, [field]: value } : p));
  };

  const handleOpenAddModal = () => {
    setNewPopupForm({
      title: `ផ្ទាំងផ្សព្វផ្សាយទី #${popups.length + 1}`,
      title_en: `Promotion #${popups.length + 1}`,
      text: 'ទទួលបានការផ្តល់ជូនពិសេស និងអាហារូបករណ៍...',
      text_en: 'Get special promotional offer and scholarships...',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      active: true
    });
    setIsAddModalOpen(true);
  };

  const handleCreateNewPopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPopupForm.title.trim() || !newPopupForm.text.trim()) {
      showToast("សូមបញ្ចូលចំណងជើង និងខ្លឹមសារផ្ទាំងផ្សព្វផ្សាយ", "error");
      return;
    }

    setAddingNew(true);
    try {
      const newId = `popup-${Date.now()}`;
      const newPopupItem: PromoItem = {
        id: newId,
        title: newPopupForm.title,
        title_en: newPopupForm.title_en || newPopupForm.title,
        text: newPopupForm.text,
        text_en: newPopupForm.text_en || newPopupForm.text,
        image: newPopupForm.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        active: newPopupForm.active ?? true
      };

      const updated = [...popups, newPopupItem];
      setPopups(updated);
      setSelectedIndex(updated.length - 1);

      // Save directly to Firestore
      const firstActive = updated.find(p => p.active !== false) || updated[0];
      const payload: PromoContent = {
        popups: updated,
        title: firstActive.title,
        title_en: firstActive.title_en,
        text: firstActive.text,
        text_en: firstActive.text_en,
        image: firstActive.image
      };

      await setDoc(doc(db, "promo_content", "current"), payload);
      onUpdatePromo(payload);

      showToast("បានបង្កើត និងរក្សាទុកផ្ទាំងផ្សព្វផ្សាយថ្មីជោគជ័យ!", "success");
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error creating promo popup:", error);
      showToast("មានបញ្ហាក្នុងការបង្កើតផ្ទាំងផ្សព្វផ្សាយ", "error");
    } finally {
      setAddingNew(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (itemToDeleteIndex === null) return;
    setDeleting(true);

    try {
      let updatedPopups: PromoItem[];

      if (popups.length <= 1) {
        // If it's the last popup, reset it to a clean single default popup
        updatedPopups = [{
          id: `popup-${Date.now()}`,
          title: 'ផ្ទាំងផ្សព្វផ្សាយទី ១',
          title_en: 'Promotion #1',
          text: 'ទទួលបានអាហារូបករណ៍រហូតដល់ ៥០% សម្រាប់សិស្សឆ្នើម!',
          text_en: 'Get up to 50% scholarship for outstanding students!',
          image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
          active: true
        }];
      } else {
        updatedPopups = popups.filter((_, idx) => idx !== itemToDeleteIndex);
      }

      setPopups(updatedPopups);
      const nextIdx = Math.max(0, Math.min(selectedIndex, updatedPopups.length - 1));
      setSelectedIndex(nextIdx);

      // Save immediately to Firestore
      const firstActive = updatedPopups.find(p => p.active !== false) || updatedPopups[0];
      const payload: PromoContent = {
        popups: updatedPopups,
        title: firstActive.title,
        title_en: firstActive.title_en,
        text: firstActive.text,
        text_en: firstActive.text_en,
        image: firstActive.image
      };

      await setDoc(doc(db, "promo_content", "current"), payload);
      onUpdatePromo(payload);
      showToast("បានលុបផ្ទាំងផ្សព្វផ្សាយ និងរក្សាទុកជោគជ័យ!", "success");
    } catch (error) {
      console.error("Error deleting promo popup:", error);
      showToast("មានបញ្ហាក្នុងការលុបផ្ទាំងផ្សព្វផ្សាយ", "error");
    } finally {
      setDeleting(false);
      setItemToDeleteIndex(null);
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
        updatePopupField('image', event.target.result as string);
        showToast("បាន Upload រូបភាពផ្ទាំងផ្សព្វផ្សាយរួចរាល់!", "success");
      }
    };
    reader.onerror = () => {
      showToast("មានបញ្ហាក្នុងការ Upload រូបភាព", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const firstActive = popups.find(p => p.active !== false) || popups[0];

      const payload: PromoContent = {
        popups,
        title: firstActive.title,
        title_en: firstActive.title_en,
        text: firstActive.text,
        text_en: firstActive.text_en,
        image: firstActive.image
      };

      await setDoc(doc(db, "promo_content", "current"), payload);
      onUpdatePromo(payload);
      showToast("បានរក្សាទុកផ្ទាំងផ្សព្វផ្សាយទាំងអស់ជោគជ័យ!", "success");
    } catch (error) {
      console.error("Error saving promo content:", error);
      showToast("មានបញ្ហាក្នុងការរក្សាទុកផ្ទាំងផ្សព្វផ្សាយ", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-6xl">
      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={itemToDeleteIndex !== null}
        onClose={() => setItemToDeleteIndex(null)}
        onConfirm={handleConfirmDelete}
        title={lang === 'km' ? 'បញ្ជាក់ការលុបផ្ទាំងផ្សព្វផ្សាយ' : 'Confirm Delete Popup'}
        message={lang === 'km' ? `តើអ្នកពិតជាចង់លុបផ្ទាំងផ្សព្វផ្សាយទី #${(itemToDeleteIndex ?? 0) + 1} នេះមែនទេ?` : `Are you sure you want to delete popup #${(itemToDeleteIndex ?? 0) + 1}?`}
      />

      {/* Header */}
      <div className="bg-blue-50/70 p-6 border-b border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" /> 
            គ្រប់គ្រងផ្ទាំងផ្សព្វផ្សាយ (Popup Manager)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            បង្កើត និងគ្រប់គ្រងផ្ទាំងផ្សព្វផ្សាយច្រើន (Pop-ups) ដែលលោតបង្ហាញជូនសិស្ស ឬអ្នកចូលមើលគេហទំព័រ
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>បន្ថែមផ្ទាំងផ្សាយថ្មី</span>
        </button>
      </div>

      <div className="p-6">
        {/* Tab Selection Bar for Popups */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-100">
          {popups.map((popup, idx) => (
            <div
              key={popup.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl cursor-pointer transition border text-xs font-bold whitespace-nowrap ${
                idx === selectedIndex
                  ? 'bg-blue-50 border-blue-500 text-primary shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Megaphone className={`w-3.5 h-3.5 ${idx === selectedIndex ? 'text-primary' : 'text-slate-400'}`} />
              <span>ផ្ទាំងទី #{idx + 1}: {popup.title ? popup.title.substring(0, 16) + (popup.title.length > 16 ? '...' : '') : 'គ្មានចំណងជើង'}</span>
              
              {popup.active !== false ? (
                <span className="w-2 h-2 bg-emerald-500 rounded-full" title="កំពុងដំណើរការ"></span>
              ) : (
                <span className="w-2 h-2 bg-slate-300 rounded-full" title="បានបិទ"></span>
              )}

              {/* Delete Icon on Tab */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setItemToDeleteIndex(idx);
                }}
                className="ml-1 p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition"
                title="លុបផ្ទាំងនេះ"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form Column */}
          <form onSubmit={handleSaveAll} className="lg:col-span-7 space-y-5">
            {currentPopup && (
              <>
                {/* Active Switcher & Delete Button */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={currentPopup.active !== false}
                        onChange={(e) => updatePopupField('active', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                    <span className="text-xs font-bold text-slate-700">
                      {currentPopup.active !== false ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          កំពុងដំណើរការ (Active)
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-slate-400" />
                          បានបិទ (Inactive)
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setItemToDeleteIndex(selectedIndex)}
                    disabled={deleting}
                    className="text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200 transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>លុបផ្ទាំងនេះ</span>
                  </button>
                </div>

                {/* Title Input */}
                <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ចំណងជើងផ្ទាំងលោត (Promo Title)
                  </label>
                  <input 
                    type="text" 
                    value={currentPopup.title} 
                    onChange={(e) => updatePopupField('title', e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition text-sm font-medium" 
                    placeholder="ចំណងជើង (Khmer)" 
                  />
                  <input 
                    type="text" 
                    value={currentPopup.title_en} 
                    onChange={(e) => updatePopupField('title_en', e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition text-sm" 
                    placeholder="Title (English)" 
                  />
                </div>

                {/* Description Input */}
                <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    អត្ថបទពិពណ៌នា (Promo Description)
                  </label>
                  <textarea 
                    rows={2} 
                    value={currentPopup.text} 
                    onChange={(e) => updatePopupField('text', e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition text-sm" 
                    placeholder="អត្ថបទពិពណ៌នា (Khmer)"
                  ></textarea>
                  <textarea 
                    rows={2} 
                    value={currentPopup.text_en} 
                    onChange={(e) => updatePopupField('text_en', e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition text-sm" 
                    placeholder="Description (English)"
                  ></textarea>
                </div>

                {/* Image Upload & URL Input */}
                <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      រូបភាពផ្ទាំងផ្សព្វផ្សាយ (Image)
                    </label>

                    {/* Hidden Native File Input */}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {/* Upload Image Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload រូបភាព</span>
                    </button>
                  </div>

                  <input 
                    type="text" 
                    value={currentPopup.image} 
                    onChange={(e) => updatePopupField('image', e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition text-xs font-mono" 
                    placeholder="https://images.unsplash.com/... ឬជ្រើសរើស Upload រូបភាពខាងលើ"
                  />

                  {/* Quick Preset Images */}
                  <div>
                    <p className="text-xs text-slate-500 mb-2 font-medium">ជ្រើសរើសរូបភាពគំរូលឿនៗ (Quick Presets):</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updatePopupField('image', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80')}
                        className="text-xs px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 transition font-medium"
                      >
                        🎓 អាហារូបករណ៍
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePopupField('image', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80')}
                        className="text-xs px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 transition font-medium"
                      >
                        💻 វគ្គសិក្សា IT
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePopupField('image', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80')}
                        className="text-xs px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 transition font-medium"
                      >
                        👥 សិក្ខាសាលា
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save All Popups Button */}
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    )}
                    <span>រក្សាទុកផ្ទាំងផ្សព្វផ្សាយទាំងអស់</span>
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Right Live Preview Column */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full bg-slate-100 p-4 rounded-2xl border border-slate-200 sticky top-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600" />
                  មើលគំរូផ្សព្វផ្សាយទី #{selectedIndex + 1}
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  {lang === 'km' ? 'ភាសាខ្មែរ' : 'English'}
                </span>
              </div>

              {/* Popup Card Mockup */}
              {currentPopup && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
                  <div className="relative h-44 bg-slate-200">
                    <img 
                      src={currentPopup.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'} 
                      alt="Promo Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center text-xs">
                      ✕
                    </div>
                  </div>

                  <div className="p-5 text-center">
                    <span className="bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-flex items-center gap-1">
                      <Megaphone className="w-3 h-3" /> 
                      {lang === 'km' ? 'ការផ្សព្វផ្សាយពិសេស' : 'SPECIAL ANNOUNCEMENT'}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mb-1 line-clamp-2 leading-snug">
                      {(lang === 'km' ? currentPopup.title : currentPopup.title_en) || 'ចំណងជើងផ្ទាំងផ្សព្វផ្សាយ'}
                    </h4>
                    <p className="text-xs text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                      {(lang === 'km' ? currentPopup.text : currentPopup.text_en) || 'ខ្លឹមសារសង្ខេបនៃការផ្សព្វផ្សាយពិសេស...'}
                    </p>
                    
                    <div className="flex gap-2">
                      <div className="w-1/2 bg-slate-100 text-slate-700 text-xs font-bold py-2 rounded-xl text-center">
                        រំលង (Skip)
                      </div>
                      <div className="w-1/2 bg-primary text-white text-xs font-bold py-2 rounded-xl text-center">
                        ចុះឈ្មោះឥឡូវនេះ
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-500 text-center mt-3">
                💡 សរុបមាន <strong>{popups.filter(p => p.active !== false).length}</strong> ផ្ទាំងកំពុងដំណើរការលើវេបសាយ។
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Popup Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 my-8">
            {/* Modal Header */}
            <div className="bg-blue-50/80 px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">បន្ថែមផ្ទាំងផ្សព្វផ្សាយថ្មី (Add New Popup)</h3>
                  <p className="text-xs text-slate-500">បញ្ចូលព័ត៌មានផ្ទាំងផ្សព្វផ្សាយដើម្បីបង្ហាញជូនអ្នកមើលគេហទំព័រ</p>
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
            <form onSubmit={handleCreateNewPopup} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Promo Title Inputs */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ចំណងជើងផ្ទាំងផ្សាយ <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={newPopupForm.title}
                  onChange={(e) => setNewPopupForm({ ...newPopupForm, title: e.target.value })}
                  placeholder="ចំណងជើងភាសាខ្មែរ (ឧ. អាហារូបករណ៍ ៥០%)"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
                />
                <input 
                  type="text" 
                  value={newPopupForm.title_en}
                  onChange={(e) => setNewPopupForm({ ...newPopupForm, title_en: e.target.value })}
                  placeholder="Title in English (e.g. 50% Scholarship Offer)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>

              {/* Promo Description Inputs */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  អត្ថបទពិពណ៌នា <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  rows={2}
                  value={newPopupForm.text}
                  onChange={(e) => setNewPopupForm({ ...newPopupForm, text: e.target.value })}
                  placeholder="អត្ថបទពិពណ៌នាភាសាខ្មែរ..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                ></textarea>
                <textarea 
                  rows={2}
                  value={newPopupForm.text_en}
                  onChange={(e) => setNewPopupForm({ ...newPopupForm, text_en: e.target.value })}
                  placeholder="Description in English..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                ></textarea>
              </div>

              {/* Image Input & Upload */}
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    រូបភាពផ្ទាំងផ្សាយ (Image)
                  </label>

                  <input 
                    type="file" 
                    ref={modalFileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        showToast("ទំហំរូបភាពធំពេក (សូមជ្រើសរើសរូបភាពតូចជាង 5MB)", "error");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setNewPopupForm({ ...newPopupForm, image: event.target.result as string });
                          showToast("បាន Upload រូបភាពរួចរាល់!", "success");
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload រូបភាព</span>
                  </button>
                </div>

                <input 
                  type="text" 
                  value={newPopupForm.image}
                  onChange={(e) => setNewPopupForm({ ...newPopupForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs font-mono"
                />

                {/* Quick Preset Images */}
                <div className="pt-1">
                  <p className="text-[11px] text-slate-500 mb-1.5 font-medium">ជ្រើសរើសរូបភាពគំរូ (Quick Presets):</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewPopupForm({ ...newPopupForm, image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80' })}
                      className="text-[11px] px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 transition font-medium"
                    >
                      🎓 អាហារូបករណ៍
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPopupForm({ ...newPopupForm, image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80' })}
                      className="text-[11px] px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 transition font-medium"
                    >
                      💻 វគ្គសិក្សា IT
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPopupForm({ ...newPopupForm, image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80' })}
                      className="text-[11px] px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 transition font-medium"
                    >
                      👥 សិក្ខាសាលា
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ស្ថានភាពដំណើរការ (Active Status)
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newPopupForm.active}
                    onChange={(e) => setNewPopupForm({ ...newPopupForm, active: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Modal Action Buttons */}
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
                  disabled={addingNew}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-blue-800 text-white font-bold text-sm transition shadow-md flex items-center gap-2 disabled:opacity-70"
                >
                  {addingNew ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Plus className="w-4 h-4 stroke-[3]" />
                  )}
                  <span>បង្កើត និងរក្សាទុក</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
