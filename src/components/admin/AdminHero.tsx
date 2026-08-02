import React, { useState, useEffect, FormEvent } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { Save, UploadCloud, X, LayoutTemplate } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminHero() {
  const { showToast } = useToast();
  const { lang } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    badge: 'ស្ថាប័នបណ្តុះបណ្តាល IT ឈានមុខគេ',
    badgeEn: 'Leading IT Training Institution',
    title1: 'អភិវឌ្ឍជំនាញឌីជីថលរបស់អ្នកជាមួយ',
    title1En: 'Develop your digital skills with',
    title2: 'ភី អិល ស៊ី',
    title2En: 'PLC Computer',
    desc: 'យើងផ្តល់ជូននូវកម្មវិធីសិក្សាដែលផ្តោតលើការអនុវត្តជាក់ស្តែង ជួយឱ្យអ្នកទទួលបានចំណេះដឹងពិតប្រាកដ និងត្រៀមខ្លួនរួចរាល់សម្រាប់ទីផ្សារការងារ។',
    descEn: 'We provide practical training programs that help you gain real knowledge and be ready for the job market.',
    btnCourses: 'ស្វែងរកវគ្គសិក្សា',
    btnCoursesEn: 'Explore Courses',
    btnContact: 'ទំនាក់ទំនងយើង',
    btnContactEn: 'Contact Us',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  });

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const docRef = doc(db, "website_settings", "hero");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data() as any);
      }
    } catch (error) {
      console.error("Error fetching hero data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const fallbackBase64 = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormData({ ...formData, imageUrl: reader.result as string });
          showToast(lang === 'km' ? 'បាន Upload រូបភាពជោគជ័យ!' : 'Image uploaded successfully!', 'success');
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero_${Date.now()}.${fileExt}`;
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
            setFormData({ ...formData, imageUrl: downloadURL });
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "website_settings", "hero"), formData);
      showToast(lang === 'km' ? 'បានរក្សាទុកជោគជ័យ!' : 'Saved successfully!', 'success');
    } catch (error) {
      console.error("Error saving hero data:", error);
      showToast(lang === 'km' ? 'មានបញ្ហាក្នុងការរក្សាទុក!' : 'Error saving data!', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
      <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-blue-600" />
          {lang === 'km' ? 'កំណត់ទំព័រដើម (Hero Section)' : 'Hero Section Settings'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {lang === 'km' ? 'រូបភាពទំព័រដើម' : 'Hero Image'}
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
            {formData.imageUrl ? (
              <div className="relative inline-block max-w-md w-full">
                <img src={formData.imageUrl} alt="Hero" className="w-full h-auto object-cover rounded-xl shadow-md border border-gray-200" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: "" })}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center py-8">
                <UploadCloud className="w-12 h-12 text-blue-500 mb-3" />
                <span className="text-sm font-medium text-gray-700 mb-1">
                  {lang === 'km' ? 'ចុចដើម្បី Upload រូបភាព' : 'Click to upload image'}
                </span>
                <span className="text-xs text-gray-500">
                  Recommended size: 1200x800px
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e)}
                />
              </label>
            )}
            {isUploading && (
              <div className="mt-4 max-w-md mx-auto">
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

        {/* Text Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-bold text-lg text-gray-900 border-b pb-2">ភាសាខ្មែរ</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
              <input type="text" name="badge" value={formData.badge} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title Part 1</label>
              <input type="text" name="title1" value={formData.title1} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title Part 2 (Highlight)</label>
              <input type="text" name="title2" value={formData.title2} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="desc" value={formData.desc} onChange={handleChange} rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button 1 (Courses)</label>
                <input type="text" name="btnCourses" value={formData.btnCourses} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button 2 (Contact)</label>
                <input type="text" name="btnContact" value={formData.btnContact} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-lg text-gray-900 border-b pb-2">English</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text (EN)</label>
              <input type="text" name="badgeEn" value={formData.badgeEn} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title Part 1 (EN)</label>
              <input type="text" name="title1En" value={formData.title1En} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title Part 2 (Highlight EN)</label>
              <input type="text" name="title2En" value={formData.title2En} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label>
              <textarea name="descEn" value={formData.descEn} onChange={handleChange} rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button 1 (Courses EN)</label>
                <input type="text" name="btnCoursesEn" value={formData.btnCoursesEn} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button 2 (Contact EN)</label>
                <input type="text" name="btnContactEn" value={formData.btnContactEn} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving || isUploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md shadow-blue-500/30 disabled:opacity-70 transition-all"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            {lang === 'km' ? 'រក្សាទុក' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
