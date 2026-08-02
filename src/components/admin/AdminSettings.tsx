import React, { useState, useEffect, FormEvent } from 'react';
import { Settings, Save, Link as LinkIcon, QrCode, Video, UploadCloud, MapPin, Phone, Mail, Map } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface WebsiteSettings {
  qrCodeUrl: string;
  telegramLink: string;
  facebookLink: string;
  youtubeLink: string;
  tiktokLink: string;
  websiteLink?: string;
  promoVideoUrl?: string;
  promoVideoCover?: string;
  address?: string;
  addressEn?: string;
  phone?: string;
  email?: string;
  mapEmbedUrl?: string;
}

const defaultSettings: WebsiteSettings = {
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://t.me/plccomputer',
  telegramLink: 'https://t.me/plccomputer',
  facebookLink: 'https://facebook.com/plccomputer',
  youtubeLink: 'https://youtube.com/@plccomputer',
  tiktokLink: 'https://tiktok.com/@plccomputer',
  websiteLink: 'https://plccomputer.com',
  promoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  promoVideoCover: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  address: 'ក្រុងប៉ោយប៉ែត, ខេត្តបន្ទាយមានជ័យ',
  addressEn: 'Poipet City, Banteay Meanchey Province',
  phone: '087 850 014 / 097 501 3648',
  email: 'plccomputerinfo123@gmail.com',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.732442220464!2d102.5644781!3d13.6568449!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311b2cfd27c73fa3%3A0x7d6cba6e8b46cdfb!2sPoipet%2C%20Cambodia!5e0!3m2!1sen!2skh!4v1716382100000!5m2!1sen!2skh'
};

