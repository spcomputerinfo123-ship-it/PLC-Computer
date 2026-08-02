import { LogOut, LayoutTemplate, LayoutDashboard, Briefcase, Users, BookOpen, Megaphone, Presentation, Menu, X, Award, BarChart2, MessageSquare, FileText, HelpCircle, Eye, Settings, ClipboardList, ExternalLink, ChevronDown, ChevronRight, Home } from "lucide-react";
import { PromoContent } from "../types";
import { useState, FormEvent, useEffect } from "react";
import StrategicReport from "./admin/StrategicReport";
import AdminMessages from "./admin/AdminMessages";
import AdminNews from "./admin/AdminNews";
import AdminCourses from "./admin/AdminCourses";
import AdminFeatures from "./admin/AdminFeatures";
import AdminGallery from "./admin/AdminGallery";
import AdminFAQ from "./admin/AdminFAQ";
import AdminUsers from "./admin/AdminUsers";
import AdminSettings from "./admin/AdminSettings";
import AdminJobs from "./admin/AdminJobs";
import AdminHero from "./admin/AdminHero";
import AdminRegistrations from "./admin/AdminRegistrations";
import AdminTestimonials from "./admin/AdminTestimonials";
import AdminBlog from "./admin/AdminBlog";
import WebsitePreviewModal from "./admin/WebsitePreviewModal";
import AdminPopupManager from "./admin/AdminPopupManager";
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { doc, setDoc, collection, getCountFromServer } from "firebase/firestore";
import { db } from "../lib/firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type AdminTab = 'overview' | 'users' | 'popup' | 'reports' | 'messages' | 'news' | 'courses' | 'features' | 'gallery' | 'faq' | 'hero' | 'settings' | 'registrations' | 'jobs' | 'testimonials' | 'blog';

interface DashboardProps {
  user: any;
  role: 'student' | 'admin' | 'pending' | 'guest' | 'staff' | 'management' | 'other_staff';
  promoContent: PromoContent;
  onUpdatePromo: (content: PromoContent) => void;
  onLogout: () => void;
}

