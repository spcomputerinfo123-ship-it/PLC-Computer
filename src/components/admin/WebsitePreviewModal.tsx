import React, { useState } from 'react';
import { X, Monitor, Smartphone, Tablet, ArrowLeft, RefreshCw, Lock, Globe, ShieldCheck, Sparkles, Wifi, Battery, Signal, Palette, ExternalLink, Laptop } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface WebsitePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BgTheme = 'cyber' | 'studio' | 'aura' | 'grid' | 'emerald' | 'light';
export type PrimaryColorPreset = {
  id: string;
  nameKm: string;
  nameEn: string;
  hex: string;
  classBg: string;
  classText: string;
  classBorder: string;
  ringColor: string;
};

export const COLOR_PRESETS: PrimaryColorPreset[] = [
  { id: 'blue', nameKm: 'ខៀវរ៉ូយ៉ាល់ (Royal Blue)', nameEn: 'Royal Blue', hex: '#1d4ed8', classBg: 'bg-blue-600', classText: 'text-blue-600', classBorder: 'border-blue-600', ringColor: 'ring-blue-500' },
  { id: 'emerald', nameKm: 'បៃតងត្បូង (Emerald Green)', nameEn: 'Emerald Green', hex: '#059669', classBg: 'bg-emerald-600', classText: 'text-emerald-600', classBorder: 'border-emerald-600', ringColor: 'ring-emerald-500' },
  { id: 'violet', nameKm: 'ស្វាយវីអូឡែត (Deep Violet)', nameEn: 'Deep Violet', hex: '#7c3aed', classBg: 'bg-purple-600', classText: 'text-purple-600', classBorder: 'border-purple-600', ringColor: 'ring-purple-500' },
  { id: 'crimson', nameKm: 'ក្រហមឆ្អិន (Crimson Red)', nameEn: 'Crimson Red', hex: '#dc2626', classBg: 'bg-red-600', classText: 'text-red-600', classBorder: 'border-red-600', ringColor: 'ring-red-500' },
  { id: 'amber', nameKm: 'លឿងទង់ដែង (Amber Gold)', nameEn: 'Amber Gold', hex: '#d97706', classBg: 'bg-amber-600', classText: 'text-amber-600', classBorder: 'border-amber-600', ringColor: 'ring-amber-500' },
  { id: 'cyan', nameKm: 'ខៀវស៊ីយ៉ាន (Cyber Cyan)', nameEn: 'Cyber Cyan', hex: '#0891b2', classBg: 'bg-cyan-500', classText: 'text-cyan-500', classBorder: 'border-cyan-500', ringColor: 'ring-cyan-400' }
];

export default function WebsitePreviewModal({ isOpen, onClose }: WebsitePreviewModalProps) {
  const { lang } = useLanguage();
  const [device, setDevice] = useState<'desktop' | 'laptop' | 'tablet' | 'mobile'>('desktop');
  const [bgTheme, setBgTheme] = useState<BgTheme>('cyber');
  const [selectedColor, setSelectedColor] = useState<PrimaryColorPreset>(COLOR_PRESETS[0]);
  const [key, setKey] = useState(0);

  if (!isOpen) return null;

  const getBgStyle = () => {
    switch (bgTheme) {
      case 'cyber':
        return 'bg-slate-950 [background-image:linear-gradient(to_right,rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.1)_1px,transparent_1px)] [background-size:2rem_2rem]';
      case 'aura':
        return 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950';
      case 'grid':
        return 'bg-slate-950 [background-image:linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:2rem_2rem]';
      case 'emerald':
        return 'bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950';
      case 'light':
        return 'bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100';
      case 'studio':
      default:
        return 'bg-slate-950 [background-image:radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]';
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/25 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[160px]"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/25 rounded-full blur-[140px] animate-pulse"></div>
      </div>

      <header className="relative z-10 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md text-white px-4 py-2.5 flex items-center justify-between shadow-2xl shrink-0 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/30 cursor-pointer hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'km' ? 'ត្រឡប់ទៅ Admin' : 'Back to Admin'}</span>
          </button>
          
          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block"></div>
          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50"></span>
            <span className="font-bold text-xs sm:text-sm text-slate-200">
              {lang === 'km' ? 'Live Preview' : 'Live Website Preview'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${device === 'desktop' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              title="Desktop View (Full Screen)"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDevice('laptop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${device === 'laptop' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              title="Laptop View (1024px)"
            >
              <Laptop className="w-4 h-4" />
              <span className="hidden sm:inline">Laptop</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${device === 'tablet' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${device === 'mobile' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <div className="flex items-center bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80 shadow-inner gap-1.5">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider px-1 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden md:inline text-slate-300">{lang === 'km' ? 'ជ្រើសពណ៌:' : 'Color:'}</span>
            </span>
            <div className="flex items-center gap-1.5">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full ${color.classBg} transition-all duration-200 cursor-pointer flex items-center justify-center border border-white/30 hover:scale-110 active:scale-95 ${selectedColor.id === color.id ? `ring-2 ring-offset-2 ring-offset-slate-900 ${color.ringColor} scale-110 shadow-lg` : 'opacity-75 hover:opacity-100'}`}
                  title={lang === 'km' ? color.nameKm : color.nameEn}
                >
                  {selectedColor.id === color.id && <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs animate-in zoom-in-50"></span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700/80"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{lang === 'km' ? 'បើក Tab ថ្មី' : 'New Tab'}</span>
          </a>
          <button
            onClick={() => setKey(prev => prev + 1)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition border border-transparent hover:border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className={`relative z-10 flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 flex justify-center items-center transition-all duration-300 ${getBgStyle()}`}>
        <div
          className={`transition-all duration-500 relative flex flex-col ${
            device === 'desktop'
              ? 'w-full h-full rounded-none shadow-none border-none bg-white'
              : device === 'laptop'
              ? 'w-[1024px] max-w-[1024px] h-[85vh] my-auto rounded-2xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8)] border-[6px] border-slate-800 bg-white overflow-hidden'
              : device === 'tablet'
              ? 'w-[768px] max-w-[768px] h-[85vh] my-auto rounded-[36px] border-[14px] border-slate-800 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9)] bg-white overflow-hidden ring-1 ring-slate-700/60'
              : 'w-[375px] max-w-[375px] h-[80vh] my-auto rounded-[48px] border-[14px] border-slate-900 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.95)] bg-white overflow-hidden ring-1 ring-slate-800'
          }`}
        >
          {device !== 'desktop' && (
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex-1 max-w-sm bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1 flex items-center justify-center gap-2 text-xs text-slate-300 font-mono">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span className="truncate">plc-computer.edu.kh</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 opacity-0 lg:opacity-100">
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
            </div>
          )}

          <div className="flex-1 w-full bg-white relative">
            <iframe
              key={key + selectedColor.id}
              src={`/?preview=true&theme=${selectedColor.id}`}
              className="w-full h-full border-none absolute inset-0"
              title="Preview Window"
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>
          
          {device === 'mobile' && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-300 rounded-full z-50"></div>
          )}
        </div>
      </div>
    </div>
  );
}