export default function AdminSettings() {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'promoVideoCover' | 'qrCodeUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = fieldName === 'promoVideoCover' ? setUploadingCover : setUploadingQr;
    setUploading(true);

    const fallbackBase64 = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setSettings(prev => ({ ...prev, [fieldName]: reader.result as string }));
          showToast(lang === 'km' ? 'បាន Upload រូបភាពជោគជ័យ!' : 'Image uploaded successfully!', 'success');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `settings/${fieldName}_${Date.now()}.${fileExt}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.warn("Storage upload error, using fallback reader:", error);
          fallbackBase64();
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setSettings(prev => ({ ...prev, [fieldName]: downloadURL }));
            showToast(lang === 'km' ? 'បាន Upload រូបភាពជោគជ័យ!' : 'Image uploaded successfully!', 'success');
          } catch {
            fallbackBase64();
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (err) {
      console.error("Error initiating upload:", err);
      fallbackBase64();
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'website_settings', 'current');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSettings(docSnap.data() as WebsiteSettings);
        } else {
          // If no settings exist, save the default ones
          await setDoc(docRef, defaultSettings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'website_settings', 'current'), settings);
      showToast(lang === 'km' ? 'បានរក្សាទុកកំណត់គេហទំព័រជោគជ័យ!' : 'Website settings saved successfully!', 'success');
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast(lang === 'km' ? 'មានបញ្ហាក្នុងការរក្សាទុក!' : 'Error saving settings!', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
      <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" /> 
          {lang === 'km' ? 'កំណត់គេហទំព័រ (Website Settings)' : 'Website Settings'}
        </h3>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* QR Code Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              {lang === 'km' ? 'កំណត់ QR Code' : 'QR Code Settings'}
            </h4>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'km' ? 'តំណភ្ជាប់រូបភាព QR Code (Image URL)' : 'QR Code Image URL'}
                </label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    name="qrCodeUrl"
                    value={settings.qrCodeUrl} 
                    onChange={handleChange}
                    required 
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm" 
                    placeholder="https://example.com/qrcode.png" 
                  />
                  <label className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-lg cursor-pointer border border-slate-300 transition-colors shrink-0 text-xs sm:text-sm">
                    {uploadingQr ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                    )}
                    <span>{lang === 'km' ? 'Upload រូបភាព' : 'Upload Image'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, 'qrCodeUrl')}
                      disabled={uploadingQr}
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {lang === 'km' 
                    ? 'បញ្ជាក់: អ្នកអាចដាក់តំណភ្ជាប់ URL ឬចុច Upload រូបភាព QR Code ពីកុំព្យូទ័រ/ទូរស័ព្ទ។' 
                    : 'Note: You can put an image URL or click Upload Image.'}
                </p>
              </div>
              <div className="w-32 h-32 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                {settings.qrCodeUrl ? (
                  <img src={settings.qrCodeUrl} alt="QR Preview" className="w-full h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                ) : (
                  <QrCode className="w-8 h-8 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Contact Info Section (Address, Phone, Email) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {lang === 'km' ? 'អាសយដ្ឋាន និង ព័ត៌មានទំនាក់ទំនង (Contact Information)' : 'Contact Information'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {lang === 'km' ? 'អាសយដ្ឋាន (ភាសាខ្មែរ)' : 'Address (Khmer)'}
                </label>
                <input 
                  type="text" 
                  name="address"
                  value={settings.address || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder={lang === 'km' ? 'ឧ. ក្រុងប៉ោយប៉ែត, ខេត្តបន្ទាយមានជ័យ' : 'e.g. Poipet City, Banteay Meanchey'} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {lang === 'km' ? 'អាសយដ្ឋាន (ភាសាអង់គ្លេស)' : 'Address (English)'}
                </label>
                <input 
                  type="text" 
                  name="addressEn"
                  value={settings.addressEn || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="e.g. Poipet City, Banteay Meanchey Province" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  {lang === 'km' ? 'លេខទូរស័ព្ទ (Phone Number)' : 'Phone Number'}
                </label>
                <input 
                  type="text" 
                  name="phone"
                  value={settings.phone || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="087 850 014 / 097 501 3648" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-amber-600" />
                  {lang === 'km' ? 'អ៊ីម៉ែល (Email Address)' : 'Email Address'}
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={settings.email || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="plccomputerinfo123@gmail.com" 
                />
              </div>
            </div>
          </div>

          {/* Google Maps Location Embed Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Map className="w-5 h-5 text-indigo-600" />
              {lang === 'km' ? 'ទីតាំង Google Maps (Maps Location Embed)' : 'Google Maps Embed'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'km' ? 'តំណភ្ជាប់ Google Maps Embed URL' : 'Google Maps Embed URL'}
                </label>
                <textarea 
                  name="mapEmbedUrl"
                  rows={3}
                  value={settings.mapEmbedUrl || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-xs font-mono" 
                  placeholder="https://www.google.com/maps/embed?pb=..." 
                />
                <p className="mt-1 text-xs text-slate-500">
                  {lang === 'km' 
                    ? 'ចំណាំ: ចូលទៅកាន់ Google Maps > ចុច Share > ជ្រើសរើស Embed a map > ចម្លងយក URL នៅក្នុង src="..." មកបិទភ្ជាប់ទីនេះ។' 
                    : 'Note: Go to Google Maps > Share > Embed a map > Copy the URL from src="..." and paste here.'}
                </p>
              </div>

              {/* Map Live Preview */}
              {settings.mapEmbedUrl && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    {lang === 'km' ? 'មើលគំរូទីតាំង (Map Preview):' : 'Map Preview:'}
                  </label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden h-56 bg-slate-100">
                    <iframe 
                      src={settings.mapEmbedUrl} 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Google Map Preview"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Links Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-green-600" />
              {lang === 'km' ? 'បណ្តាញសង្គម និងតំណភ្ជាប់ (Links & Socials)' : 'Links & Socials'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'km' ? 'តំណភ្ជាប់គេហទំព័រ (Website Link)' : 'Website Link'}</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    name="websiteLink"
                    value={settings.websiteLink || ''} 
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    placeholder="https://example.com" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (settings.websiteLink) {
                        setSettings(prev => ({
                          ...prev,
                          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(settings.websiteLink || '')}`
                        }));
                      } else {
                        showToast(lang === 'km' ? 'សូមបញ្ចូលតំណភ្ជាប់គេហទំព័រជាមុនសិន' : 'Please enter a website link first', 'info');
                      }
                    }}
                    className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-300 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
                    title={lang === 'km' ? 'យកតំណភ្ជាប់នេះបង្កើតជា QR Code' : 'Generate QR Code from this link'}
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telegram Link</label>
                <input 
                  type="url" 
                  name="telegramLink"
                  value={settings.telegramLink} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="https://t.me/username" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Link</label>
                <input 
                  type="url" 
                  name="facebookLink"
                  value={settings.facebookLink} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="https://facebook.com/page" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Link</label>
                <input 
                  type="url" 
                  name="youtubeLink"
                  value={settings.youtubeLink} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="https://youtube.com/@channel" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TikTok Link</label>
                <input 
                  type="url" 
                  name="tiktokLink"
                  value={settings.tiktokLink} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="https://tiktok.com/@username" 
                />
              </div>
            </div>
          </div>

          {/* Promo Video Settings Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-red-600" />
              {lang === 'km' ? 'កំណត់វីដេអូណែនាំ (Promo Video)' : 'Promo Video Settings'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'km' ? 'តំណភ្ជាប់វីដេអូ YouTube ឬ Facebook (Video URL)' : 'YouTube or Facebook Video URL'}
                </label>
                <input 
                  type="url" 
                  name="promoVideoUrl"
                  value={settings.promoVideoUrl || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="https://www.youtube.com/watch?v=... ឬ https://www.facebook.com/watch/?v=..." 
                />
                <p className="mt-1 text-xs text-slate-500">
                  {lang === 'km' 
                    ? 'គំរូ: https://www.youtube.com/watch?v=XXXX ឬ https://youtu.be/XXXX ឬ https://www.facebook.com/watch/?v=XXXX' 
                    : 'e.g. YouTube: https://www.youtube.com/watch?v=XXXX or Facebook: https://www.facebook.com/watch/?v=XXXX'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'km' ? 'រូបភាពក្របមុខវីដេអូ (Cover Thumbnail Image URL)' : 'Video Cover Thumbnail Image URL'}
                </label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    name="promoVideoCover"
                    value={settings.promoVideoCover || ''} 
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm" 
                    placeholder="https://images.unsplash.com/photo-..." 
                  />
                  <label className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-lg cursor-pointer border border-slate-300 transition-colors shrink-0 text-xs sm:text-sm">
                    {uploadingCover ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                    )}
                    <span>{lang === 'km' ? 'Upload រូបភាព' : 'Upload Image'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, 'promoVideoCover')}
                      disabled={uploadingCover}
                    />
                  </label>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {lang === 'km' 
                    ? 'រូបភាពបង្ហាញមុនពេលចុច Play (អ្នកអាចដាក់ URL ឬចុច Upload រូបភាពពីឧបករណ៍របស់អ្នក)' 
                    : 'Cover image shown before play (Enter URL or click Upload Image)'}
                </p>

                {/* Cover Image Preview */}
                {settings.promoVideoCover && (
                  <div className="mt-3 relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    <img 
                      src={settings.promoVideoCover} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                      {lang === 'km' ? 'រូបភាពគំរូ' : 'Preview'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-70"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {lang === 'km' ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