export default function Dashboard({ user, role, promoContent, onUpdatePromo, onLogout }: DashboardProps) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('overview');
  const [promoTitle, setPromoTitle] = useState(promoContent.title);
  const [promoTitleEn, setPromoTitleEn] = useState(promoContent.title_en);
  const [promoText, setPromoText] = useState(promoContent.text);
  const [promoTextEn, setPromoTextEn] = useState(promoContent.text_en);
  const [promoImage, setPromoImage] = useState(promoContent.image);
  const [isSavingPromo, setIsSavingPromo] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [stats, setStats] = useState({ messages: 0, news: 0, students: 0, courses: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [isFrontPageOpen, setIsFrontPageOpen] = useState(true);

  useEffect(() => {
    if (role === 'admin' && activeAdminTab === 'overview') {
      const fetchStats = async () => {
        setStatsLoading(true);
        try {
          const messagesSnap = await getCountFromServer(collection(db, "contact_messages"));
          const newsSnap = await getCountFromServer(collection(db, "news_events"));
          const usersSnap = await getCountFromServer(collection(db, "users"));
          const coursesSnap = await getCountFromServer(collection(db, "courses"));
          setStats({
            messages: messagesSnap.data().count,
            news: newsSnap.data().count,
            students: usersSnap.data().count,
            courses: coursesSnap.data().count
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchStats();
    }
  }, [role, activeAdminTab]);

  const handleUpdatePromo = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingPromo(true);
    try {
      const newPromo = { 
        title: promoTitle, 
        title_en: promoTitleEn,
        text: promoText, 
        text_en: promoTextEn,
        image: promoImage 
      };
      
      await setDoc(doc(db, "promo_content", "current"), newPromo);
      onUpdatePromo(newPromo);
      showToast("បានធ្វើបច្ចុប្បន្នភាពផ្ទាំងផ្សព្វផ្សាយជោគជ័យ!", "success");
    } catch (error) {
      console.error("Error updating promo:", error);
      showToast("មានបញ្ហាក្នុងការរក្សាទុកផ្ទាំងផ្សព្វផ្សាយ", "error");
    } finally {
      setIsSavingPromo(false);
    }
  };

  const AdminContent = () => {
    switch (activeAdminTab) {
      case 'users':
        return <AdminUsers />;
      case 'reports':
        return <StrategicReport />;
      case 'messages':
        return <AdminMessages />;
      case 'news':
        return <AdminNews />;
      case 'courses':
        return <AdminCourses />;
      case 'features':
        return <AdminFeatures />;
      case 'gallery':
        return <AdminGallery />;
      case 'faq':
        return <AdminFAQ />;
            case 'registrations':
        return <AdminRegistrations />;
      case 'testimonials':
        return <AdminTestimonials />;
      case 'jobs':
        return <AdminJobs />;
      case 'blog':
        return <AdminBlog />;
      case 'settings':
        return <AdminSettings />;
      case 'hero':
        return <AdminHero />;
      case 'popup':
        return <AdminPopupManager promoContent={promoContent} onUpdatePromo={onUpdatePromo} />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-blue-500">
                  <p className="text-sm font-medium text-slate-500">សិស្សសរុប (Students)</p>
                  {statsLoading ? (
                    <div className="h-9 w-20 bg-slate-200 animate-pulse rounded mt-2"></div>
                  ) : (
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.students}</p>
                  )}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-orange-500">
                  <p className="text-sm font-medium text-slate-500">វគ្គសិក្សាសរុប (Courses)</p>
                  {statsLoading ? (
                    <div className="h-9 w-20 bg-slate-200 animate-pulse rounded mt-2"></div>
                  ) : (
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.courses}</p>
                  )}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-green-500">
                  <p className="text-sm font-medium text-slate-500">សារទំនាក់ទំនង (Messages)</p>
                  {statsLoading ? (
                    <div className="h-9 w-20 bg-slate-200 animate-pulse rounded mt-2"></div>
                  ) : (
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.messages}</p>
                  )}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-purple-500">
                  <p className="text-sm font-medium text-slate-500">ព័ត៌មាន/ព្រឹត្តិការណ៍ (News)</p>
                  {statsLoading ? (
                    <div className="h-9 w-20 bg-slate-200 animate-pulse rounded mt-2"></div>
                  ) : (
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.news}</p>
                  )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-primary" />
                  ទិន្នន័យសង្ខេប (Data Overview)
                </h3>
                <div className="h-64">
                  {statsLoading ? (
                     <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl"></div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'សិស្ស', count: stats.students },
                          { name: 'វគ្គសិក្សា', count: stats.courses },
                          { name: 'សារ', count: stats.messages },
                          { name: 'ព័ត៌មាន', count: stats.news },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                        <Tooltip 
                          cursor={{ fill: '#f1f5f9' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                  ផ្លូវកាត់ (Quick Links)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <button onClick={() => setActiveAdminTab('users')} className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">គ្រប់គ្រងសិស្ស</span>
                  </button>
                  <button onClick={() => setActiveAdminTab('courses')} className="p-4 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-all flex flex-col items-center justify-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">គ្រប់គ្រងវគ្គសិក្សា</span>
                  </button>
                  <button onClick={() => setActiveAdminTab('reports')} className="p-4 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50 transition-all flex flex-col items-center justify-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">របាយការណ៍</span>
                  </button>
                  <button onClick={() => setActiveAdminTab('news')} className="p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all flex flex-col items-center justify-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">ព័ត៌មានថ្មីៗ</span>
                  </button>
                  <button onClick={() => setActiveAdminTab('messages')} className="p-4 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50 transition-all flex flex-col items-center justify-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">សារទំនាក់ទំនង</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  ព័ត៌មានបន្ថែម (Info)
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 text-blue-900 rounded-xl border border-blue-100">
                    <p className="font-bold mb-1">សូមស្វាគមន៍មកកាន់ Dashboard គ្រប់គ្រង!</p>
                    <p className="text-sm text-blue-800 opacity-90">នៅទីនេះអ្នកអាចគ្រប់គ្រងទិន្នន័យទាំងអស់នៃគេហទំព័រ PLC Computer។</p>
                  </div>
                  <div className="flex gap-4 items-center p-3 rounded-lg hover:bg-slate-50 transition">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-sm text-slate-600 flex-1">ប្រព័ន្ធដំណើរការបានល្អ (System is running smoothly)</p>
                  </div>
                  <div className="flex gap-4 items-center p-3 rounded-lg hover:bg-slate-50 transition">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="text-sm text-slate-600 flex-1">ទិន្នន័យត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិជារៀងរាល់ថ្ងៃ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f7fe] overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col z-40 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/logo.svg" alt="PLC Logo" className="w-10 h-10 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling!.style.display = "flex"; }} /><div className="hidden w-10 h-10 bg-primary text-white items-center justify-center rounded-lg font-bold">PLC</div>
                    <span className="font-bold text-xl text-gray-900">{role === 'admin' ? 'PLC Admin' : 'ប្រព័ន្ធសិស្ស'}</span>
                </div>
                <button className="md:hidden text-gray-500 hover:text-gray-800" onClick={() => setIsSidebarOpen(false)}>
                  <X className="text-xl w-5 h-5" />
                </button>
            </div>
            
            <nav className="flex-1 p-4 overflow-y-auto">
                {role === 'admin' ? (
                  <div className="space-y-6">
                    <div>
                      <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{lang === 'km' ? 'ម៉ឺនុយគោល' : 'Main Menu'}</p>
                      <div className="space-y-1">
                        <button onClick={() => { setActiveAdminTab('overview'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${activeAdminTab === 'overview' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                          <LayoutDashboard className="w-5 h-5" /> {lang === 'km' ? 'ផ្ទាំងគ្រប់គ្រង' : 'Dashboard'}
                        </button>
                        <button onClick={() => { setActiveAdminTab('reports'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${activeAdminTab === 'reports' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                          <BarChart2 className="w-5 h-5" /> {lang === 'km' ? 'របាយការណ៍យុទ្ធសាស្ត្រ' : 'Strategic Reports'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{lang === 'km' ? 'គ្រប់គ្រងទិន្នន័យ (Data)' : 'Data Management'}</p>
                      <div className="space-y-1">
                        <button onClick={() => { setActiveAdminTab('users'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${activeAdminTab === 'users' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                          <Users className="w-5 h-5" /> {lang === 'km' ? 'អ្នកប្រើប្រាស់' : 'Users'}
                        </button>
                        <button onClick={() => { setActiveAdminTab('registrations'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${activeAdminTab === 'registrations' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                          <ClipboardList className="w-5 h-5" /> {lang === 'km' ? 'ការចុះឈ្មោះ' : 'Registrations'}
                        </button>
                        <button onClick={() => { setActiveAdminTab('courses'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${activeAdminTab === 'courses' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                          <BookOpen className="w-5 h-5" /> {lang === 'km' ? 'វគ្គសិក្សា' : 'Courses'}
                        </button>
                        <button onClick={() => { setActiveAdminTab('jobs'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${activeAdminTab === 'jobs' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                          <Briefcase className="w-5 h-5" /> {lang === 'km' ? 'ឱកាសការងារ' : 'Jobs'}
                        </button>
                        <button onClick={() => { setActiveAdminTab('news'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${activeAdminTab === 'news' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                          <FileText className="w-5 h-5" /> {lang === 'km' ? 'ព័ត៌មាន និងព្រឹត្តិការណ៍' : 'News & Events'}
                        </button>
                        <button onClick={() => { setActiveAdminTab('blog'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${activeAdminTab === 'blog' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                          <FileText className="w-5 h-5" /> {lang === 'km' ? 'អត្ថបទ' : 'Blog'}
                        </button>
                        <button onClick={() => { setActiveAdminTab('messages'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${activeAdminTab === 'messages' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                          <MessageSquare className="w-5 h-5" /> {lang === 'km' ? 'សារទំនាក់ទំនង' : 'Messages'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{lang === 'km' ? 'គេហទំព័រ (Website)' : 'Website'}</p>
                      
                      <div className="space-y-1">
                        <button 
                          onClick={() => setIsFrontPageOpen(!isFrontPageOpen)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${['hero', 'features', 'gallery', 'testimonials', 'faq', 'popup'].includes(activeAdminTab) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Home className="w-5 h-5" />
                            {lang === 'km' ? 'ទំព័រដើម' : 'Front Page'}
                          </div>
                          {isFrontPageOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        
                        {isFrontPageOpen && (
                          <div className="space-y-1 pl-4 ml-2 border-l-2 border-slate-100 mt-1">
                            <button onClick={() => { setActiveAdminTab('hero'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${activeAdminTab === 'hero' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                              <LayoutTemplate className="w-4 h-4" /> {lang === 'km' ? 'វីដេអូ & ផ្ទាំងផ្សាយ (Hero)' : 'Hero'}
                            </button>
                            <button onClick={() => { setActiveAdminTab('features'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${activeAdminTab === 'features' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                              <Award className="w-4 h-4" /> {lang === 'km' ? 'ចំណុចពិសេស (Features)' : 'Features'}
                            </button>
                            <button onClick={() => { setActiveAdminTab('gallery'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${activeAdminTab === 'gallery' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                              <Presentation className="w-4 h-4" /> {lang === 'km' ? 'វិចិត្រសាល (Gallery)' : 'Gallery'}
                            </button>
                            <button onClick={() => { setActiveAdminTab('testimonials'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${activeAdminTab === 'testimonials' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                              <MessageSquare className="w-4 h-4" /> {lang === 'km' ? 'មតិយោបល់ (Testimonial)' : 'Testimonials'}
                            </button>
                            <button onClick={() => { setActiveAdminTab('faq'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${activeAdminTab === 'faq' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                              <HelpCircle className="w-4 h-4" /> {lang === 'km' ? 'សំណួរ-ចម្លើយ (FAQ)' : 'FAQ'}
                            </button>
                            <button onClick={() => { setActiveAdminTab('popup'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${activeAdminTab === 'popup' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                              <Megaphone className="w-4 h-4" /> {lang === 'km' ? 'ផ្ទាំងផ្សាយ (Popup)' : 'Popup'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{lang === 'km' ? 'ការកំណត់ (Settings)' : 'Settings'}</p>
                      <div className="space-y-1">
                        <button onClick={() => { setActiveAdminTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${activeAdminTab === 'settings' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                          <Settings className="w-5 h-5" /> {lang === 'km' ? 'កំណត់គេហទំព័រ' : 'Settings'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button onClick={() => { setActiveAdminTab('overview'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${activeAdminTab === 'overview' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                      <LayoutDashboard className="w-5 h-5" /> {lang === 'km' ? 'ទំព័រដើម' : 'Dashboard'}
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white shadow-md rounded-xl font-bold transition-all duration-300">
                      <Presentation className="w-5 h-5" /> {lang === 'km' ? 'វគ្គសិក្សារបស់ខ្ញុំ' : 'My Courses'}
                    </button>
                  </div>
                )}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-lg">
                      {role === 'admin' ? 'A' : 'S'}
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-900">{role === 'admin' ? 'ប្រធានរដ្ឋបាល' : role === 'pending' ? 'ភ្ញៀវ' : 'សិស្ស'}</p>
                        <p className="text-xs text-gray-500 font-medium">{role === 'admin' ? 'គណៈគ្រប់គ្រង (Admin)' : role === 'pending' ? 'រង់ចាំអនុម័ត (Pending)' : 'សិស្ស (Student)'}</p>
                    </div>
                </div>
                <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition font-bold">
                    <LogOut className="w-5 h-5" /> ចាកចេញ
                </button>
            </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0 transition-all bg-[#f4f7fe] overflow-y-auto">
                <header className="bg-white shadow-sm min-h-[4rem] py-2 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0 shrink-0 flex-wrap gap-4">
          <div className="flex items-center gap-4">
              <button className="md:hidden text-gray-500 hover:text-primary focus:outline-none" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="text-xl w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 hidden sm:block">
                {role === 'admin' ? (lang === 'km' ? 'ផ្ទាំងគ្រប់គ្រងទូទៅ (Admin)' : 'Admin Panel') : role === 'pending' ? (lang === 'km' ? 'គណនីថ្មី (New Account)' : 'New Account') : (lang === 'km' ? 'ទំព័រផ្ទាល់ខ្លួន (Portal)' : 'Portal')}
              </h2>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            {role === 'admin' && (
              <button 
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-500/40 text-sm cursor-pointer transform hover:-translate-y-0.5"
                title={lang === 'km' ? 'មើលគេហទំព័រផ្សាយផ្ទាល់' : 'Preview Live Website'}
              >
                <Eye className="w-4 h-4 md:w-5 md:h-5" />
                <span>{lang === 'km' ? 'មើលគេហទំព័រ' : 'Preview Website'}</span>
              </button>
            )}
            <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-inner overflow-hidden max-w-full">
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 truncate">{user?.email}</span>
                <span className="text-xs">{lang === 'km' ? 'ចូលប្រើប្រាស់ចុងក្រោយ:' : 'Last Login:'} {new Date(user?.metadata?.lastSignInTime || Date.now()).toLocaleString(lang === 'km' ? 'km-KH' : 'en-US')}</span>
              </div>
              <div className="hidden sm:flex px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg uppercase text-xs tracking-wider">
                {role.replace('_', ' ')}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
          {role === 'admin' ? (
            <AdminContent />
          ) : role === 'pending' ? (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
                    <h2 className="text-3xl font-bold mb-3 relative z-10 font-moul">{lang === 'km' ? 'គណនីកំពុងរង់ចាំការអនុម័ត ⏳' : 'Account Pending Approval ⏳'}</h2>
                    <p className="text-orange-100 text-lg relative z-10">{lang === 'km' ? 'គណនីរបស់អ្នកកំពុងត្រូវបានពិនិត្យ និងអនុម័តដោយក្រុមការងារ។ សូមរង់ចាំបន្តិចបន្តួច...' : 'Your account is being reviewed and pending approval by our team. Please wait...'}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-600">{lang === 'km' ? 'ប្រសិនបើមានចម្ងល់បន្ថែម សូមទាក់ទងមកយើងខ្ញុំតាមរយៈលេខទូរស័ព្ទ៖ 012 345 678' : 'If you have any questions, please contact us at: 012 345 678'}</p>
                </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-primary to-blue-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3"></div>
                  <h2 className="text-3xl font-bold mb-3 relative z-10 font-moul">សួស្ដីសិស្សានុសិស្ស! 👋</h2>
                  <p className="text-blue-100 text-lg relative z-10">សូមស្វាគមន៍មកកាន់ប្រព័ន្ធ Student Portal។</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">វគ្គសិក្សារបស់ខ្ញុំ (My Courses)</h3>
                      
                      {/* Course 1 */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="flex flex-col sm:flex-row gap-6">
                          <div className="w-20 h-20 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
                            <BookOpen className="w-10 h-10" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                                <h4 className="font-bold text-lg text-gray-900">រចនាក្រាហ្វិកអាជីព (Graphic Design)</h4>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">បញ្ចប់ ១០%</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">រៀនពីមូលដ្ឋានគ្រឹះនៃការរចនា រហូតដល់ការប្រើប្រាស់កម្មវិធី Adobe Photoshop និង Illustrator កម្រិតខ្ពស់។</p>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-gray-500 mt-4 pt-4 border-t border-gray-50">
                                <span>កាលបរិច្ឆេទចាប់ផ្ដើម៖ ០១ មេសា ២០២៤</span>
                                <button className="text-primary hover:text-blue-800 transition">បន្តការសិក្សា →</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Course 2 */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="flex flex-col sm:flex-row gap-6">
                          <div className="w-20 h-20 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
                            <BookOpen className="w-10 h-10" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                                <h4 className="font-bold text-lg text-gray-900">រដ្ឋបាលកុំព្យូទ័រទូទៅ (Microsoft Office)</h4>
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">បញ្ចប់ ១០០%</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">វគ្គសិក្សាគ្របដណ្តប់លើ Word, Excel, និង PowerPoint សម្រាប់ការប្រើប្រាស់ក្នុងការិយាល័យជាក់ស្តែង។</p>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-gray-500 mt-4 pt-4 border-t border-gray-50">
                                <span>បញ្ចប់ការសិក្សា៖ ២៥ ឧសភា ២០២៤</span>
                                <span className="text-emerald-600 flex items-center gap-1"><Award className="w-4 h-4"/> ជោគជ័យ</span>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>

                  <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">វិញ្ញាបនបត្រ (Certificates)</h3>
                      
                      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-200">
                              <Award className="w-8 h-8" />
                          </div>
                          <h4 className="font-bold text-gray-900 mb-2">រដ្ឋបាលកុំព្យូទ័រទូទៅ</h4>
                          <p className="text-xs text-gray-500 mb-6">ទទួលបាននិទ្ទេស: <span className="font-bold text-blue-700">ល្អប្រសើរ (Excellent)</span></p>
                          <button className="w-full py-2.5 px-4 bg-primary hover:bg-blue-800 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-blue-700/20">
                              ទាញយកវិញ្ញាបនបត្រ (PDF)
                          </button>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-300 text-center opacity-70">
                          <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Award className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-gray-600">រចនាក្រាហ្វិកអាជីព</p>
                          <p className="text-xs text-gray-400 mt-1">មិនទាន់បញ្ចប់ការសិក្សា</p>
                      </div>
                  </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Website Live Preview Modal for Admin */}
      <WebsitePreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
      />
    </div>
  );
}
